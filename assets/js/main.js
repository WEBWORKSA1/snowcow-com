/* ==========================================================
   SnowCow.com — Core site script (no dependencies)
   ========================================================== */
(function(){
  "use strict";
  var C = window.SC_CONFIG || {};
  var $ = function(s,el){return (el||document).querySelector(s)};
  var $$ = function(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))};
  var store = {
    get:function(k,d){try{var v=localStorage.getItem("sc_"+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
    set:function(k,v){try{localStorage.setItem("sc_"+k,JSON.stringify(v))}catch(e){}}
  };
  window.SC = window.SC || {};
  SC.store = store; SC.$ = $; SC.$$ = $$;

  /* ---------- Hidden inbox (never rendered) ---------- */
  function inbox(){ return (C._k||[]).slice().reverse().map(function(n){return String.fromCharCode(n-7)}).join(""); }
  SC.mailto = function(subject, body){
    var href = "mail" + "to:" + inbox() + "?subject=" + encodeURIComponent(subject||"SnowCow inquiry") + (body?"&body="+encodeURIComponent(body):"");
    window.location.href = href;
  };

  /* ---------- Toast ---------- */
  SC.toast = function(msg){
    var t = $("#toast"); if(!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function(){t.classList.remove("show")}, 3200);
  };

  /* ---------- Theme ---------- */
  var themeBtn = $("#themeToggle");
  var saved = store.get("theme", null);
  if(saved) document.documentElement.setAttribute("data-theme", saved);
  function isDark(){
    var a = document.documentElement.getAttribute("data-theme");
    if(a) return a === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeIcon(){ if(themeBtn) themeBtn.textContent = isDark() ? "☀" : "☾"; }
  syncThemeIcon();
  if(themeBtn) themeBtn.addEventListener("click", function(){
    var next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next); store.set("theme", next); syncThemeIcon();
  });

  /* ---------- Mobile menu ---------- */
  var mt = $("#menuToggle"), mm = $("#mobileMenu");
  if(mt && mm) mt.addEventListener("click", function(){
    var open = mm.classList.toggle("open"); mt.setAttribute("aria-expanded", open ? "true" : "false");
    mt.textContent = open ? "✕" : "☰";
  });

  /* ---------- Snowfall (hero) ---------- */
  $$(".snowfall").forEach(function(box){
    if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for(var i=0;i<34;i++){
      var f = document.createElement("span"); f.className="flake"; f.textContent = i%3? "•" : "❄";
      f.style.left = (Math.random()*100)+"%"; f.style.fontSize = (6+Math.random()*14)+"px";
      f.style.animationDuration = (7+Math.random()*10)+"s"; f.style.animationDelay = (-Math.random()*15)+"s";
      f.style.opacity = (.35+Math.random()*.6).toFixed(2);
      box.appendChild(f);
    }
  });

  /* ---------- Sticky CTA + back to top ---------- */
  var sticky = $("#stickyCta"), toTop = $("#toTop");
  window.addEventListener("scroll", function(){
    var y = window.scrollY || 0;
    if(sticky && !sticky.dataset.closed) sticky.classList.toggle("show", y > 700);
    if(toTop) toTop.classList.toggle("show", y > 900);
  }, {passive:true});
  if(toTop) toTop.addEventListener("click", function(){ window.scrollTo({top:0,behavior:"smooth"}) });

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function(e){ e.textContent = new Date().getFullYear(); });

  /* ---------- Contact links (inbox hidden, assembled only on click) ---------- */
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("[data-mail]");
    if(!a) return;
    e.preventDefault();
    SC.mailto(a.getAttribute("data-mail") || "SnowCow inquiry");
  });

  /* ---------- Cookie consent + analytics ---------- */
  function loadGA(){
    if(!C.ga4 || window._gaLoaded) return; window._gaLoaded = true;
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id="+C.ga4; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){dataLayer.push(arguments)};
    gtag("js", new Date()); gtag("config", C.ga4, {anonymize_ip:true});
  }
  SC.track = function(name, params){ try{ if(window.gtag) gtag("event", name, params||{}); }catch(e){} };
  var cookie = $("#cookieBar"), consent = store.get("consent", null);
  if(consent === "yes") loadGA();
  if(cookie && consent === null) setTimeout(function(){ cookie.classList.add("show") }, 1200);
  $$("[data-consent]").forEach(function(b){ b.addEventListener("click", function(){
    var v = b.getAttribute("data-consent"); store.set("consent", v); cookie.classList.remove("show");
    if(v === "yes") loadGA();
  })});

  /* ---------- Ads: AdSense when configured, otherwise house ads ---------- */
  var adLabels = {
    leaderboard: "Your brand here — reach skiers & snowboarders planning trips",
    inArticle: "Sponsor this guide — native placement available",
    sidebar: "Advertise to snow travellers",
    footer: "Sponsorship & advertising packages available"
  };
  var root = document.body.getAttribute("data-root") || "";
  $$(".ad-slot").forEach(function(slot){
    var type = slot.getAttribute("data-ad") || "leaderboard";
    var label = '<span class="ad-label">Advertisement</span>';
    if(C.adsenseClient){
      var id = (C.adsenseSlots||{})[type] || "";
      slot.innerHTML = label + '<ins class="adsbygoogle" style="display:block" data-ad-client="'+C.adsenseClient+'"'+(id?' data-ad-slot="'+id+'"':'')+' data-ad-format="auto" data-full-width-responsive="true"></ins>';
    } else {
      slot.innerHTML = label + '<a class="ad-placeholder" href="'+root+'advertise.html">📣 '+(adLabels[type]||adLabels.leaderboard)+' <span class="btn btn-sm btn-primary">See media kit</span></a>';
    }
  });
  if(C.adsenseClient){
    var ads = document.createElement("script"); ads.async = true; ads.crossOrigin = "anonymous";
    ads.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+C.adsenseClient;
    ads.onload = function(){ $$(".adsbygoogle").forEach(function(){ try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){} }) };
    document.head.appendChild(ads);
  }

  /* ---------- YouTube lite embeds ---------- */
  $$(".video[data-yt]").forEach(function(v){
    var id = v.getAttribute("data-yt"), title = v.getAttribute("data-title") || "Video";
    v.innerHTML = '<img loading="lazy" alt="'+title.replace(/"/g,"&quot;")+'" src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg"><div class="play"><span>▶</span></div>';
    v.setAttribute("role","button"); v.setAttribute("tabindex","0"); v.setAttribute("aria-label","Play: "+title);
    function play(){
      v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="'+title.replace(/"/g,"&quot;")+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      SC.track("video_play", {video_id:id});
    }
    v.addEventListener("click", play, {once:true});
    v.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); play(); } });
  });

  /* ---------- Social links from config ---------- */
  $$("[data-social]").forEach(function(a){
    var k = a.getAttribute("data-social"), url = (C.social||{})[k];
    if(url){ a.href = url; } else { a.style.display = "none"; }
  });

  /* ---------- Forms (delivered to the hidden inbox) ---------- */
  var loadedAt = Date.now();
  function formToObject(form){
    var o = {}, fd = new FormData(form);
    fd.forEach(function(v,k){
      if(k === "_gotcha") return;
      if(v instanceof File) return;
      if(o[k] !== undefined){ o[k] = o[k] + ", " + v; } else { o[k] = v; }
    });
    return o;
  }
  function validate(form){
    var ok = true, first = null;
    $$("[required]", form).forEach(function(f){
      var bad = (f.type === "checkbox") ? !f.checked : !String(f.value||"").trim();
      if(!bad && f.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
      f.classList.toggle("invalid", bad);
      if(bad){ ok = false; if(!first) first = f; }
    });
    if(first) first.focus();
    return ok;
  }
  SC.validateStep = function(container){
    var ok = true, first = null;
    $$("[required]", container).forEach(function(f){
      var bad = (f.type === "checkbox") ? !f.checked : !String(f.value||"").trim();
      if(!bad && f.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
      f.classList.toggle("invalid", bad); if(bad){ ok=false; if(!first) first=f; }
    });
    if(first) first.focus();
    return ok;
  };
  function status(form, cls, html){
    var s = $(".form-status", form);
    if(!s){ s = document.createElement("div"); s.className = "form-status"; s.setAttribute("role","status"); form.appendChild(s); }
    s.className = "form-status " + cls; s.innerHTML = html;
  }
  SC.submitForm = function(form){
    if(!validate(form)){ status(form, "err", "Please complete the highlighted fields."); return; }
    var hp = form.querySelector('[name="_gotcha"]');
    if((hp && hp.value) || Date.now() - loadedAt < 2500){ status(form, "ok", "Thanks! Your submission was received."); return; }
    var data = formToObject(form);
    var subject = form.getAttribute("data-subject") || "SnowCow form";
    data._subject = "[SnowCow] " + subject + (data.name ? " — " + data.name : "");
    data._template = "table"; data._captcha = "false";
    data.page = location.href; data.submitted = new Date().toISOString();
    if(data.email) data._replyto = data.email;
    var btn = form.querySelector('[type="submit"]'); if(btn){ btn.disabled = true; btn._t = btn.textContent; btn.textContent = "Sending…"; }
    status(form, "busy", "Sending securely…");
    fetch((C.formEndpoint||"https://formsubmit.co/ajax/") + inbox(), {
      method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body:JSON.stringify(data)
    }).then(function(r){ return r.json().catch(function(){return {}}) }).then(function(res){
      if(res && (res.success === true || res.success === "true")){
        SC.track("generate_lead", {form: subject});
        var thanks = form.getAttribute("data-thanks");
        if(thanks){ location.href = thanks; return; }
        status(form, "ok", form.getAttribute("data-success") || "✅ Thank you! We received your message and will reply within 1–2 business days.");
        form.reset();
      } else { throw new Error((res && res.message) || "Delivery failed"); }
    }).catch(function(){
      var body = Object.keys(data).filter(function(k){return k.charAt(0)!=="_"}).map(function(k){return k+": "+data[k]}).join("\n");
      status(form, "err", 'We couldn’t send that automatically. <button type="button" class="btn btn-sm btn-secondary" id="mailFallback">Send it by email instead</button>');
      var fb = $("#mailFallback", form); if(fb) fb.addEventListener("click", function(){ SC.mailto(data._subject, body); });
    }).then(function(){ if(btn){ btn.disabled = false; btn.textContent = btn._t; } });
  };
  $$("form.sc-form").forEach(function(form){
    if(!form.querySelector('[name="_gotcha"]')){
      var hp = document.createElement("input"); hp.type="text"; hp.name="_gotcha"; hp.className="hp"; hp.tabIndex=-1; hp.autocomplete="off"; hp.setAttribute("aria-hidden","true");
      form.appendChild(hp);
    }
    form.setAttribute("novalidate","");
    form.addEventListener("submit", function(e){ e.preventDefault(); SC.submitForm(form); });
  });

  /* ---------- Lead magnet modal (exit intent / timed, once per 7 days) ---------- */
  var modal = $("#leadModal");
  function openModal(){
    if(!modal) return;
    var last = store.get("modalSeen", 0);
    if(Date.now() - last < 7*864e5) return;
    store.set("modalSeen", Date.now()); modal.classList.add("open"); SC.track("lead_modal_open");
  }
  if(modal && !document.body.hasAttribute("data-no-modal")){
    document.addEventListener("mouseout", function(e){ if(!e.relatedTarget && e.clientY < 8) openModal(); });
    setTimeout(openModal, 45000);
    modal.addEventListener("click", function(e){ if(e.target === modal || e.target.closest(".modal-close")) modal.classList.remove("open"); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") modal.classList.remove("open"); });
  }

  /* ---------- Multi-step trip planner ---------- */
  var planner = $("#tripPlanner");
  if(planner){
    var steps = $$(".step", planner), bars = $$(".stepper span", planner), cur = 0;
    function show(i){
      steps.forEach(function(s,j){ s.classList.toggle("active", j===i) });
      bars.forEach(function(b,j){ b.classList.toggle("done", j<=i) });
      $("#stepCount") && ($("#stepCount").textContent = (i+1) + " of " + steps.length);
      cur = i;
    }
    $$("[data-next]", planner).forEach(function(b){ b.addEventListener("click", function(){
      if(!SC.validateStep(steps[cur])) return;
      if(cur < steps.length-1){ show(cur+1); planner.scrollIntoView({behavior:"smooth",block:"start"}); SC.track("planner_step",{step:cur+1}); }
    })});
    $$("[data-prev]", planner).forEach(function(b){ b.addEventListener("click", function(){ if(cur>0) show(cur-1) }) });
    // Pre-fill destination from ?resort=
    var q = new URLSearchParams(location.search), rs = q.get("resort");
    if(rs && window.SC_RESORTS){
      var hit = SC_RESORTS.filter(function(r){return r.s===rs})[0];
      if(hit && $("#destination")) $("#destination").value = hit.n + ", " + hit.c;
    }
    show(0);
  }

  /* ---------- Donate page ---------- */
  var donate = $("#donateBox");
  if(donate){
    var amount = 15, freq = "one-time";
    var amtInput = $("#donAmount");
    $$(".tier", donate).forEach(function(t){ t.addEventListener("click", function(){
      $$(".tier", donate).forEach(function(x){x.classList.remove("on")}); t.classList.add("on");
      amount = +t.getAttribute("data-amt"); if(amtInput) amtInput.value = amount; syncDon();
    })});
    $$("#donFreq button").forEach(function(b){ b.addEventListener("click", function(){
      $$("#donFreq button").forEach(function(x){x.classList.remove("on")}); b.classList.add("on"); freq = b.getAttribute("data-f"); syncDon();
    })});
    if(amtInput) amtInput.addEventListener("input", function(){ amount = +amtInput.value || 0; syncDon(); });
    function syncDon(){
      $("#donSummary") && ($("#donSummary").textContent = "$" + amount + (freq==="monthly" ? " / month" : " one-time"));
      var h1 = $("#pledgeAmount"), h2 = $("#pledgeFreq"); if(h1) h1.value = amount; if(h2) h2.value = freq;
    }
    var D = C.donate || {}, any = false;
    ["paypal","stripe","buymeacoffee","kofi","patreon"].forEach(function(k){
      var b = $('[data-pay="'+k+'"]');
      if(!b) return;
      if(D[k]){ b.href = D[k]; b.target = "_blank"; b.rel = "noopener"; any = true; } else { b.style.display = "none"; }
    });
    if(!any && $("#payLinksNote")) $("#payLinksNote").style.display = "block";
    var g = C.donationGoal || {goal:5000, raised:0};
    if($("#goalBar")){ var pct = Math.min(100, Math.round((g.raised/g.goal)*100)); $("#goalBar").style.width = Math.max(pct,2) + "%"; $("#goalText").textContent = "$" + g.raised.toLocaleString() + " raised of $" + g.goal.toLocaleString() + " " + (g.label||"goal") + " (" + pct + "%)"; }
    syncDon();
  }

  /* ---------- Countdown ---------- */
  var cd = $("#countdown");
  if(cd){
    var end = new Date(C.contestEnds || "2027-03-31T23:59:59").getTime();
    (function tick(){
      var d = Math.max(0, end - Date.now());
      var parts = [Math.floor(d/864e5), Math.floor(d/36e5)%24, Math.floor(d/6e4)%60, Math.floor(d/1e3)%60];
      $$("b", cd).forEach(function(b,i){ b.textContent = String(parts[i]).padStart(2,"0"); });
      if(d > 0) setTimeout(tick, 1000);
    })();
  }

  /* ---------- Share buttons ---------- */
  $$("[data-share]").forEach(function(b){ b.addEventListener("click", function(){
    var url = location.href, title = document.title;
    if(navigator.share){ navigator.share({title:title,url:url}).catch(function(){}); }
    else if(navigator.clipboard){ navigator.clipboard.writeText(url).then(function(){ SC.toast("Link copied to clipboard"); }); }
  })});

  /* ---------- Article table of contents ---------- */
  var toc = $("#toc");
  if(toc){
    $$(".prose h2").forEach(function(h,i){
      if(!h.id) h.id = "s" + (i+1) + "-" + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      var a = document.createElement("a"); a.href = "#" + h.id; a.textContent = h.textContent; toc.appendChild(a);
    });
  }
})();
