# Xiang Ji / 纪祥 · Arthur

Bilingual academic homepage: https://arthurji-cuhk.github.io/website/

Static HTML, CSS and JavaScript; no installation or build step required.
GitHub Pages deploys the `main` branch, repository root.

- `index.html`, `content.js`: bilingual professional profile and publications.
- `styles.css`, `refinements.css`, `app.js`: visual design, language/theme controls, scroll voyage and piano.
- `research.css`, `research.js`: cohort graphics and a synthetic DemScreen time-window explorer.
- `numbers.js`: viewport-triggered metric counters with a reduced-motion mode.
- `gallery.css`, `gallery.js`: keyboard-accessible, three-panel personal-photo curtains.
- `visitor-counter.js`, `visitor-globe.js`, `config.js`: aggregate page-view totals and a local interactive globe.

There is no background music or automatic audio, and no third-party font request.
Personal photos are resized and contain no EXIF/GPS metadata. The piano generates
individual notes locally only after interaction. Reduced-motion preferences are respected.

The visitor section reads aggregate page-view totals from the homepage's Cloudflare
Worker every 60 seconds while the page is visible. It does not reload the globe or
increase the counter when it refreshes. The local globe uses Natural Earth geography
and lights only recorded countries or regions.

The Worker counts one view per loaded page using a short-lived random request key
to deduplicate retries, and Cloudflare's country/region signal. The counter does
not read or retain raw IPs or set visitor identification cookies. DNT, GPC and the
footer opt-out stop new recording; public statistics remain visible.

Research prototypes are not medical diagnostic tools. Demo activity values are
synthetic. No private DemScreen app, patient files, or manuscript is published.
The 213-woman, two-province cohort and 200+ older-adult home programme-scale deployment
figures were provided by the researcher; the latter is not a paper-specific evaluation
sample. The Hong Kong map illustrates geography, not household locations. Its outline
is derived from Natural Earth public-domain data; attribution is embedded in the SVG.

Publication titles and author order remain English in both language modes. Linked lab
projects are attributed to the lab and distinguished from personal publications.
Copyright in profile text and photographs remains with the respective owners.
