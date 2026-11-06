(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const storage = {get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}},remove(k){try{localStorage.removeItem(k);}catch{}}};
  let lang = storage.get('arthur-language') === 'zh' ? 'zh' : 'en';
  let filter = 'all';
  const en = {};
  all('[data-t]').forEach(el => { en[el.dataset.t] = el.innerHTML; });
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(text){ $('#toast').textContent=text; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2400); }
  function renderPapers(){
    $('#paperList').innerHTML=PROFILE.papers.filter(p=>filter==='all'||p.category===filter).map(p=>`<article class="paper"><div class="paper-type">${p.type}</div><div><h3>${esc(p.title)}</h3><p class="authors">${esc(p.authors).replace(/Xiang Ji/g,'<strong>Xiang Ji</strong>')}</p><p class="venue">${esc(p.venue)}</p><div class="paper-actions">${p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener">DOI ↗</a>`:''}<button data-cite="${PROFILE.papers.indexOf(p)}">${lang==='zh'?'复制引用':'Copy citation'} ↗</button></div></div></article>`).join('');
  }
  function render(){
    document.documentElement.lang = lang==='zh'?'zh-CN':'en';
    all('[data-t]').forEach(el=>el.innerHTML=(lang==='zh'?ZH:en)[el.dataset.t]||en[el.dataset.t]);
    $('#language').textContent=lang==='zh'?'EN':'中文';
    $('#language').setAttribute('aria-label',lang==='zh'?'Switch to English':'切换到中文');
    $('#honorList').innerHTML=PROFILE.honors.map(h=>`<article class="honor"><span class="honor-mark">✧</span><span class="year">${h.year}</span><h3>${h[lang][0]}</h3><p>${h[lang][1]}</p></article>`).join('');
    $('#moreAwards').innerHTML=PROFILE.awards.map(a=>`<p>${esc(a[lang==='zh'?1:0])}</p>`).join('');
    $('#timeline').className='timeline';
    $('#timeline').innerHTML=PROFILE.timeline.map(t=>`<div><time>${lang==='zh'?t.date.replace('PRESENT','至今'):t.date}</time><h3>${t[lang][0]}</h3><p>${t[lang][1]}</p></div>`).join('');
    renderPapers(); renderAnalytics();
  }
  $('#language').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';storage.set('arthur-language',lang);render();});
  all('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;all('[data-filter]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderPapers();}));
  $('#paperList').addEventListener('click',async e=>{const b=e.target.closest('[data-cite]');if(!b)return;const p=PROFILE.papers[Number(b.dataset.cite)];try{await navigator.clipboard.writeText(`${p.authors}. ${p.title}. ${p.venue}.${p.url?' '+p.url:''}`);toast(lang==='zh'?'引用已复制':'Citation copied');}catch{toast(lang==='zh'?'请直接选中论文文字复制':'Please select the publication text to copy.');}});
  const setTheme = t => {document.documentElement.dataset.theme=t;$('#theme').textContent=t==='night'?'☼':'☾';$('#theme').setAttribute('aria-label',t==='night'?'Switch to daylight theme':'Switch to deep sea theme');};
  setTheme(storage.get('arthur-theme')==='day'?'day':'night');
  $('#theme').addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='night'?'day':'night';setTheme(t);storage.set('arthur-theme',t);});
  const updateCycle=()=>{const day=Number($('#cycleRange').value);$('#dayValue').textContent=day;$('.cycle-arc').style.strokeDashoffset=565*(1-day/28);};
  $('#cycleRange').addEventListener('input',updateCycle);updateCycle();
  $('#print').addEventListener('click',()=>window.print());
  $('#privacy').addEventListener('click',()=>$('#privacyDialog').showModal());
  $('#privacyDialog .close').addEventListener('click',()=>$('#privacyDialog').close());
  $('#privacyDialog').addEventListener('click',e=>{if(e.target===$('#privacyDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  const progress=()=>$('#progress').style.width=`${100*window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)}%`;
  window.addEventListener('scroll',progress,{passive:true});progress();
  // A quiet, locally rendered night sky. Respect reduced motion and background tabs.
  const canvas=$('#sky'),ctx=canvas.getContext('2d');let width=0,height=0,stars=[],raf=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function resize(){const d=Math.min(devicePixelRatio||1,2);width=canvas.clientWidth;height=canvas.clientHeight;canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);stars=Array.from({length:70},(_,i)=>({x:((i*73.63)%100)/100*width,y:((i*31.37)%100)/100*height*.8,r:.5+(i%3)*.3}));draw(0);}
  function draw(t){ctx.clearRect(0,0,width,height);stars.forEach((s,i)=>{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(190,219,223,${.15+.22*(1+Math.sin(t*.0003+i))/2})`;ctx.fill();});for(let j=0;j<6;j++){ctx.beginPath();for(let x=0;x<=width;x+=10){const y=height-70-j*13+Math.sin(x*.006+(reduced.matches?0:t*.00012)+j*.4)*(8+j*3);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=`rgba(105,183,183,${.05+j*.012})`;ctx.lineWidth=.7;ctx.stroke();}}
  function animate(t){draw(t);if(!reduced.matches&&!document.hidden)raf=requestAnimationFrame(animate);}
  function restart(){cancelAnimationFrame(raf);draw(0);if(!reduced.matches&&!document.hidden)raf=requestAnimationFrame(animate);}
  new ResizeObserver(resize).observe(canvas);document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);restart();
  // Original individual synthesized notes: no recording, autoplay or microphone use.
  const notes=[261.63,293.66,329.63,349.23,392,440,493.88,523.25],letters='ASDFGHJK';let audio;
  $('#piano').innerHTML=notes.map((_,i)=>`<button class="key" data-note="${i}" aria-label="Play ${['C','D','E','F','G','A','B','C'][i]}${i===7?'5':'4'}">${letters[i]}</button>`).join('');
  async function play(i){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')await audio.resume();const key=all('.key')[i];key.classList.add('playing');setTimeout(()=>key.classList.remove('playing'),250);const now=audio.currentTime;[1,2,3].forEach((h)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=notes[i]*h;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.12/(h*h),now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+1.8/h);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+2);});}catch{toast(lang==='zh'?'当前浏览器不支持音频':'Audio is unavailable in this browser.');}}
  all('.key').forEach((k,i)=>k.addEventListener('click',()=>play(i)));
  document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||$('#privacyDialog').open)return;const i=letters.indexOf(e.key.toUpperCase());const r=$('#piano').getBoundingClientRect();if(i>=0&&r.top<innerHeight&&r.bottom>0){e.preventDefault();play(i);}});
  // Analytics is explicitly opt-in and stays honestly unconfigured until deployed.
  const endpoint=(window.SITE_CONFIG?.analyticsEndpoint||'').replace(/\/$/,'');let stats=null,analyticsError=false,sending=false,consentVersion=0;
  function renderAnalytics(){
    const consent=storage.get('arthur-analytics')==='yes';
    $('#consent').disabled=!endpoint||consent||sending;
    $('#withdraw').hidden=!consent;
    $('#privacyExtra').textContent=endpoint?(lang==='zh'?'统计服务由 Cloudflare 提供，位置仅精确到国家／地区。':'The analytics service is hosted on Cloudflare. Location is limited to country/region.'):(lang==='zh'?'目前尚未接入统计服务；未发送任何访问统计请求。':'Analytics is not connected yet; no visit-tracking requests are sent.');
    $('#analyticsStatus').textContent=!endpoint?(lang==='zh'?'访客统计尚未启用。此地图没有示例访客或虚构数据。':'Visitor analytics is not enabled yet. No sample visitors or invented counts are shown.'):analyticsError?(lang==='zh'?'统计服务暂时不可用，请稍后再试。':'Visitor statistics are temporarily unavailable. Please try again later.'):(lang==='zh'?'地图仅显示同意统计的国家／地区汇总。访问按日去重，并非总人数。':'Only consenting country/region aggregates are shown. Visits are deduplicated daily, not a count of individual people.');
    if(!stats)return;
    $('#visitCount').textContent=Number(stats.totalVisits).toLocaleString(lang==='zh'?'zh-CN':'en');
    $('#visitorDots').replaceChildren();$('#countryList').replaceChildren();
    const names=new Intl.DisplayNames([lang==='zh'?'zh-CN':'en'],{type:'region'});
    stats.countries.forEach(c=>{if(!/^[A-Z]{2}$/.test(c.country)||!Number.isFinite(c.count)||c.count<0)return;const name=names.of(c.country)||c.country;const li=document.createElement('li');li.textContent=`${name} · ${c.count}`;$('#countryList').append(li);if(!Number.isFinite(c.lat)||!Number.isFinite(c.lon)||Math.abs(c.lat)>90||Math.abs(c.lon)>180)return;const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx',(c.lon+180)/360*1000);circle.setAttribute('cy',(90-c.lat)/180*420);circle.setAttribute('r',Math.min(14,4+Math.log2(c.count+1)));circle.setAttribute('fill','#176a69');circle.setAttribute('opacity','.75');const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=`${name}: ${c.count}`;circle.append(title);$('#visitorDots').append(circle);});
  }
  async function getStats(){if(!endpoint)return;try{const r=await fetch(endpoint+'/stats',{credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error();const data=await r.json();if(!Number.isFinite(data.totalVisits)||!Array.isArray(data.countries))throw Error();stats=data;analyticsError=false;}catch{analyticsError=true;}renderAnalytics();}
  async function countVisit(){if(!endpoint||sending)return;const version=consentVersion;sending=true;renderAnalytics();try{const r=await fetch(endpoint+'/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true}),credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)throw Error();if(version===consentVersion)storage.set('arthur-analytics','yes');analyticsError=false;await getStats();}catch{analyticsError=true;toast(lang==='zh'?'未记录，请稍后再试':'Not recorded. Please try again later.');}finally{sending=false;renderAnalytics();}}
  $('#consent').addEventListener('click',countVisit);
  $('#withdraw').addEventListener('click',()=>{consentVersion++;storage.remove('arthur-analytics');renderAnalytics();toast(lang==='zh'?'已停止未来访问统计':'Future visit tracking stopped');});
  render();getStats();if(endpoint&&storage.get('arthur-analytics')==='yes')countVisit();
})();
