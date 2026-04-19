/**
 * Netlify Function: GET /.netlify/functions/events[?limit=N]
 * Fetches the public Google Calendar iCal feed, parses upcoming events,
 * and returns them as JSON. Running this at request time means the site
 * never needs a daily rebuild just to refresh event data.
 */

const CALENDAR_ICAL_URL =
  'https://calendar.google.com/calendar/ical/' +
  'e647b5d49505dadc3c028b0b4d60661e276bf6801f2ba3f1449b0b9e24a72e21%40group.calendar.google.com' +
  '/public/basic.ics';

/** Undo iCal line folding (CRLF + whitespace = continuation of previous line). */
function unfoldIcal(text) {
  return text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
}

/** Parse a DTSTART value (with optional params) into a JS Date. */
function parseIcalDate(value, params = '') {
  if (params.includes('VALUE=DATE')) {
    return new Date(`${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}T00:00:00`);
  }
  if (value.endsWith('Z')) {
    return new Date(value.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
      '$1-$2-$3T$4:$5:$6Z'
    ));
  }
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`);
  return null;
}

function parseIcalEvents(icalText) {
  const text = unfoldIcal(icalText);
  const events = [];
  const unescape = s => s
    .replace(/\\n/g, ' ').replace(/\\,/g, ',')
    .replace(/\\;/g, ';').replace(/\\\\/g, '\\');

  for (const [, block] of text.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)) {
    const props = {};
    for (const line of block.split(/\r?\n/)) {
      const ci = line.indexOf(':');
      if (ci === -1) continue;
      const [key, ...paramParts] = line.slice(0, ci).split(';');
      props[key.trim()] = { value: line.slice(ci + 1).trim(), params: paramParts.join(';') };
    }

    const dtStart = props['DTSTART'];
    if (!dtStart) continue;
    const start = parseIcalDate(dtStart.value, dtStart.params);
    if (!start) continue;

    events.push({
      start: start.toISOString(),
      title:       unescape(props['SUMMARY']?.value     || ''),
      description: unescape(props['DESCRIPTION']?.value || ''),
      location:    unescape(props['LOCATION']?.value    || ''),
      url:         unescape(props['URL']?.value         || ''),
    });
  }
  return events;
}

export default async (req) => {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);

  try {
    const res = await fetch(CALENDAR_ICAL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const icalText = await res.text();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = parseIcalEvents(icalText)
      .filter(e => new Date(e.start) >= today)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, limit);

    return new Response(JSON.stringify(events), {
      headers: {
        'Content-Type': 'application/json',
        // Cache at the CDN edge for 1 hour so every visitor in the same hour
        // doesn't each trigger a new iCal fetch.
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
