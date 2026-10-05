const slides=[...document.querySelectorAll(".slide")];
let current=0, paused=false, elapsed=0, timerId=null, presentationStarted=false;
const timerEl=document.getElementById("timer"), currentEl=document.getElementById("current"), totalEl=document.getElementById("total"), progress=document.getElementById("deckProgress");
totalEl.textContent=String(slides.length).padStart(2,"0");

const sales=[1.73,1.75,1.78,2.39,2.07,1.70];
const months=["Apr'26","May'26","Jun'26","Jul'26","Aug'26","Sep'26"];
const shops=[
["மில் ஷாப்",1.9370563],["விநாயகபுரம்",1.1818076],["இளம்பிள்ளை",1.173415639],
["நாமகிரிப்பேட்டை",0.939554071],["மெட்டாலா",0.760471446],["வேடுகத்தாம்பட்டி",0.673327587],
["எடப்பாடி",0.57357125],["வாழப்பாடி",0.54739735],["பெருமாகவுண்டன்பட்டி",0.532297251],
["உழவர் சந்தை",0.50945295],["ஆண்டலூர் கேட்",0.45815133],["பேளூர்",0.399096189],
["குமாரமங்கலம்",0.38557338],["தட்டாஞ்சாவடி",0.3442405],["மல்லசமுத்திரம்",0.334045665],
["திருச்செங்கோடு",0.270705],["வெண்ணந்தூர்",0.252115181],["ராசிபுரம்",0.196673486]
];
const rice={
"April'26":[["SMG புல்லட்",1927],["SMG நந்தி RNR",1269],["SMG கோல்டு",984],["நாச்சியார்",921],["ராஜகோபுரம்",701],["தங்ககோபுரம்",569],["SMG கோபுரம்",607]],
"May'26":[["SMG புல்லட்",1721],["SMG நந்தி RNR",1164],["SMG கோல்டு",1072],["நாச்சியார்",887],["தங்ககோபுரம்",577],["SMG கோபுரம்",531],["ரெட்டை குறிஞ்சரை",528]],
"June'26":[["SMG புல்லட்",1713],["நாச்சியார்",1233],["SMG நந்தி RNR",1089],["SMG கோல்டு",1007],["ரெட்டை குறிஞ்சரை",729],["தங்ககோபுரம்",578],["SMG கோபுரம்",505]],
"July'26":[["SMG புல்லட்",1972],["SMG கோல்டு",1259],["தங்ககோபுரம்",1127],["SMG நந்தி RNR",1128],["நாச்சியார்",1162],["ரெட்டை குறிஞ்சரை",900],["ராஜகோபுரம்",827]],
"August'26":[["SMG நந்தி RNR",1892],["SMG புல்லட்",1443],["SMG கோல்டு",868],["தங்ககோபுரம்",566],["ஸ்ரீ அன்னபூர்ணா",739],["அண்ணாமலையார்",729],["SMG கோபுரம்",418]],
"September'26":[["SMG நந்தி RNR",1706],["SMG புல்லட்",1305],["அண்ணாமலையார்",713],["தங்கமயில்",670],["SMG கோல்டு",578],["கிருஷ்ணா",480],["தங்ககோபுரம்",374]]
};
const riceTotals={"April'26":10067,"May'26":9704,"June'26":10218,"July'26":13710,"August'26":9989,"September'26":7561};

function showSlide(n){
  current=(n+slides.length)%slides.length;
  slides.forEach((s,i)=>s.classList.toggle("active",i===current));
  currentEl.textContent=String(current+1).padStart(2,"0");
  progress.style.width=((current+1)/slides.length*100)+"%";
  animateSlide(slides[current]);
}
function next(){showSlide(current+1)}
function prev(){showSlide(current-1)}

function animateCount(el,target,suffix="",prefix=""){
  const start=performance.now(),dur=900;
  function tick(t){
    const p=Math.min(1,(t-start)/dur),e=1-Math.pow(1-p,3),v=target*e;
    el.textContent=prefix+(Number.isInteger(target)?Math.round(v).toLocaleString("en-IN"):v.toFixed(0).toLocaleString("en-IN"))+suffix;
    if(p<1)requestAnimationFrame(tick);
  } requestAnimationFrame(tick);
}
function drawSalesChart(){
  const box=document.getElementById("salesChart"); if(!box)return;
  const max=2.5,min=1.5,w=900,h=210,pad=18;
  const pts=sales.map((v,i)=>[(i/(sales.length-1))*(w-pad*2)+pad,h-((v-min)/(max-min))*(h-pad*2)-pad]);
  const poly=pts.map(p=>p.join(",")).join(" ");
  box.innerHTML=`<svg class="line-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${poly}" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1400" stroke-dashoffset="1400">
      <animate attributeName="stroke-dashoffset" from="1400" to="0" dur="1.4s" fill="freeze"/>
    </polyline>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#ffd21c"><animate attributeName="r" from="0" to="6" begin="${i*.12}s" dur=".35s" fill="freeze"/></circle><text x="${p[0]}" y="${p[1]-12}" fill="#111827" text-anchor="middle" font-size="13" font-weight="700">${sales[i].toFixed(2)}</text>`).join("")}
  </svg>`;
  document.getElementById("salesAxis").innerHTML=months.map(x=>`<span>${x}</span>`).join("");
}
function drawBars(){
  const box=document.getElementById("salesBars");if(!box)return;
  box.innerHTML=sales.map((v,i)=>`<div class="bar-col ${i===3?'peak':''}"><div class="bar-value">${v.toFixed(2)}</div><div class="bar" style="height:0" data-h="${Math.max(20,v/2.5*270)}px"></div><div class="bar-label">${months[i]}</div></div>`).join("");
  requestAnimationFrame(()=>box.querySelectorAll(".bar").forEach((b,i)=>setTimeout(()=>b.style.height=b.dataset.h,i*120)));
}
function drawShops(){
  const box=document.getElementById("shopList");if(!box)return;
  const max=shops[0][1];
  box.innerHTML=shops.map((s,i)=>`<div class="shop-row"><span class="rank">${String(i+1).padStart(2,"0")}</span><span class="shop-name">${s[0]}</span><div class="shop-bar"><i data-w="${s[1]/max*100}"></i></div><span class="shop-val">₹${s[1].toFixed(2)} Cr</span></div>`).join("");
  setTimeout(()=>box.querySelectorAll("i").forEach((b,i)=>setTimeout(()=>b.style.width=b.dataset.w+"%",i*35)),80);
}
function drawRice(month="September'26"){
  const rows=rice[month],total=riceTotals[month];
  document.getElementById("riceMonth").textContent=month;
  document.getElementById("riceTotal").textContent=total.toLocaleString("en-IN")+" Qty";
  document.getElementById("riceRows").innerHTML=rows.map((r,i)=>`<div class="rice-row"><span class="r">0${i+1}</span><span class="n">${r[0]}</span><div class="rice-bar"><i data-w="${r[1]/rows[0][1]*100}"></i></div><span class="q">${r[1].toLocaleString("en-IN")}</span></div>`).join("");
  setTimeout(()=>document.querySelectorAll(".rice-bar i").forEach((b,i)=>setTimeout(()=>b.style.width=b.dataset.w+"%",i*70)),80);
}

const fullShopData=[["மில் ஷாப்", [2952848, 3004703, 2848411, 3672901, 3724106, 3167594], 21000000], ["விநாயகபுரம்", [1746504, 2021534, 1656440, 2410023, 2220275, 1763300], 15000000], ["இளம்பிள்ளை", [1945722, 1667794, 1842126, 2809069, 1832055, 1637390], 16800000], ["நாமகிரிப்பேட்டை", [1661465, 1548434, 1562143, 1992628, 1441848, 1189023], 12000000], ["மெட்டாலா", [1138490, 1228876, 1173810, 1658064, 1316887, 1088587], 9000000], ["வேடுகத்தாம்பட்டி", [1053065, 1002327, 1310667, 1375500, 1069880, 921837], 10800000], ["பெருமாகவுண்டன்பட்டி", [788008, 791850, 890929, 965535, 956049, 930602], 7800000], ["உழவர்சந்தை", [779906, 766993, 748344, 1032746, 947067, 819474], 7800000], ["பேளூர்", [504216, 552634, 612557, 836693, 824814, 660048], 4800000], ["திருச்செங்கோடு", [485643, 427193, 459493, 711664, 314988, 308069], 4200000], ["வெண்ணந்தூர்", [429855, 450594, 385059, 537094, 438393, 280157], 4200000], ["ஆண்டலூர் கேட்", [652400, 662867, 892989, 830360, 892347, 650550], 5400000], ["எடப்பாடி", [772179, 742940, 837025, 1188872, 1405405, 789292], 7200000], ["மல்லசமுத்திரம்", [486352, 594188, 378178, 959107, 533710, 388922], 4800000], ["தட்டாஞ்சாவடி", [581534, 573998, 612557, 618189, 561966, 494161], 4800000], ["வாழப்பாடி", [794921, 705568, 845718, 1080918, 1163472, 883377], 7200000], ["ராசிபுரம்", [254042, 292020, 319578, 371488, 355413, 374194], 3000000], ["குமாரமங்கலம்", [429855, 495043, 535339, 881785, 797205, 716507], 4200000]];
function renderFullSales(){
  const body=document.getElementById("fullSalesBody");
  if(!body)return;
  body.innerHTML=fullShopData.map((r,i)=>{
    const actual=r[1].reduce((a,b)=>a+b,0);
    const target=r[2];
    const variance=actual-target;
    const fmt=v=>Number(v).toLocaleString("en-IN");
    return `<tr>
      <td>${String(i+1).padStart(2,"0")}</td>
      <td class="name-cell">${r[0]}</td>
      ${r[1].map(v=>`<td>${fmt(v)}</td>`).join("")}
      <td class="actual">${fmt(actual)}</td>
      <td class="target">${fmt(target)}</td>
      <td class="${variance<0?"negative":"positive"}">${variance<0?"−":""}${fmt(Math.abs(variance))}</td>
    </tr>`;
  }).join("");
}
function setupTabs(){
  const box=document.getElementById("monthTabs");
  Object.keys(rice).forEach((m,i)=>{const b=document.createElement("button");b.textContent=m.replace("'26","");b.onclick=()=>{document.querySelectorAll(".month-tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");drawRice(m)};if(i===5)b.classList.add("active");box.appendChild(b)});
}
function animateSlide(s){
  s.querySelectorAll("[data-count]").forEach(el=>animateCount(el,Number(el.dataset.count),el.dataset.suffix||"",el.dataset.prefix||""));
  s.querySelectorAll(".pct").forEach(el=>{const t=Number(el.dataset.pct);animateCount(el,t,"%","")});
  s.querySelectorAll(".progress i").forEach(b=>{b.style.width="0";setTimeout(()=>b.style.width=getComputedStyle(b).getPropertyValue("--pct"),80)});
  if(s.querySelector("#salesChart"))drawSalesChart();
  if(s.querySelector("#salesBars"))drawBars();
  if(s.querySelector("#shopList"))drawShops();
  if(s.querySelector("#riceRows"))drawRice();
}
function startTimer(){
  if(timerId)return;
  timerId=setInterval(()=>{if(!presentationStarted||paused)return;elapsed++;const left=Math.max(0,1800-elapsed);const m=Math.floor(left/60),s=left%60;timerEl.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;if(left===0){clearInterval(timerId);timerId=null}},1000);
}
function startPresentation(){
  presentationStarted=true; paused=false; showSlide(1); startTimer();
  if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
}
document.getElementById("startBtn").onclick=startPresentation;
document.getElementById("next").onclick=next;
document.getElementById("prev").onclick=prev;
document.getElementById("pause").onclick=()=>{paused=!paused;document.getElementById("pause").textContent=paused?"▶":"Ⅱ"};
document.getElementById("full").onclick=()=>document.documentElement.requestFullscreen?.();
document.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"||e.key===" "){e.preventDefault();next()}
  if(e.key==="ArrowLeft"){e.preventDefault();prev()}
  if(e.key.toLowerCase()==="f")document.documentElement.requestFullscreen?.();
  if(e.key.toLowerCase()==="p")document.getElementById("pause").click();
  if(e.key==="Home")showSlide(0,1);
  if(e.key==="End")showSlide(slides.length-1);
});
setupTabs();drawRice();renderFullSales();showSlide(0);

function boostChartLabels(){
 document.querySelectorAll("svg text").forEach(t=>{
   t.style.fill="#111827";
   t.style.color="#111827";
   t.style.opacity="1";
   t.style.fontWeight="800";
 });
 document.querySelectorAll("svg circle").forEach(c=>{
   c.style.fill="#ffd21c"; c.style.stroke="#111827"; c.style.strokeWidth="2";
 });
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(boostChartLabels,100));

/* trendYellowFinal */
document.addEventListener("DOMContentLoaded",()=>{
  setTimeout(()=>{
    document.querySelectorAll(".trend-layout .bar-col.peak .bar").forEach(b=>{
      b.style.background="#ffd21c";
      b.style.boxShadow="0 8px 22px rgba(255,210,28,.32)";
    });
  },150);
});
