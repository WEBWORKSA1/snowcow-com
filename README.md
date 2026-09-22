# SnowCow.com

Live snow forecasts, ski resort finder, gear & learning guides, and a **free ski-trip quote engine**. It's a static site that runs on the GitHub Pages free plan.

**Live:** https://webworksa1.github.io/snowcow-com/ (custom domain: snowcow.com)

## Structure
```
build.py              # static builder: src/ -> root HTML, sitemap.xml, robots.txt
src/pages/*.html      # page bodies (JSON META header)
src/guides/*.html     # long-form SEO guides -> /guides/
assets/css/style.css  # design system (light/dark, responsive)
assets/js/config.js   # ONE place for AdSense, GA4, donation links, socials, contest date
assets/js/resorts.js  # resort dataset (55+ resorts)
assets/js/main.js     # UI, forms, ads, consent, planner, donate, countdown
assets/js/snow.js     # Open-Meteo live forecasts, Powder Watch, finder, snow report
assets/js/tools.js    # ski/board size, trip budget, resort compare
docs/BUILD-PROMPT.md  # concept, revenue model, phase-wise build prompt, go-live checklist
```

## Edit and rebuild
Edit files in `src/`, then run `python3 build.py`. Commit and push, and GitHub Pages redeploys automatically.

## Monetization switches (`assets/js/config.js`)
- `adsenseClient` / `adsenseSlots` turn on Google AdSense. While they are empty, ad slots show house ads that link to the media kit.
- `donate.*` holds the PayPal, Stripe, Buy Me a Coffee, Ko-fi and Patreon links. While they are empty, the pledge form is used instead.
- `ga4` is the Google Analytics ID. Analytics loads only after the visitor gives cookie consent.

## Forms
Every form posts through FormSubmit to a single owner inbox. The address is stored encoded and never appears in the page source. The first submission sends a one-time activation email that must be confirmed.

## Legal
The mascot, design and copy are original. The trademark and copyright disclosure is in `disclaimer.html`. Forecast data comes from Open-Meteo under CC BY 4.0.
