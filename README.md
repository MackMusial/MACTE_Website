# MACTE Website

Current construction build located here
https://mackmusial.github.io/MACTE_Website/


Static website for the **Michigan Association of Colleges for Teacher Education (MACTE)**,
a not-for-profit AACTE state affiliate. Built as plain HTML/CSS/JS so it can be hosted
anywhere without a build step — Netlify, SVSU web hosting, or elsewhere.

Modeled in tone and structure after [mytacte.org](https://mytacte.org) (Texas's equivalent
association), adapted for Michigan.

## Status

All content is currently **placeholder text** — names, dates, dues amounts, and documents
are examples only and need to be swapped for real MACTE information before launch.

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
assets/             Logo (placeholder SVG) and other images
documents/          PDFs referenced by bylaws.html and resources.html (see documents/README.md)
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

## Replacing placeholder content

1. **Text/data**: search each page for example names, dates, and dollar amounts and replace
   with real MACTE information (officers, dues, meeting schedule, award history).
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

- **Netlify**: drag-and-drop the folder or connect the GitHub repo — no build command needed
  (`netlify.toml` already sets `publish = "."`). The contact form on `contact.html` uses
  [Netlify Forms](https://docs.netlify.com/forms/setup/) and will work automatically once
  deployed there (no extra setup).
- **SVSU hosting**: if hosted elsewhere, the contact form will need a real backend (e.g. a
  mailto fallback, a service like Formspree, or a server-side script) since Netlify Forms
  only works on Netlify.
- **Domain (GoDaddy)**: once a host is chosen, point macte.us's DNS at that host (a CNAME/ALIAS
  for Netlify, or the appropriate A record for SVSU's server).
