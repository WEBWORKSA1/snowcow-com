/* ==========================================================
   SnowCow.com — Live snow forecasts (Open-Meteo, no API key)
   ========================================================== */
(function(){
  "use strict";
  var R = window.SC_RESORTS || [], SC = window.SC || {}, $ = SC.$, $$ = SC.$$, store = SC.store;
  var root = document.body.getAttribute("data-root") || "";
  var API = "https://api.open-meteo.com/v1/forecast";
  var units = store.get("units", "metric");
  var WX = {0:"☀️ Clear",1:"🌤 Mostly clear",2:"⛅ Partly cloudy",3:"☁️ Overcast",45:"🌫 Fog",48:"🌫 Rime fog",51:"🌦 Drizzle",53:"🌦 Drizzle",55:"🌧 Drizzle",61:"🌧 Rain",63:"🌧 Rain",65:"🌧 Heavy rain",66:"🌧 Freezing rain",67:"🌧 Freezing rain",71:"🌨 Light snow",73:"🌨 Snow",75:"❄️ Heavy snow",77:"🌨 Snow grains",80:"🌦 Showers",81:"🌧 Showers",82:"⛈ Heavy showers",85:"🌨 Snow showers",86:"❄️ Heavy snow showers",95:"⛈ Thunderstorm",96:"⛈ Thunderstorm",99:"⛈ Thunderstorm"};

  function bySlug(s){ return R.filter(function(r){return r.s===s})[0]; }
  function mid(r){ return Math.round((r.top + r.base)/2); }
  function snowFmt(cm){ if(cm==null||isNaN(cm)) return "–"; return units==="metric" ? (Math.round(cm*10)/10)+" cm" : (Math.round(cm/2.54*10)/10)+"″"; }
  function snowNum(cm){ if(cm==null||isNaN(cm)) return "–"; return units==="metric" ? Math.round(cm) : Math.round(cm/2.54*10)/10; }
  function snowUnit(){ return units==="metric" ? "cm" : "in"; }
  function tFmt(c){ if(c==null||isNaN(c)) return "–"; return units==="metric" ? Math.round(c)+"°C" : Math.round(c*9/5+32)+"°F"; }
  function wFmt(k){ if(k==null||isNaN(k)) return "–"; return units==="metric" ? Math.round(k)+" km/h" : Math.round(k*0.621)+" mph"; }
  function elevFmt(m){ return units==="metric" ? m.toLocaleString()+" m" : Math.round(m*3.281).toLocaleString()+" ft"; }
  SC.units = function(){ return units; };

  /* ---------- Fetch with session cache (30 min) ---------- */
  function cacheGet(k){ try{ var v = JSON.parse(sessionStorage.getItem(k)); if(v && Date.now()-v.t < 18e5) return v.d; }catch(e){} return null; }
  function cacheSet(k,d){ try{ sessionStorage.setItem(k, JSON.stringify({t:Date.now(), d:d})); }catch(e){} }
  function fetchSnow(list){
    var key = "snow_" + list.map(function(r){return r.s}).join(",");
    var hit = cacheGet(key); if(hit) return Promise.resolve(hit);
    var url = API + "?latitude=" + list.map(function(r){return r.lat}).join(",") +
      "&longitude=" + list.map(function(r){return r.lon}).join(",") +
      "&elevation=" + list.map(mid).join(",") +
      "&daily=snowfall_sum,temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max" +
      "&current=temperature_2m,snow_depth,wind_speed_10m,weather_code" +
      "&timezone=auto&past_days=2&forecast_days=7";
    return fetch(url).then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }).then(function(j){
      var arr = Array.isArray(j) ? j : [j];
      var out = arr.map(function(d, i){
        var sf = (d.daily && d.daily.snowfall_sum) || [];
        var past = (sf[0]||0) + (sf[1]||0), next7 = 0;
        for(var k=2;k<sf.length;k++) next7 += (sf[k]||0);
        return { s:list[i].s, past48:past, next7:next7, next3:(sf[2]||0)+(sf[3]||0)+(sf[4]||0), daily:d.daily, current:d.current || {} };
      });
      cacheSet(key, out); return out;
    });
  }
  SC.fetchSnow = fetchSnow;

  /* ---------- Units toggle ---------- */
  function bindUnits(rerender){
    $$(".units-toggle").forEach(function(g){
      $$("button", g).forEach(function(b){
        b.classList.toggle("on", b.getAttribute("data-u")===units);
        b.addEventListener("click", function(){
          units = b.getAttribute("data-u"); store.set("units", units);
          $$(".units-toggle button").forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-u")===units) });
          rerender && rerender();
        });
      });
    });
  }

  /* ---------- Autocomplete search ---------- */
  function autocomplete(input, onPick){
    if(!input) return;
    var wrap = input.parentNode, list = document.createElement("ul"); list.className = "ac-list"; list.hidden = true; list.setAttribute("role","listbox");
    wrap.appendChild(list); var items = [], active = -1;
    function render(){
      var q = input.value.trim().toLowerCase();
      if(q.length < 1){ list.hidden = true; return; }
      items = R.filter(function(r){ return (r.n+" "+r.c+" "+r.st+" "+r.r).toLowerCase().indexOf(q) > -1; }).slice(0,8);
      list.innerHTML = items.map(function(r,i){ return '<li role="option" data-i="'+i+'"><span>'+r.n+'</span><small>'+r.st+', '+r.c+'</small></li>'; }).join("") || '<li><small>No match — try a country or region</small></li>';
      list.hidden = false; active = -1;
    }
    input.addEventListener("input", render);
    input.addEventListener("keydown", function(e){
      var lis = $$("li[data-i]", list);
      if(e.key==="ArrowDown"){ e.preventDefault(); active = Math.min(active+1, lis.length-1); }
      else if(e.key==="ArrowUp"){ e.preventDefault(); active = Math.max(active-1, 0); }
      else if(e.key==="Enter"){ e.preventDefault(); var pick = items[active>-1?active:0]; if(pick){ list.hidden = true; onPick(pick); } return; }
      else if(e.key==="Escape"){ list.hidden = true; return; }
      lis.forEach(function(l,i){ l.classList.toggle("active", i===active) });
    });
    list.addEventListener("mousedown", function(e){ var li = e.target.closest("li[data-i]"); if(li){ e.preventDefault(); list.hidden = true; onPick(items[+li.getAttribute("data-i")]); } });
    document.addEventListener("click", function(e){ if(!wrap.contains(e.target)) list.hidden = true; });
  }
  SC.autocomplete = autocomplete;
  function goReport(r){ location.href = root + "snow-report.html?r=" + r.s; }
  autocomplete($("#heroSearch"), goReport);
  autocomplete($("#navSearch"), goReport);
  var hsf = $("#heroSearchForm");
  if(hsf) hsf.addEventListener("submit", function(e){ e.preventDefault(); var q = $("#heroSearch").value.trim().toLowerCase(); var r = R.filter(function(x){return (x.n+" "+x.c+" "+x.st).toLowerCase().indexOf(q)>-1})[0]; if(r) goReport(r); else location.href = root + "resorts.html?q=" + encodeURIComponent(q); });

  function passBadge(p){ var m = {Epic:"epic",Ikon:"ikon","Mountain Collective":"mc",Independent:"ind"}; return '<span class="badge '+(m[p]||"")+'">'+p+'</span>'; }
  SC.passBadge = passBadge;

  /* ---------- HOME: Powder Watch ---------- */
  var pw = $("#powderWatch");
  if(pw){
    var drawPW;
    fetchSnow(R).then(function(data){
      drawPW = function(){
        var rows = data.slice().sort(function(a,b){return b.next7-a.next7}).slice(0,10);
        pw.innerHTML = rows.map(function(d){ var r = bySlug(d.s);
          return '<div class="row"><div><a href="'+root+'snow-report.html?r='+r.s+'">'+r.n+'</a><br><small class="muted">'+r.c+' · last 48h: '+snowFmt(d.past48)+'</small></div><div class="amt">'+snowFmt(d.next7)+'</div></div>';
        }).join("");
        var upd = $("#pwUpdated"); if(upd) upd.textContent = "Updated " + new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
      };
      drawPW();
    }).catch(function(){ pw.innerHTML = '<p class="muted">Live forecasts are temporarily unavailable. <a href="'+root+'snow-report.html">Open the snow report</a>.</p>'; });
    bindUnits(function(){ drawPW && drawPW(); });
  }

  /* ---------- RESORTS directory ---------- */
  var grid = $("#resortGrid");
  if(grid){
    var snowMap = {};
    var favs = store.get("favs", []);
    var qs = new URLSearchParams(location.search);
    if(qs.get("q") && $("#fSearch")) $("#fSearch").value = qs.get("q");
    if(qs.get("tag") && $("#fTag")) $("#fTag").value = qs.get("tag");
    if(qs.get("region") && $("#fRegion")) $("#fRegion").value = qs.get("region");
    if(qs.get("pass") && $("#fPass")) $("#fPass").value = qs.get("pass");
    function draw(){
      var q = ($("#fSearch").value||"").toLowerCase(), reg = $("#fRegion").value, pass = $("#fPass").value, tag = $("#fTag").value, sort = $("#fSort").value;
      var list = R.filter(function(r){
        return (!q || (r.n+" "+r.c+" "+r.st).toLowerCase().indexOf(q)>-1) && (!reg || r.r===reg) && (!pass || r.p===pass) && (!tag || r.t.indexOf(tag)>-1);
      });
      if(sort==="snow") list.sort(function(a,b){ return ((snowMap[b.s]||{}).next7||0) - ((snowMap[a.s]||{}).next7||0) });
      else if(sort==="top") list.sort(function(a,b){ return b.top-a.top });
      else if(sort==="vert") list.sort(function(a,b){ return (b.top-b.base)-(a.top-a.base) });
      else list.sort(function(a,b){ return a.n.localeCompare(b.n) });
      $("#resultCount").textContent = list.length + " resort" + (list.length===1?"":"s");
      grid.innerHTML = list.map(function(r){
        var d = snowMap[r.s], fav = favs.indexOf(r.s)>-1;
        return '<article class="card resort-card"><div class="top"><div><h3><a href="'+root+'snow-report.html?r='+r.s+'" style="color:inherit;text-decoration:none">'+r.n+'</a></h3><div class="loc">📍 '+r.st+', '+r.c+'</div></div>'+passBadge(r.p)+'</div>'+
          '<div class="snow-num"><div><b>'+(d?snowNum(d.next7):'…')+'</b><small>'+snowUnit()+' next 7d</small></div><div><b>'+(d?snowNum(d.past48):'…')+'</b><small>'+snowUnit()+' last 48h</small></div><div><b>'+elevFmt(r.top-r.base).replace(/ (m|ft)$/,'')+'</b><small>'+(units==="metric"?"m":"ft")+' vertical</small></div></div>'+
          '<div class="chips">'+r.t.map(function(t){return '<span class="chip">'+t+'</span>'}).join("")+'</div>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:auto"><a class="btn btn-sm btn-secondary" href="'+root+'snow-report.html?r='+r.s+'">Snow report</a><a class="btn btn-sm btn-primary" href="'+root+'trip-planner.html?resort='+r.s+'">Get trip quote</a><button class="fav-btn'+(fav?' on':'')+'" data-fav="'+r.s+'" aria-pressed="'+fav+'" title="Save to My Snow">★</button></div></article>';
      }).join("") || '<p class="muted">No resorts match those filters. <a href="'+root+'contact.html">Suggest a resort</a>.</p>';
    }
    ["#fSearch","#fRegion","#fPass","#fTag","#fSort"].forEach(function(s){ var el=$(s); el && el.addEventListener("input", draw); el && el.addEventListener("change", draw); });
    grid.addEventListener("click", function(e){
      var b = e.target.closest("[data-fav]"); if(!b) return;
      var s = b.getAttribute("data-fav"), i = favs.indexOf(s);
      if(i>-1) favs.splice(i,1); else favs.push(s);
      store.set("favs", favs); SC.toast(i>-1 ? "Removed from My Snow" : "Saved to My Snow ★"); draw();
    });
    bindUnits(draw); draw();
    fetchSnow(R).then(function(data){ data.forEach(function(d){ snowMap[d.s] = d }); draw(); }).catch(function(){});
  }

  /* ---------- SNOW REPORT (single resort) ---------- */
  var rep = $("#snowReport");
  if(rep){
    var params = new URLSearchParams(location.search), favs2 = store.get("favs", []);
    var cur = bySlug(params.get("r")) || bySlug(favs2[0]) || bySlug("whistler-blackcomb");
    var sel = $("#resortSelect");
    if(sel){
      sel.innerHTML = R.slice().sort(function(a,b){return a.n.localeCompare(b.n)}).map(function(r){ return '<option value="'+r.s+'">'+r.n+' — '+r.c+'</option>'; }).join("");
      sel.value = cur.s;
      sel.addEventListener("change", function(){ cur = bySlug(sel.value); history.replaceState(null,"","?r="+cur.s); load(); });
    }
    autocomplete($("#reportSearch"), function(r){ cur = r; if(sel) sel.value = r.s; history.replaceState(null,"","?r="+r.s); $("#reportSearch").value=""; load(); });
    var last = null;
    function render(){
      var r = cur, d = last;
      document.title = r.n + " Snow Report & 7-Day Snow Forecast | SnowCow";
      $("#repName").textContent = r.n;
      $("#repLoc").textContent = r.st + ", " + r.c + " · " + r.r;
      $("#repPass").innerHTML = passBadge(r.p);
      $("#repElev").textContent = elevFmt(r.base) + " → " + elevFmt(r.top) + " (" + elevFmt(r.top-r.base) + " vertical)";
      $("#repTags").innerHTML = r.t.map(function(t){return '<a class="chip" href="'+root+'resorts.html?tag='+t+'">'+t+'</a>'}).join("");
      $("#repQuote").href = root + "trip-planner.html?resort=" + r.s;
      var fb = $("#repFav"), favs = store.get("favs", []), on = favs.indexOf(r.s)>-1;
      fb.classList.toggle("on", on); fb.textContent = on ? "★ Saved" : "☆ Save to My Snow";
      if(!d){ return; }
      var c = d.current || {}, dl = d.daily || {};
      $("#repNow").innerHTML =
        '<div><b>'+snowFmt(d.next7).replace(/ cm|″/,"")+'</b><small>'+snowUnit()+' next 7 days</small></div>'+
        '<div><b>'+snowFmt(d.next3).replace(/ cm|″/,"")+'</b><small>'+snowUnit()+' next 72h</small></div>'+
        '<div><b>'+snowFmt(d.past48).replace(/ cm|″/,"")+'</b><small>'+snowUnit()+' last 48h</small></div>'+
        '<div><b>'+(c.snow_depth!=null ? snowFmt(c.snow_depth*100).replace(/ cm|″/,"") : "–")+'</b><small>'+snowUnit()+' modelled depth</small></div>'+
        '<div><b>'+tFmt(c.temperature_2m)+'</b><small>now (mid-mountain)</small></div>'+
        '<div><b>'+wFmt(c.wind_speed_10m)+'</b><small>wind now</small></div>';
      $("#repWx").textContent = WX[c.weather_code] || "";
      var sf = dl.snowfall_sum || [], max = Math.max.apply(null, sf.concat([5]));
      var days = (dl.time||[]).map(function(t,i){ var dt = new Date(t+"T12:00:00"); return (i<2?"Past ":"") + dt.toLocaleDateString([], {weekday:"short"}); });
      $("#repBars").innerHTML = sf.map(function(v,i){ return '<div class="bar" title="'+days[i]+'"><b>'+snowNum(v)+'</b><i style="height:'+Math.max(2,(v/max)*100)+'%;'+(i<2?'opacity:.45':'')+'"></i></div>'; }).join("");
      $("#repDays").innerHTML = days.map(function(x){ return '<span>'+x+'</span>' }).join("");
      $("#repTable").innerHTML = '<thead><tr><th>Day</th><th>Snow</th><th>High</th><th>Low</th><th>Wind max</th><th>Conditions</th></tr></thead><tbody>' +
        (dl.time||[]).map(function(t,i){ return '<tr'+(i<2?' style="opacity:.65"':'')+'><td>'+new Date(t+"T12:00:00").toLocaleDateString([], {weekday:"short", month:"short", day:"numeric"})+(i<2?' (past)':'')+'</td><td><b>'+snowFmt(sf[i])+'</b></td><td>'+tFmt((dl.temperature_2m_max||[])[i])+'</td><td>'+tFmt((dl.temperature_2m_min||[])[i])+'</td><td>'+wFmt((dl.wind_speed_10m_max||[])[i])+'</td><td>'+(WX[(dl.weather_code||[])[i]]||"")+'</td></tr>'; }).join("") + '</tbody>';
      var verdict = d.next7 >= 30 ? "🔥 Powder alert — significant snow is forecast. Book now before lodging fills." : d.next7 >= 10 ? "❄️ Fresh snow on the way — good conditions building." : "🌤 Mostly dry week ahead — great for groomers & sunshine laps.";
      $("#repVerdict").textContent = verdict;
    }
    function load(){
      last = null; render();
      $("#repNow").innerHTML = '<div class="skeleton" style="height:60px;flex:1"></div><div class="skeleton" style="height:60px;flex:1"></div><div class="skeleton" style="height:60px;flex:1"></div>';
      fetchSnow([cur]).then(function(d){ last = d[0]; render(); nearby(); }).catch(function(){ $("#repNow").innerHTML = '<p class="muted">Forecast service unavailable right now — please retry shortly.</p>'; });
      SC.track && SC.track("view_resort", {resort:cur.s});
    }
    function nearby(){
      var box = $("#repNearby"); if(!box) return;
      var near = R.filter(function(r){return r.s!==cur.s}).map(function(r){ var dx=r.lat-cur.lat, dy=(r.lon-cur.lon)*Math.cos(cur.lat*Math.PI/180); return {r:r, d:Math.sqrt(dx*dx+dy*dy)*111}; }).sort(function(a,b){return a.d-b.d}).slice(0,4);
      box.innerHTML = near.map(function(n){ return '<a class="tile" href="?r='+n.r.s+'"><strong>'+n.r.n+'</strong><span>'+n.r.c+' · ~'+Math.round(n.d)+' km away</span></a>'; }).join("");
    }
    $("#repFav").addEventListener("click", function(){
      var favs = store.get("favs", []), i = favs.indexOf(cur.s);
      if(i>-1) favs.splice(i,1); else favs.unshift(cur.s);
      store.set("favs", favs); render(); SC.toast(i>-1?"Removed from My Snow":"Saved to My Snow ★"); drawFavs();
    });
    function drawFavs(){
      var box = $("#myFavs"); if(!box) return;
      var favs = store.get("favs", []).map(bySlug).filter(Boolean);
      box.innerHTML = favs.length ? favs.map(function(r){ return '<a class="chip" href="?r='+r.s+'">★ '+r.n+'</a>'; }).join("") : '<span class="muted">Tap “Save to My Snow” to pin resorts here.</span>';
    }
    bindUnits(render); drawFavs(); load();
  }

  /* ---------- Resort pickers for trip planner / compare ---------- */
  $$("datalist#resortList").forEach(function(dl){ dl.innerHTML = R.map(function(r){ return '<option value="'+r.n+', '+r.c+'">'; }).join(""); });
})();
