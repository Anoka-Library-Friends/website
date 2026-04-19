// events-loader.js — dynamically renders event lists from the Netlify Function.
// Any <ul class="event-list" data-src="URL"> on the page gets populated on load.

(function () {
  'use strict';

  var MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var LOCATION_ICON =
    '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"' +
    ' width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="event-location__icon">' +
    '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' +
    'm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>' +
    '</svg>';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderEvents(events) {
    if (!events.length) {
      return '<li class="event-item"><div class="event-details">' +
        '<p>No upcoming events at this time. Check back soon, or browse the calendar above!</p>' +
        '</div></li>';
    }
    return events.map(function (ev) {
      var start = new Date(ev.start);
      var month = MONTHS[start.getMonth()];
      var day   = start.getDate();
      var title = escapeHtml(ev.title);
      var titleHtml = ev.url
        ? '<a href="' + escapeHtml(ev.url) + '">' + title + '</a>'
        : title;
      var descHtml = ev.description
        ? '\n              <p class="event-desc">' + escapeHtml(ev.description) + '</p>'
        : '';
      var locHtml = ev.location
        ? '\n              <p class="event-desc event-location">' + LOCATION_ICON + escapeHtml(ev.location) + '</p>'
        : '';
      return '<li class="event-item">\n' +
        '            <div class="event-date" aria-hidden="true">\n' +
        '              <span class="event-date__month">' + month + '</span>\n' +
        '              <span class="event-date__day">'   + day   + '</span>\n' +
        '            </div>\n' +
        '            <div class="event-details">\n' +
        '              <h3 class="event-title">' + titleHtml + '</h3>' + descHtml + locHtml + '\n' +
        '            </div>\n' +
        '          </li>';
    }).join('\n');
  }

  document.querySelectorAll('.event-list[data-src]').forEach(function (list) {
    fetch(list.dataset.src)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (events) {
        list.innerHTML = renderEvents(events);
      })
      .catch(function () {
        // Network or parse error — leave whatever static fallback is already rendered.
      });
  });
}());
