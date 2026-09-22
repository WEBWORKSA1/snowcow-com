#!/usr/bin/env python3
"""SnowCow.com static site builder.

Pages live in src/pages/*.html and src/guides/*.html. Each file starts with a
JSON meta block inside an HTML comment:  <!--META {...} META-->
The builder wraps each page in the shared layout (top interest banner, header,
newsletter, footer, modals) and writes plain static HTML to the repo root, so
GitHub Pages (free plan) can serve it with no build step on the server.

Usage:  python3 build.py
Change SITE_URL when the custom domain is pointed at GitHub Pages.
"""
import json, re, pathlib, datetime, html

ROOT = pathlib.Path(__file__).parent
SITE_URL = "https://webworksa1.github.io/snowcow-com"   # switch to "https://snowcow.com" after DNS is live
OWNER_URL = "https://web.works/contact"
CUR = ' aria-current="page"'
TODAY = datetime.date.today().isoformat()

NAV = [
    ("snow-report.html", "Snow Report", "snow"),
    ("resorts.html", "Resorts", "resorts"),
    ("guides.html", "Guides", "guides"),
    ("gear.html", "Gear", "gear"),
    ("videos.html", "Videos", "videos"),
    ("tools.html", "Tools", "tools"),
    ("contests.html", "Contests", "contests"),
    ("donate.html", "Support", "donate"),
]
MOBILE_EXTRA = [
    ("trip-planner.html", "🎿 Free Trip Quote"), ("learn.html", "Learn to Ski & Ride"),
    ("advertise.html", "Advertise & Sponsor"), ("careers.html", "Careers"), ("about.html", "About"), ("contact.html", "Contact"),
]

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#0b2545">
<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="SnowCow">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{site}/assets/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{root}assets/img/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{root}assets/img/logo.svg">
<link rel="manifest" href="{root}manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/css/style.css">
<script>try{{var t=localStorage.getItem("sc_theme");if(t)document.documentElement.setAttribute("data-theme",JSON.parse(t))}}catch(e){{}}</script>
{schema}
</head>
<body data-root="{root}"{bodyattrs}>
<a class="skip" href="#main">Skip to content</a>
<div class="topbar" role="note">
  <a href="{owner}" target="_blank" rel="noopener">Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership</a>
</div>
<header class="site-header">
  <nav class="container nav" aria-label="Main">
    <a class="brand" href="{root}index.html" aria-label="SnowCow home"><img src="{root}assets/img/logo.svg" alt="" width="40" height="40"><span>Snow<b>Cow</b></span></a>
    <ul class="nav-links">{navlinks}</ul>
    <div class="nav-actions">
      <a class="btn btn-primary btn-sm" href="{root}trip-planner.html">Free Trip Quote</a>
      <button class="icon-btn" id="themeToggle" aria-label="Toggle dark mode">☾</button>
      <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">☰</button>
    </div>
  </nav>
  <div class="mobile-menu container" id="mobileMenu">{mobilelinks}</div>
</header>
<main id="main">
"""

FOOT = """
</main>
<section class="newsletter" aria-labelledby="nl-h">
  <div class="container">
    <div class="split">
      <div>
        <h2 id="nl-h" style="color:#fff">Get Powder Alerts & Deals ❄️</h2>
        <p>One smart email when big storms line up, plus lift-ticket deals, trip giveaways and new guides. Free. Unsubscribe anytime.</p>
      </div>
      <form class="sc-form" data-subject="Newsletter / Powder Alerts signup" data-success="🎉 You're on the list! Watch your inbox for the next powder alert.">
        <label class="sr-only" for="nlEmail">Email</label>
        <input id="nlEmail" type="email" name="email" placeholder="you@email.com" required autocomplete="email">
        <label class="sr-only" for="nlInt">Interest</label>
        <select id="nlInt" name="interest"><option>Powder alerts</option><option>Trip deals</option><option>Gear deals</option><option>Contests & giveaways</option><option>All of it</option></select>
        <button class="btn btn-primary" type="submit">Subscribe</button>
      </form>
    </div>
  </div>
</section>
<div class="ad-slot" data-ad="footer"></div>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="{root}index.html"><img src="{root}assets/img/logo.svg" alt="" width="40" height="40"><span>Snow<b>Cow</b></span></a>
        <p class="mt1">Independent snow forecasts, resort guides, gear advice and free trip planning for skiers & snowboarders worldwide.</p>
        <div class="social">
          <a data-social="youtube" href="#" aria-label="YouTube" target="_blank" rel="noopener">▶</a>
          <a data-social="instagram" href="#" aria-label="Instagram" target="_blank" rel="noopener">◎</a>
          <a data-social="tiktok" href="#" aria-label="TikTok" target="_blank" rel="noopener">♪</a>
          <a data-social="x" href="#" aria-label="X" target="_blank" rel="noopener">𝕏</a>
          <a data-social="facebook" href="#" aria-label="Facebook" target="_blank" rel="noopener">f</a>
          <a data-social="pinterest" href="#" aria-label="Pinterest" target="_blank" rel="noopener">P</a>
        </div>
      </div>
      <div><h4>Explore</h4><ul>
        <li><a href="{root}snow-report.html">Snow Reports</a></li><li><a href="{root}resorts.html">Resort Finder</a></li>
        <li><a href="{root}tools.html#compare">Compare Resorts</a></li><li><a href="{root}videos.html">Videos</a></li><li><a href="{root}guides.html">Guides</a></li></ul></div>
      <div><h4>Plan</h4><ul>
        <li><a href="{root}trip-planner.html">Free Trip Quote</a></li><li><a href="{root}tools.html#budget">Trip Budget Calculator</a></li>
        <li><a href="{root}tools.html">Ski & Board Size Tools</a></li><li><a href="{root}gear.html">Gear Guide</a></li><li><a href="{root}learn.html">Learn to Ski & Ride</a></li></ul></div>
      <div><h4>Community</h4><ul>
        <li><a href="{root}contests.html">Contests & Prizes</a></li><li><a href="{root}donate.html">Support SnowCow</a></li>
        <li><a href="{root}careers.html">Careers & Ambassadors</a></li><li><a href="{root}advertise.html">Advertise & Sponsor</a></li><li><a href="{root}advertise.html#partners">Partner With Us</a></li></ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="{root}about.html">About</a></li><li><a href="{root}contact.html">Contact</a></li>
        <li><a href="{root}privacy.html">Privacy Policy</a></li><li><a href="{root}terms.html">Terms of Use</a></li><li><a href="{root}disclaimer.html">Disclaimer & Trademark</a></li><li><a href="{root}sitemap.xml">Sitemap</a></li></ul></div>
    </div>
    <div class="footer-bottom">
      <div>© <span data-year></span> SnowCow.com — All rights reserved. Original content, design and mascot artwork. “SnowCow” is used as the site name for this independent publication and is not affiliated with, endorsed by, or connected to any similarly named product, company, resort or trademark owner. All third-party names, logos and marks (e.g. ski resorts, pass products, gear brands, YouTube creators) belong to their respective owners and are used for identification only. <a href="{root}disclaimer.html">Full disclosure</a>.</div>
      <div>Snow forecasts: weather-model data by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> (CC BY 4.0). Forecasts are estimates — always check official resort reports and avalanche bulletins. Some links may be affiliate links; we may earn a commission at no extra cost to you.</div>
      <div><a href="{owner}" target="_blank" rel="noopener">Interested in this website / domain name / sponsorship / advertising / partnership? Contact us.</a></div>
    </div>
  </div>
</footer>

<div class="sticky-cta" id="stickyCta"><a class="btn btn-primary" href="{root}trip-planner.html">🎿 Get Free Ski Trip Quotes</a></div>
<button class="icon-btn to-top" id="toTop" aria-label="Back to top" style="background:var(--navy)">↑</button>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

<div class="cookie" id="cookieBar" role="dialog" aria-label="Cookie consent">
  <p>We use cookies for analytics and to show ads (including personalised ads from Google). See our <a href="{root}privacy.html">Privacy Policy</a>.</p>
  <div style="display:flex;gap:8px"><button class="btn btn-sm btn-ghost" data-consent="no">Essential only</button><button class="btn btn-sm btn-primary" data-consent="yes">Accept all</button></div>
</div>

<div class="modal" id="leadModal" role="dialog" aria-modal="true" aria-labelledby="lm-h">
  <div class="modal-box">
    <button class="modal-close" aria-label="Close">✕</button>
    <div style="font-size:2.4rem">🎁</div>
    <h3 id="lm-h" style="font-size:1.9rem">Before you go — want a free custom ski trip quote?</h3>
    <p class="muted">Tell us where & when. Vetted travel partners send you options — often cheaper than booking direct. Plus you get our <b>Ultimate Ski Trip Checklist</b>.</p>
    <form class="sc-form" data-subject="Exit-intent quick quote" data-success="✅ Got it! Your checklist is ready and a trip specialist will reach out within 24–48h.">
      <div class="field"><label for="lmName">Name <span class="req">*</span></label><input id="lmName" name="name" required autocomplete="name"></div>
      <div class="field"><label for="lmEmail">Email <span class="req">*</span></label><input id="lmEmail" type="email" name="email" required autocomplete="email"></div>
      <div class="field"><label for="lmWhere">Dream destination</label><input id="lmWhere" name="destination" placeholder="e.g. Whistler, the Alps, Japan…"></div>
      <label class="check"><input type="checkbox" name="consent" value="yes" required> I agree to be contacted about my trip and to the <a href="{root}privacy.html">Privacy Policy</a>.</label>
      <button class="btn btn-primary btn-block mt1" type="submit">Send me options + checklist</button>
    </form>
    <p class="form-note mt1"><a href="{root}guides/ski-trip-packing-checklist.html">Just want the checklist? Open it here →</a></p>
  </div>
</div>

<script src="{root}assets/js/config.js"></script>
<script src="{root}assets/js/resorts.js"></script>
<script src="{root}assets/js/main.js"></script>
<script src="{root}assets/js/snow.js"></script>
{extra_scripts}
</body>
</html>
"""

def schema_block(objs):
    if not objs:
        return ""
    return "\n".join('<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False) + "</script>" for o in objs)

def parse(path):
    txt = path.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--META\s*(\{.*?\})\s*META-->\s*", txt, re.S)
    if not m:
        raise SystemExit(f"Missing META in {path}")
    return json.loads(m.group(1)), txt[m.end():]

def build_page(meta, body, out_rel, depth):
    root = (SITE_URL + "/") if meta.get("absroot") else "../" * depth
    body = body.replace("{root}", root)
    active = meta.get("nav", "")
    navlinks = "".join(
        f'<li><a href="{root}{href}"{CUR if key == active else ""}>{label}</a></li>' for href, label, key in NAV)
    mobilelinks = "".join(f'<a href="{root}{h}">{l}</a>' for h, l in MOBILE_EXTRA[:1]) + \
        "".join(f'<a href="{root}{href}">{label}</a>' for href, label, _ in NAV) + \
        "".join(f'<a href="{root}{h}">{l}</a>' for h, l in MOBILE_EXTRA[1:])
    canonical = SITE_URL + "/" + ("" if out_rel == "index.html" else out_rel)
    schemas = []
    if out_rel == "index.html":
        schemas.append({"@context": "https://schema.org", "@type": "WebSite", "name": "SnowCow", "url": SITE_URL + "/",
                        "potentialAction": {"@type": "SearchAction", "target": SITE_URL + "/resorts.html?q={search_term_string}", "query-input": "required name=search_term_string"}})
        schemas.append({"@context": "https://schema.org", "@type": "Organization", "name": "SnowCow", "url": SITE_URL + "/", "logo": SITE_URL + "/assets/img/icon-512.png"})
    if meta.get("article"):
        schemas.append({"@context": "https://schema.org", "@type": "Article", "headline": meta["h1"] if "h1" in meta else meta["title"],
                        "description": meta["description"], "datePublished": meta.get("date", TODAY), "dateModified": TODAY,
                        "author": {"@type": "Organization", "name": "SnowCow Editorial Team"},
                        "publisher": {"@type": "Organization", "name": "SnowCow", "logo": {"@type": "ImageObject", "url": SITE_URL + "/assets/img/icon-512.png"}},
                        "mainEntityOfPage": canonical, "image": SITE_URL + "/assets/img/og-image.png"})
    if meta.get("faq"):
        schemas.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in meta["faq"]]})
    crumbs = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/"}]
    if out_rel != "index.html":
        if depth:
            crumbs.append({"@type": "ListItem", "position": 2, "name": "Guides", "item": SITE_URL + "/guides.html"})
        crumbs.append({"@type": "ListItem", "position": len(crumbs) + 1, "name": meta.get("crumb", meta["title"].split("|")[0].strip()), "item": canonical})
        schemas.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": crumbs})
    extra = "".join(f'<script src="{root}assets/js/{s}"></script>' for s in meta.get("scripts", []))
    bodyattrs = ' data-no-modal' if meta.get("nomodal") else ""
    head = HEAD.format(title=html.escape(meta["title"]), desc=html.escape(meta["description"]), canonical=canonical,
                       robots=meta.get("robots", "index,follow,max-image-preview:large"), ogtype="article" if meta.get("article") else "website",
                       site=SITE_URL, root=root, schema=schema_block(schemas), navlinks=navlinks, mobilelinks=mobilelinks,
                       owner=OWNER_URL, bodyattrs=bodyattrs)
    foot = FOOT.format(root=root, owner=OWNER_URL, extra_scripts=extra)
    return head + body + foot

def main():
    urls = []
    for folder, depth, prefix in (("pages", 0, ""), ("guides", 1, "guides/")):
        for p in sorted((ROOT / "src" / folder).glob("*.html")):
            meta, body = parse(p)
            out_rel = prefix + p.name
            out = ROOT / out_rel
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(build_page(meta, body, out_rel, depth), encoding="utf-8")
            if meta.get("sitemap", True):
                urls.append((out_rel, meta.get("priority", "0.7")))
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for rel, pr in urls:
        loc = SITE_URL + "/" + ("" if rel == "index.html" else rel)
        sm.append(f"  <url><loc>{loc}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /src/\n\nSitemap: {SITE_URL}/sitemap.xml\n", encoding="utf-8")
    print(f"Built {len(urls)} indexed pages")

if __name__ == "__main__":
    main()
