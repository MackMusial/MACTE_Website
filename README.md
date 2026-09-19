# MACTE Website

Current construction build located here
https://mackmusial.github.io/MACTE_Website/


Static website for the **Michigan Association of Colleges for Teacher Education (MACTE)**,
a not-for-profit AACTE state affiliate. Built as plain HTML/CSS/JS so it can be hosted
anywhere without a build step — Netlify, SVSU web hosting, or elsewhere.

Modeled in tone and structure after [mytacte.org](https://mytacte.org) (Texas's equivalent
association), adapted for Michigan.

**Setting this up with MACTE for the first time? Go straight to the
[Setup walkthrough](#setup-walkthrough-doing-this-with-macte).**

## Contents

- [Structure](#structure) — what each file does
- [Local preview](#local-preview) — running the site on your machine
- [Setup walkthrough](#setup-walkthrough-doing-this-with-macte) — **one-time setup with MACTE**
  - [Everything Google this site touches](#everything-google-this-site-touches)
  - [Part 1 — Pick the Google account first](#part-1--pick-the-google-account-first)
  - [Part 2 — Contact form](#part-2--contact-form-the-one-that-isnt-built-yet)
  - [Part 3 — The published CSV sheets](#part-3--the-two-published-csv-sheets-meetings--deans)
  - [Part 4 — Hosting and domain](#part-4--hosting-and-domain)
  - [If something breaks](#if-something-breaks)
- [Day-to-day maintenance](#day-to-day-maintenance-after-setup) — ongoing behavior
- [Replacing placeholder content](#replacing-placeholder-content)
- [Hosting](#hosting)

## Structure

```
index.html         Home
executive-board.html Officers, committees, past presidents, deans directory
meetings.html       Meeting dates
awards.html         Awards program, nominations, past recipients
bylaws.html         Constitution & bylaws downloads
resources.html      Archived articles, external links, abbreviations glossary
membership.html     Membership benefits, dues, how to join/renew
contact.html        Contact info + message form
css/styles.css      All site styling (single stylesheet, CSS variables for theme colors)
js/main.js          Mobile nav toggle + footer year
js/csv-utils.js     Shared CSV parser for pages that pull data from a published Google Sheet
js/meetings-data.js Fetches/parses the meetings Google Sheet, shared by index.html and meetings.html
js/meetings.js      Renders the full meeting table on meetings.html
js/index-upcoming.js Renders the "Upcoming" preview card on index.html
js/contact-form.js  Posts the contact.html form to the Apps Script endpoint
assets/             Logo (placeholder SVG) and other images
documents/          PDFs referenced by bylaws.html and resources.html (see documents/README.md)
apps-script/        Copy of the Google Apps Script deployed as the contact form backend
```

Each page repeats the same header/nav and footer markup (no build step = no templating),
so when editing shared header/footer content, update it across all 8 HTML files.

## Local preview

No build tools required — just open `index.html` in a browser, or serve the folder locally:

```bash
# from the project folder
python -m http.server 8000
# then visit http://localhost:8000
```

## Setup walkthrough (doing this with MACTE)

Everything below needs to be done **once**, sitting with whoever from MACTE controls the
association's accounts. After this, officers maintain the site by editing spreadsheets and
never touch code. Work through the parts in order — Part 1 is a prerequisite for the rest.

### Everything Google this site touches

| Google service | Used for | Needs setup? |
|---|---|---|
| Google Sheets | Meeting dates, deans directory, contact form submissions | Yes — Parts 2 and 3 |
| Google Apps Script | The contact form backend that writes into the submissions sheet | Yes — Part 2 |
| Gmail (`MailApp`) | Emailing a notification whenever the contact form is submitted | No — comes with the script |
| Google Fonts | The site's two typefaces (Source Serif 4, Inter) on all 8 pages | No — no account, nothing to configure |

There is **no** Google Analytics, Tag Manager, or reCAPTCHA on the site right now. If MACTE
asks for visitor stats later, that's a separate decision — Netlify has built-in analytics that
doesn't require adding Google tracking to every page.

Google Fonts needs no account, but it does mean every visitor's browser makes a request to
`fonts.googleapis.com`. If MACTE ever wants zero third-party requests, the two fonts can be
downloaded into `assets/` and served from the site instead. Not urgent.

### The three sheets at a glance

| What | Direction | Sheet headers (order matters) | URL lives in |
|---|---|---|---|
| Meeting dates | Site **reads** sheet | `Date, Time, Location, Focus` | `js/meetings-data.js` → `MEETINGS_SHEET_CSV_URL` |
| Deans directory | Site **reads** sheet | `Institution, Dean / Director, Email, Phone` | `js/deans-data.js` → `DEANS_SHEET_CSV_URL` |
| Contact form | Site **writes** to sheet | `Timestamp, Name, Email, Institution, Message` | `js/contact-form.js` → `CONTACT_ENDPOINT_URL` |

The first two are plain "publish to web" CSV links (Part 3). The third needs an Apps Script
because a website can't write into a spreadsheet without one (Part 2).

**Recommended: keep contact submissions in its own separate spreadsheet.** Meetings and deans
can share one spreadsheet as two tabs if that's easier for officers to find, but submissions
should stand alone for two reasons:

- Share access is per-spreadsheet, so combining them means every officer who edits meeting
  dates can also read everyone's contact messages.
- Publishing is per-tab, but the **"Entire document"** option in that dialog is one wrong click
  away and would publish the submissions tab — names, emails, and messages — to the open web.

Separate spreadsheets make that mistake impossible rather than merely unlikely.

### Part 1 — Pick the Google account first

**Do not skip this.** Every sheet and script below must be owned by an account **MACTE controls
as an organization**, not an officer's personal or university account.

- A free `macte...@gmail.com` account is fine. A Google Workspace account is better.
- Whoever sets this up should not be the only person with the password — get it into whatever
  MACTE uses for shared credentials, or at minimum give a second officer recovery access.

Why it matters: officers rotate annually. If these live in a departing officer's account, the
meeting dates stop updating and **contact form submissions are lost with no error shown on the
site**. Moving them later means redoing every step below.

### Part 2 — Contact form (the one that isn't built yet)

This is the only part that isn't already live. Takes about 15 minutes.

**2a. Create the submissions sheet**

1. Signed in as the MACTE account, create a new Google Sheet named something like
   *MACTE Contact Form Submissions*.
2. Rename the first tab to exactly `Submissions` (bottom-left tab, double-click to rename).
   The script looks for this name.
3. In row 1, enter these five headers, one per column:
   `Timestamp` · `Name` · `Email` · `Institution` · `Message`

**2b. Add the script**

4. In that sheet: **Extensions → Apps Script**. A new tab opens with an empty `Code.gs`.
5. Delete the placeholder `function myFunction() {}` and paste in the entire contents of
   [`apps-script/contact-form.gs`](apps-script/contact-form.gs) from this repo.
6. If MACTE's real contact email isn't `info@macte.us`, update `NOTIFY_EMAIL` near the top.
7. Click the save icon.

**2c. Deploy it as a web app**

8. **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
9. Set **Execute as: Me** and **Who has access: Anyone**. Both matter — "Anyone" is what lets
   a visitor's browser submit without a Google login. ("Anyone" can run the script; it does
   not give anyone access to the spreadsheet.)
10. Click **Deploy**, then **Authorize access** and pick the MACTE account.
11. **Expect a scary warning here.** Google shows "Google hasn't verified this app" because
    it's a private script. Click **Advanced → Go to (project name) (unsafe)** → **Allow**.
    This is normal for your own Apps Script and is the step that most often stalls people.
12. Copy the **Web app URL** it gives you. It ends in `/exec`.

**2d. Connect the site**

13. Open [`js/contact-form.js`](js/contact-form.js) and paste that URL between the quotes on
    line 7: `const CONTACT_ENDPOINT_URL = "https://script.google.com/.../exec";`
14. Commit and push. Netlify redeploys automatically.

**2e. Test it before you walk away**

15. Open the live contact page, submit a real test message, and confirm all three:
    a new row appears in the sheet, a green confirmation shows on the page, and the
    notification email arrives. Delete the test row afterward.

### Part 3 — The two published CSV sheets (meetings + deans)

These already work, but they're published from whatever account created them. If that isn't
the MACTE account from Part 1, recreate them under it now rather than later.

Run through 3a–3d once for the **meetings** sheet, then again for the **deans** sheet. The
only difference between them is the header row and which JS file the URL goes into.

**3a. Set up the sheet**

1. Signed in as the MACTE account, create the sheet (or open the existing one).
2. Put the headers in **row 1**, one per column, in exactly this order:
   - Meetings: `Date` · `Time` · `Location` · `Focus`
   - Deans: `Institution` · `Dean / Director` · `Email` · `Phone`
3. Enter one record per row below it. Leave no completely empty column between them.

Three rules to pass along to whoever maintains these, because breaking them breaks the site:

- **Don't reorder, insert, or delete columns.** The site reads columns by *position*, not by
  header name. Renaming a header is harmless; moving a column shifts every value into the
  wrong place on the site.
- **Always keep exactly one header row.** The site drops row 1 automatically. Delete it and
  you lose your first real record; add a second title row and it shows up as data.
- **Keep all the data on one tab** — the published link points at a single tab.

Safe to do freely: commas and quotes inside a cell, line breaks inside a cell (Alt+Enter),
blank rows between records, any date format you like, and adding/removing rows. The site's
CSV parser handles all of those.

**3b. Publish the tab to the web**

4. **File → Share → Publish to web.**
5. In the **Link** tab of that dialog, use the dropdowns to select:
   - Left dropdown: the **specific tab** by name — *not* "Entire document."
   - Right dropdown: **Comma-separated values (.csv)** — *not* "Web page."
6. Click **Publish** and confirm **OK**.
7. Copy the link it produces. It should look like this, and must end in `output=csv`:
   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1vR.../pub?gid=0&single=true&output=csv
   ```
   If your link ends in `/pubhtml` you picked "Web page" in step 5 — redo it as CSV.

> **Publishing is not the same as sharing.** "Publish to web" is what lets the *website* read
> the data. It does not let officers edit the sheet, and Share access does not make the site
> work. You need both, which is step 3d.

**3c. Paste the link into the site**

8. Open the matching file and replace the URL between the quotes:
   - Meetings → [`js/meetings-data.js`](js/meetings-data.js), `MEETINGS_SHEET_CSV_URL`
   - Deans → [`js/deans-data.js`](js/deans-data.js), `DEANS_SHEET_CSV_URL`
9. Commit and push, then check the live page.

**3d. Give the officers edit access**

10. **Share** → add the officers who'll maintain it as **Editors**. This is the step that
    means nobody has to ask you to update a meeting date again.

**Two things that will look like bugs but aren't:**

- **Edits take a few minutes to appear.** Google caches the published CSV — allow up to about
  5 minutes and a browser refresh before assuming something is broken.
- **"Stop publishing" silently empties the site.** If anyone clicks it in that dialog, the
  meetings table shows an error notice and the homepage card falls back to placeholder text.
  Re-publishing generates a **new** URL that has to go back into the JS file.

Finally, a privacy note worth saying out loud in the room: publishing to web makes that tab
readable by anyone with the link, and it's not indexed-proof. That's fine for meeting dates,
but the deans directory holds names, emails, and phone numbers — confirm MACTE is comfortable
with those being public before publishing, and keep anything sensitive out of these sheets.

### Part 4 — Hosting and domain

1. Connect the GitHub repo to Netlify (or drag-drop the folder). No build command —
   `netlify.toml` already sets `publish = "."`.
2. In GoDaddy, point `macte.us` DNS at Netlify per the records Netlify shows you.
3. Netlify provisions HTTPS automatically once DNS resolves. Give it up to an hour.

Netlify should also be under a MACTE-owned login, for the same reason as Part 1.

### If something breaks

| Symptom | Cause |
|---|---|
| Form says "isn't connected yet" | `CONTACT_ENDPOINT_URL` is still blank — Part 2d |
| Form says "couldn't be sent" | Script not deployed as "Anyone", or the `Submissions` tab was renamed |
| Rows save but no email arrives | Gmail send quota (100/day free, 1500/day Workspace), or `NOTIFY_EMAIL` is wrong |
| Script edits have no effect | Saving isn't deploying — **Deploy → Manage deployments → edit (pencil) → New version** |
| Meeting dates or deans table empty | Sheet was recreated and needs republishing; the old CSV URL is dead |

## Day-to-day maintenance (after setup)

One-time setup is the walkthrough above. This is the ongoing behavior worth knowing.

### Meeting dates

Officers add/edit/remove rows in the meetings sheet — no code changes, no redeploy.

- The homepage "Upcoming" card shows the **first 3 rows** of the sheet; `meetings.html` shows
  all of them. Neither page hides past dates automatically, so **delete meetings once they've
  passed** or the homepage keeps promoting them.
- Rows display in sheet order, so keep them sorted chronologically.
- If the sheet is unreachable, `meetings.html` shows an error notice and the homepage card
  fails silently, keeping the placeholder text in `index.html`.

### Deans directory

Same deal — edit rows in the deans sheet and `executive-board.html` picks them up on next load.

### Contact form

- The form is host-independent on purpose: it posts to Apps Script rather than using Netlify
  Forms, so moving hosts doesn't break it and the submissions belong to MACTE rather than
  living in a vendor dashboard. **Don't "simplify" it back to Netlify Forms.**
- [`apps-script/contact-form.gs`](apps-script/contact-form.gs) is a *copy* kept for version
  control. The code that actually runs is the one pasted into the Apps Script editor in
  Google, so changes have to be made in both places.
- Spam control is a hidden honeypot field the script checks. If spam becomes a problem, add
  Cloudflare Turnstile or reCAPTCHA rather than removing the form.
- Two constraints that aren't obvious from reading the code: the browser must send the form as
  `FormData` (Apps Script can't answer a CORS preflight, so a JSON content-type fails), and
  the `Submissions` tab name is hardcoded in the script.

## Replacing placeholder content

1. **Text/data**: search each page for example names, dates, and dollar amounts and replace
   with real MACTE information (officers, dues, award history). Meeting dates are handled via
   the Google Sheet described above, not by editing HTML directly.
2. **Documents**: drop real PDFs into `documents/` using the filenames already linked
   (see `documents/README.md`), or update the `href` values if using different filenames.
3. **Logo**: the real MACTE logo (Michigan state silhouette + wordmark) is already in place in
   `assets/`. Files available:
   - `macte-icon-white.png` / `macte-logo-full-white.png` — white reversed versions for dark
     backgrounds (used in the nav bar and footer)
   - `macte-icon.png` / `macte-icon-96.png` — navy-on-white icon for light backgrounds
   - `macte-logo-full.png` — full navy-on-white lockup (icon + wordmark), for print/letterhead use
   - `favicon-32.png` / `apple-touch-icon.png` — browser tab and mobile home-screen icons
   If MACTE provides an updated/vector logo later, regenerate these the same way (crop to content,
   then a light/dark variant of each) rather than just swapping one file, since several pages
   reference the different variants for different backgrounds.
4. **Contact email/address**: update the placeholder `info@macte.us` and mailing address in
   `contact.html` and in the footer block on every page.

## Hosting

Setup steps are in [Part 4](#part-4--hosting-and-domain) above. In short: Netlify is the
planned host, connected to the GitHub repo with no build command (`netlify.toml` sets
`publish = "."`), with `macte.us` pointed at it from GoDaddy.

Nothing on the site depends on Netlify specifically — it's plain static files, and the contact
form deliberately routes through Apps Script rather than Netlify Forms — so moving to SVSU
hosting or anywhere else later is a DNS change, not a rebuild.
