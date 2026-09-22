/* ==========================================================
   SnowCow.com — Interactive tools (size calculators, budget, compare)
   ========================================================== */
(function(){
  "use strict";
  var SC = window.SC || {}, $ = SC.$, $$ = SC.$$, R = window.SC_RESORTS || [];
  var root = document.body.getAttribute("data-root") || "";
  function num(id){ var el = $(id); return el ? (parseFloat(el.value) || 0) : 0; }
  function money(n){ return "$" + Math.round(n).toLocaleString(); }

  /* ---------- Ski length ---------- */
  var ski = $("#skiCalc");
  if(ski){
    function calcSki(){
      var unit = $("#skiUnit").value, h = num("#skiHeight"), w = num("#skiWeight");
      var hcm = unit === "imperial" ? h * 2.54 : h, wkg = unit === "imperial" ? w * 0.4536 : w;
      if(!hcm){ return; }
      var lvl = $("#skiLevel").value, terr = $("#skiTerrain").value;
      var off = {beginner:-15, intermediate:-8, advanced:-2, expert:4}[lvl];
      var bmi = wkg && hcm ? wkg / Math.pow(hcm/100, 2) : 22;
      if(bmi < 19) off -= 4; else if(bmi > 27) off += 4;
      off += {groomers:0, allmountain:2, powder:6, park:-5}[terr];
      var mid = Math.round(hcm + off), lo = mid - 4, hi = mid + 4;
      $("#skiOut").innerHTML = '<div class="kpi">'+lo+'–'+hi+' cm</div><p class="mt1">Recommended ski length for a '+lvl+' skier who prefers '+$("#skiTerrain").selectedOptions[0].text.toLowerCase()+'. Shorter = easier turning; longer = more stability at speed and float in powder.</p><a class="btn btn-sm btn-primary" href="'+root+'gear.html">See matching ski picks</a>';
      SC.track && SC.track("tool_use", {tool:"ski_length"});
    }
    ski.addEventListener("submit", function(e){ e.preventDefault(); calcSki(); });
    $$("input,select", ski).forEach(function(el){ el.addEventListener("change", calcSki); });
  }

  /* ---------- Snowboard size ---------- */
  var sb = $("#sbCalc");
  if(sb){
    function calcSb(){
      var unit = $("#sbUnit").value, h = num("#sbHeight"), w = num("#sbWeight"), boot = num("#sbBoot");
      var hcm = unit === "imperial" ? h * 2.54 : h, wkg = unit === "imperial" ? w * 0.4536 : w;
      if(!hcm){ return; }
      var len = hcm * 0.88;
      if(wkg){ var bmi = wkg / Math.pow(hcm/100,2); if(bmi < 19) len -= 3; else if(bmi > 27) len += 3; }
      len += {freestyle:-3, allmountain:0, freeride:4}[$("#sbStyle").value];
      len += {beginner:-3, intermediate:0, advanced:2}[$("#sbLevel").value];
      var mid = Math.round(len);
      var wide = boot >= 11 ? '<p class="mt1"><b>Wide board recommended</b> — with US men’s size '+boot+' boots, look for a “W” (wide) model to avoid toe and heel drag.</p>' : "";
      $("#sbOut").innerHTML = '<div class="kpi">'+(mid-2)+'–'+(mid+2)+' cm</div><p class="mt1">Suggested board length. Always cross-check the manufacturer’s rider-weight range — weight matters more than height.</p>'+wide+'<a class="btn btn-sm btn-primary" href="'+root+'gear.html">See snowboard picks</a>';
      SC.track && SC.track("tool_use", {tool:"snowboard_size"});
    }
    sb.addEventListener("submit", function(e){ e.preventDefault(); calcSb(); });
    $$("input,select", sb).forEach(function(el){ el.addEventListener("change", calcSb); });
  }

  /* ---------- Trip budget ---------- */
  var bud = $("#budgetCalc");
  if(bud){
    function calcBud(){
      var ppl = Math.max(1, num("#bPeople")), nights = Math.max(1, num("#bNights")), days = Math.max(1, num("#bDays"));
      var rooms = Math.ceil(ppl / 2);
      var lodging = num("#bLodging") * nights * rooms;
      var lifts = num("#bLift") * days * ppl;
      var rent = ($("#bRent").checked ? num("#bRentCost") : 0) * days * ppl;
      var lessons = ($("#bLessons").checked ? num("#bLessonCost") : 0) * ppl;
      var travel = num("#bTravel") * ppl;
      var food = num("#bFood") * nights * ppl;
      var ins = $("#bIns").checked ? 60 * ppl : 0;
      var total = lodging + lifts + rent + lessons + travel + food + ins;
      var rows = [["Lodging ("+rooms+" room"+(rooms>1?"s":"")+")", lodging],["Lift tickets", lifts],["Rentals", rent],["Lessons", lessons],["Travel", travel],["Food & après", food],["Insurance (est.)", ins]];
      $("#budOut").innerHTML = '<div class="kpi">'+money(total)+'</div><p class="muted mt1">'+money(total/ppl)+' per person · '+money(total/days)+' per ski day</p>'+
        '<div class="table-wrap mt1"><table class="table"><tbody>'+rows.map(function(r){return '<tr><td>'+r[0]+'</td><td style="text-align:right"><b>'+money(r[1])+'</b></td></tr>'}).join("")+'</tbody></table></div>'+
        '<div class="callout mt1"><b>Tip:</b> buying lift tickets or a multi-resort pass in advance often saves 20–50% versus the ticket window. <a href="'+root+'trip-planner.html">Get a free custom quote</a> and our partners will try to beat this estimate.</div>';
      SC.track && SC.track("tool_use", {tool:"trip_budget"});
    }
    bud.addEventListener("submit", function(e){ e.preventDefault(); calcBud(); });
    $$("input,select", bud).forEach(function(el){ el.addEventListener("input", calcBud); });
    calcBud();
  }

  /* ---------- Resort compare ---------- */
  var cmp = $("#compareTool");
  if(cmp && SC.fetchSnow){
    var sels = $$("select[data-cmp]", cmp);
    var opts = R.slice().sort(function(a,b){return a.n.localeCompare(b.n)}).map(function(r){return '<option value="'+r.s+'">'+r.n+'</option>'}).join("");
    var defaults = ["whistler-blackcomb","zermatt","niseko"];
    sels.forEach(function(s,i){ s.innerHTML = opts; s.value = defaults[i]; s.addEventListener("change", run); });
    function run(){
      var picks = sels.map(function(s){ return R.filter(function(r){return r.s===s.value})[0]; });
      var out = $("#compareOut"); out.innerHTML = '<div class="skeleton" style="height:180px"></div>';
      SC.fetchSnow(picks).then(function(data){
        var best = data.reduce(function(a,b){ return b.next7 > a.next7 ? b : a; });
        out.innerHTML = '<div class="compare-grid">' + picks.map(function(r,i){ var d = data[i];
          return '<div class="card'+(d===best?' " style="border-color:var(--accent)':'')+'"><h3>'+r.n+'</h3>'+(d===best?'<span class="badge hot">Most snow forecast</span>':'')+
            '<table class="table" style="display:table"><tbody>'+
            '<tr><td>Country</td><td><b>'+r.c+'</b></td></tr>'+
            '<tr><td>Pass</td><td>'+SC.passBadge(r.p)+'</td></tr>'+
            '<tr><td>Top elevation</td><td><b>'+r.top.toLocaleString()+' m</b></td></tr>'+
            '<tr><td>Vertical</td><td><b>'+(r.top-r.base).toLocaleString()+' m</b></td></tr>'+
            '<tr><td>Snow next 7 days</td><td><b>'+Math.round(d.next7)+' cm</b></td></tr>'+
            '<tr><td>Snow last 48h</td><td><b>'+Math.round(d.past48)+' cm</b></td></tr>'+
            '<tr><td>Best for</td><td>'+r.t.join(", ")+'</td></tr></tbody></table>'+
            '<a class="btn btn-sm btn-primary btn-block mt1" href="'+root+'trip-planner.html?resort='+r.s+'">Quote a trip here</a></div>';
        }).join("") + '</div>';
      }).catch(function(){ out.innerHTML = '<p class="muted">Forecast service unavailable — try again shortly.</p>'; });
      SC.track && SC.track("tool_use", {tool:"compare"});
    }
    run();
  }
})();
