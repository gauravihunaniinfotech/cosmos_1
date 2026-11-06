# COSMO'S Heating & Air Conditioning — Homepage Redesign

Files: `index.html`, `style.css`, `script.js`, `assets/images/`. Plain HTML/CSS/vanilla JS.

## Run at http://localhost:5500
**VS Code Live Server:** install the *Live Server* extension → right-click `index.html` → **Open with Live Server** (port 5500 preconfigured in `.vscode/settings.json`).
**Or Python:** `python3 serve.py` (Windows: `python serve.py`) → open http://localhost:5500 in Chrome.

## Images
Photos in `assets/images/` were cropped from the original-site screenshot (low resolution, used as offline fallbacks).
When online, `script.js` automatically swaps each one for the full-resolution original hosted on the current site's image CDN (`data-hires` attributes in `index.html`).
For a fully self-hosted site, save the original files from your Wix media library into `assets/images/` and update the `src` attributes. The hero fallback is an illustration until the real skyline photo loads.

## Before launch
- The three testimonial cards are placeholders — paste real Google reviews.
- The contact form is demo-only; set `data-endpoint` on `<form id="lead-form">` to a Formspree/other JSON endpoint to receive leads.
- Real details used: (702) 960-5555, service@cosmosaclv.com, 10161 W Park Run Dr #150 Las Vegas NV 89145, License #0095036, 5.0 / 10 Google reviews, Housecall Pro booking link.
