# SnowCow.com — Concept, Revenue Model & Phase-Wise Build Prompt

## 1. The idea (and why it wins)

**SnowCow.com = a global snow-travel hub**: live snow forecasts + resort finder + gear/learning guides + a **free ski-trip quote engine** (lead generation) — with a friendly original cow mascot as the brand hook.

### Options scored (1–5; higher is better)

| Concept | AdSense CPM | Lead value | YouTube fit | Sponsorship | Search demand | Global reach | **Total** |
|---|---|---|---|---|---|---|---|
| **Ski/snowboard travel + snow forecasts hub** | 4 | 5 | 5 | 5 | 5 | 5 | **29** |
| Snow-removal / plowing contractor lead directory | 3 | 5 | 2 | 3 | 4 | 2 | 19 |
| Soft-serve / frozen dessert brand/blog | 2 | 1 | 3 | 2 | 3 | 4 | 15 |
| Kids' cartoon cow brand | 1 (COPPA limits ads) | 1 | 4 | 2 | 2 | 4 | 14 |

**Why the ski hub wins:** travel, insurance and outdoor-gear ads pay above-average CPMs; trip-quote leads sell to tour operators/travel agencies (CPL or rev-share); gear has affiliate programmes; resorts, passes and brands buy sponsorship; video tutorials are a huge YouTube category. The name “Snow” + a memorable mascot works worldwide.

**Main risk:** seasonality (traffic peaks Nov–Mar in the north). Mitigation: Southern-Hemisphere resorts (Jun–Oct), evergreen gear/learning content, summer “pass sale” content, and the Phase 7 snow-removal expansion.

### Revenue stack
1. **Lead generation** (primary): multi-step trip-quote form → sell leads to ski travel specialists (pay-per-lead or commission share). B2B “lead partner” programme page included.
2. **Google AdSense**: leaderboard, in-article, sidebar and footer slots pre-wired (one config line to activate).
3. **YouTube**: lite embeds on video hub, homepage and guides; channel link from config; video submissions feed content + contests.
4. **Affiliate**: gear, rentals, lift tickets, insurance (disclosure already in place).
5. **Sponsorship & direct ads**: media-kit page with packages; unsold ad slots automatically become house ads pointing to it.
6. **Donations/supporters**: tiers, one-time/monthly, goal bar, allocation to operations / promotions / hiring / contests & prizes; payment links from config; pledge form fallback.
7. **Contests**: sponsor-able photo contest with prizes → list building + sponsor revenue.
8. **Exit/asset value**: top banner on every page routes domain/website/sponsor/partner interest to web.works/contact.

---

## 2. Competitive research summary (40 sites reviewed)

OnTheSnow, Snow-Forecast, OpenSnow, Skiresort, Ski Mag, POWDER, SNOWBOARDER, evo, Ski.com, Liftopia, Epic Pass, Ikon Pass, SnowPak, ZRankings, J2Ski, WhereToSkiAndSnowboard, snowHeads, Crystal Ski, Mountain Collective, Backcountry.com, BLISTER, Newschoolers, Teton Gravity Research, NSAA, Ski Utah, Colorado Ski Country, Snow.com, iGluski, Ski Solutions, bergfex, SnowJapan, Weathertoski, Powderhounds, Lift Blog, SnowBrains, Unofficial Networks, Protect Our Winters, Ski Club of Great Britain, Club Med, Red Bull.

**Features adopted:** live forecast widgets & snowfall leaderboards; resort finder with region/pass/style filters; resort comparison; unit toggle (cm/in, °C/°F); favourites (“My Snow”); powder-alert signup; multi-step quote form with trust signals and sticky CTA; size calculators; buyer’s guides with buy-vs-rent tables; learning roadmap + safety; video hub; contests with official rules; membership/donation tiers; media kit; exit-intent lead magnet; mega-footer; dark mode; FAQ schema.

---

## 3. Phase-wise build prompt (reusable with any AI or developer)

> Copy each phase as a prompt. Every phase must keep these **global rules**:
> - Static HTML/CSS/vanilla JS only, deployable on **GitHub Pages free plan** (no server code, no build step on the host).
> - Mobile-first, responsive, accessible (WCAG AA), light/dark theme, fast (no frameworks, lazy video embeds).
> - **Top of every page:** a banner linking to `https://web.works/contact` reading “Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership”.
> - **One inbox only** for every form/contact. It must **never appear** in HTML, text or links — store it encoded in JS config and assemble only at submit/click time.
> - Original brand, copy and mascot only. No third-party logos. Include trademark & copyright disclosure.

### Phase 1 — Foundation & brand
“Create a static site skeleton for SnowCow.com: `build.py` that wraps `src/pages/*.html` and `src/guides/*.html` in a shared layout (top interest banner, sticky header with nav + ‘Free Trip Quote’ CTA, dark-mode toggle, mobile menu, newsletter band, 5-column footer with trademark disclosure). Design tokens: navy #0b2545, alpine blue #1f6feb, CTA orange #ff5a36, gold #ffb703; fonts Barlow Condensed (headings) + Inter (body). Create an original SVG cow mascot wearing goggles and a beanie. Generate sitemap.xml, robots.txt, manifest, icons, OG image, 404 and .nojekyll.”

### Phase 2 — Live data & discovery
“Add a resort dataset (55+ resorts across 6 continents: name, country, region, lat/lon, base/top elevation, pass, style tags). Using the free Open-Meteo API (no key, CORS-enabled), build: a homepage Powder Watch leaderboard (one multi-location request, top 10 by 7-day snowfall); a resort finder with search, region/pass/style filters, sorting by snow/elevation/vertical, favourites; a single-resort snow report page (`?r=slug`) with current conditions, past-48h + 7-day bar chart, daily table, verdict banner, nearby resorts, unit toggle, 30-minute session cache and graceful failure states.”

### Phase 3 — Lead generation engine
“Build `trip-planner.html`: a 5-step form (destination/dates → group & ability → inclusions → budget & priorities → contact & consent) with progress bar, per-step validation, resort pre-fill from `?resort=`, trust panel, group-rates CTA and B2B lead-partner CTA. Submit via AJAX to a free form relay (FormSubmit) with honeypot + time-trap anti-spam, then redirect to `thanks.html`. Add lead capture everywhere: sticky mobile CTA, exit-intent modal (once per 7 days) with a checklist lead magnet, newsletter/powder-alert forms, and a mailto fallback if the relay fails.”

### Phase 4 — Content & SEO
“Write pages: Gear (buy-vs-rent table, category price guides), Learn (level roadmap, lessons, safety code), Videos (lite YouTube embeds + video submission form), Guides index and 6 long-form guides (Epic vs Ikon, first ski trip, best time to ski, trip costs, layering, packing checklist) with auto table of contents, Article/FAQ/Breadcrumb JSON-LD, canonical and Open Graph tags. Add Tools: ski length, snowboard size, trip budget calculators and a 3-resort live comparison.”

### Phase 5 — Monetization & community
“Wire AdSense slots (leaderboard, in-article, sidebar, footer) controlled by `config.js`; when no publisher ID is set, render house ads linking to the media kit. Build Advertise (packages, partnership types, inquiry form, acquisition CTA), Donate (tiers, one-time/monthly toggle, custom amount, goal bar, allocation to operations/promotions/hiring/contests, payment-link buttons from config, pledge form), Contests (countdown, prizes, entry form, judging criteria, official rules, sponsor CTA) and Careers (roles, application form).”

### Phase 6 — Legal, QA & launch
“Add Privacy (AdSense cookie language, rights), Terms, Disclaimer with trademark, copyright, DMCA, forecast-safety, affiliate and lead-sharing disclosures; cookie-consent bar gating analytics. QA: no horizontal scroll at 390px, zero console errors, every form tested, inbox string absent from all files. Push to GitHub, publish with GitHub Pages from the main branch root, then point the custom domain.”

### Phase 7 — Growth & expansion (next)
- Programmatic resort pages (`/resorts/<slug>.html`) generated by `build.py` for long-tail SEO (“<resort> snow forecast”).
- Weekly “Powder Report” newsletter + YouTube Shorts from the leaderboard.
- Paid “SnowCow+” membership (ad-free, SMS alerts) via Stripe/Patreon links.
- Localised Europe/Japan pages; affiliate deep links per resort.
- Off-season vertical: “SnowCow Pros” snow-removal contractor lead directory for North American cities.

---

## 4. Go-live checklist (owner actions)
1. **Activate form delivery:** the first form submission triggers a one-time FormSubmit activation email to the owner inbox — click “Activate”.
2. **AdSense:** apply with the live domain, then paste the publisher ID in `assets/js/config.js` (`adsenseClient`) and the line in `ads.txt`. Turn on Google’s certified CMP in AdSense for EEA/UK visitors.
3. **Payments:** paste PayPal / Stripe / Buy Me a Coffee / Ko-fi / Patreon links into `config.js → donate`.
4. **Analytics:** add a GA4 ID in `config.js → ga4`.
5. **Custom domain:** in repo Settings → Pages add `snowcow.com`; at the registrar create A records to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 and a `www` CNAME to `webworksa1.github.io`; then set `SITE_URL` in `build.py` to `https://snowcow.com` and run `python3 build.py`.
6. **Forecast licence:** Open-Meteo’s free API is for non-commercial use; once the site earns revenue, subscribe to Open-Meteo’s commercial API plan (or swap the endpoint in `snow.js`).
7. **Trademark:** run a USPTO / CIPO / EUIPO search for “SnowCow” in classes 35, 39 and 41 before investing in brand registration.
