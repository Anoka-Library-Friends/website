# Netlify Setup & Ownership Handoff Plan

Reference for deploying the FACL site to Netlify and later transferring ownership to a long-term FACL custodian (e.g., Betsy).

## What Netlify is (short version)

Netlify hosts the website. It watches the GitHub repo — whenever a commit lands on `main`, Netlify runs `npm ci && npm run build` (per `netlify.toml`) and publishes the `pages/` folder to the live URL. It also runs two services the site depends on:

- **Netlify Identity** — login system for blog editors
- **Git Gateway** — lets editors commit through Netlify without needing GitHub accounts

## Who needs what account

| Person | Netlify account? | GitHub account? |
|---|---|---|
| Site owner (you, then Betsy) | Yes | Yes — to own/admin the repo |
| Blog / content editors | Yes (email invite only) | **No** |

Git Gateway is the reason editors don't need GitHub. Netlify commits to the repo on their behalf using its own credentials. Private repo is fine.

## Phase 1 — Initial setup (done by me/you)

1. **Create a Netlify account** at netlify.com (use a long-term email you control, or a FACL shared inbox if one exists)
2. **Connect the GitHub repo**
   - "Add new site" → "Import from Git" → GitHub → select `anoka-library-friends`
   - Netlify auto-detects `netlify.toml` — no config needed
3. **Verify first deploy succeeds** — site should load at `<random-name>.netlify.app`
4. **Enable Netlify Identity**
   - Site Settings → Identity → Enable Identity
   - Registration preferences → **Invite only**
   - External providers → leave disabled (editors use email/password)
5. **Enable Git Gateway**
   - Site Settings → Identity → Services → Git Gateway → Enable
   - This is what authorizes Netlify to commit to the private repo on editors' behalf
6. **Invite a test editor** (yourself with a second email, or Betsy)
   - Identity tab → Invite users → enter email
   - Accept invite, set password, log in at `yoursite.netlify.app/admin`
7. **Test publishing** — create a dummy blog post via the CMS, confirm:
   - Commit appears in GitHub
   - Netlify rebuilds
   - Post is live on the site
   - Delete the dummy post
8. **Custom domain** (when FACL has one picked)
   - Domain settings → Add custom domain
   - Point registrar's DNS to Netlify (A record or Netlify DNS)
   - Netlify provisions free HTTPS via Let's Encrypt automatically

## Phase 2 — Fix the stale comment in admin/index.html

`pages/admin/index.html` currently has setup instructions that describe the wrong backend (the `github` backend, not `git-gateway`). Update it so future maintainers aren't misled. Specifically:

- Remove "log in via GitHub OAuth"
- Remove step 3 ("enable GitHub OAuth")
- Remove step 4 ("Add collaborators as GitHub repo Write collaborators")
- Replace with: editors are invited via Netlify Identity email and use email/password

## Phase 3 — Handoff to Betsy (or long-term owner)

Two ways to transfer. Pick one:

### Option A — Transfer the site to Betsy's Netlify account (cleaner)

1. Betsy creates her own Netlify account
2. You: Site Settings → General → Danger zone → **Transfer site**
3. Enter Betsy's account/team, confirm
4. Betsy accepts the transfer
5. Betsy re-links GitHub (the repo connection is tied to whoever authorized Netlify — she'll need to re-auth so deploys keep firing)
6. You can remove your Netlify account or stay on as a backup collaborator

### Option B — Add Betsy as team Owner, then leave

1. Team Settings → Members → Invite → role: **Owner**
2. Betsy accepts
3. You remove yourself from the team
4. Site ownership effectively transferred, GitHub link stays intact

**Option A** is the typical "giving the keys" handoff. **Option B** is useful if FACL wants the site to live under a shared team rather than any one person's account.

## Things that carry over during transfer

- Netlify Identity users (blog editors) — no re-invite needed
- Custom domain + HTTPS cert
- Deploy history
- Environment variables (none currently)
- `netlify.toml` build config (lives in the repo, not the Netlify account)

## Things that DON'T carry over automatically

- **GitHub repo authorization** — new owner typically re-links
- **Billing** — follows the account. Free tier should be plenty for this site (100GB bandwidth/mo, 300 build minutes/mo)
- **Email notifications for deploy failures** — new owner sets their own

## Billing note

Netlify's free tier covers:
- 100 GB bandwidth / month
- 300 build minutes / month
- Netlify Identity: 1,000 active users free
- Git Gateway: free

A small nonprofit site like FACL's will not come close to these limits. No paid plan needed.

## Rollback / disaster recovery

The site source lives entirely in GitHub. If the Netlify account is ever lost or compromised:
- Create a new Netlify account
- Connect it to the same GitHub repo
- Re-enable Identity + Git Gateway
- Re-invite editors
- Point the domain at the new site

Nothing is stored only in Netlify that can't be recreated from the repo (except editor accounts, which are just emails).
