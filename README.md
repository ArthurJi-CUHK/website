# Xiang Ji / 纪祥 · Arthur

Bilingual academic homepage: https://arthurji-cuhk.github.io/website/

Static HTML, CSS and JavaScript; no installation or build step required.
GitHub Pages deploys the `main` branch, repository root.

- `index.html`, `content.js`: bilingual professional profile and publications.
- `styles.css`, `refinements.css`, `app.js`: visual design, language/theme controls, scroll voyage and piano.
- `research.css`, `research.js`: cohort graphics and a synthetic DemScreen time-window explorer.
- `numbers.js`: viewport-triggered metric counters with a reduced-motion mode.
- `gallery.css`, `gallery.js`: keyboard-accessible, three-panel personal-photo curtains.
- `analytics.js`, `config.js`: consent-gated Cloudflare Web Analytics. The site identifier is public, not an API key.

There is no background music or automatic audio, and no third-party font request.
Personal photos are resized and contain no EXIF/GPS metadata. The piano generates
individual notes locally only after interaction. Reduced-motion preferences are respected.

Cloudflare Web Analytics is optional and starts only after a visitor opts in through
the footer privacy dialog. Do Not Track / Global Privacy Control suppress it. Owner
statistics are private to the Cloudflare dashboard. A loaded beacon may still send a
final event during withdrawal/reload.

The visitor section reads public MapMyVisitors totals from a read-only Cloudflare
Worker every 60 seconds while the page is visible. The country/region count is
for the provider’s displayed report period. If the endpoint is unavailable, the
page can show a dated, verified snapshot. The local interactive globe uses Natural
Earth geography and lights only regions confirmed by the provider.

Recording a visit with the separate MapMyVisitors widget is optional in the
footer privacy dialog. The isolated widget processes IP and approximate location.
Reading or refreshing the public figures does not reload the recording widget.

Research prototypes are not medical diagnostic tools. Demo activity values are
synthetic. No private DemScreen app, patient files, or manuscript is published.
The 213-woman, two-province cohort and 200+ older-adult home programme-scale deployment
figures were provided by the researcher; the latter is not a paper-specific evaluation
sample. The Hong Kong map illustrates geography, not household locations. Its outline
is derived from Natural Earth public-domain data; attribution is embedded in the SVG.

Publication titles and author order remain English in both language modes. Linked lab
projects are attributed to the lab and distinguished from personal publications.
Copyright in profile text and photographs remains with the respective owners.
