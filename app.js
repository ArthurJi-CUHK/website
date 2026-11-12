(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const storage = {get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}},remove(k){try{localStorage.removeItem(k);}catch{}}};
  let lang = storage.get('arthur-language') || (navigator.language.startsWith('zh') ? 'zh' : 'en');
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
    $('#moreAwards').innerHTML=PROFILE.awards.map(a=>`<p>${esc(a[lang==='zh'?1:0]).replace(/× (\d+)\b/g,(_,n)=>`× <span data-count="${n}">${n}</span>`)}</p>`).join('');
    $('#timeline').className='timeline';
    $('#timeline').innerHTML=PROFILE.timeline.map(t=>`<div><time>${lang==='zh'?t.date.replace('PRESENT','至今'):t.date}</time><h3>${t[lang][0]}</h3><p>${t[lang][1]}</p></div>`).join('');
    renderPapers(); updateCycle(); window.LifeGallery?.setLanguage(lang); window.ResearchDemo?.setLanguage(lang); window.SiteAnalytics?.setLanguage(lang); window.VisitorMap?.setLanguage(lang);
  }
  $('#language').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';storage.set('arthur-language',lang);render();});
  all('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;all('[data-filter]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});renderPapers();}));
  $('#paperList').addEventListener('click',async e=>{const b=e.target.closest('[data-cite]');if(!b)return;const p=PROFILE.papers[Number(b.dataset.cite)];try{await navigator.clipboard.writeText(`${p.authors}. ${p.citationTitle||p.title}. ${p.venue}.${p.url?' '+p.url:''}`);toast(lang==='zh'?'引用已复制':'Citation copied');}catch{toast(lang==='zh'?'请直接选中论文文字复制':'Please select the publication text to copy.');}});
  const setTheme = t => {document.documentElement.dataset.theme=t;$('#theme').textContent=t==='night'?'☼':'☾';$('#theme').setAttribute('aria-label',t==='night'?'Switch to daylight theme':'Switch to deep sea theme');};
  setTheme(storage.get('arthur-theme')==='day'?'day':'night');
  $('#theme').addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='night'?'day':'night';setTheme(t);storage.set('arthur-theme',t);});
  const updateCycle=()=>{const day=Number($('#cycleRange').value);$('#dayValue').textContent=day;$('.cycle-arc').style.strokeDashoffset=565*(1-day/28);const weekdays=lang==='zh'?['星期一','星期二','星期三','星期四','星期五','星期六','星期日']:['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];const weekday=weekdays[(day-1)%7];if($('#weekdayValue'))$('#weekdayValue').textContent=weekday;$('#cycleRange').setAttribute('aria-valuetext',(lang==='zh'?'周期第 '+day+' 天，':'Cycle day '+day+', ')+weekday);};
  $('#cycleRange').addEventListener('input',updateCycle);updateCycle();
  $('#print').addEventListener('click',()=>window.print());
  $('#privacy').addEventListener('click',()=>$('#privacyDialog').showModal());
  $('#privacyDialog .close').addEventListener('click',()=>$('#privacyDialog').close());
  $('#privacyDialog').addEventListener('click',e=>{if(e.target===$('#privacyDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
  let scrollFrame=0;
  const progress=()=>{scrollFrame=0;const ratio=Math.max(0,Math.min(1,window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));$('#voyageFill').style.transform='scaleX('+ratio+')';$('#voyageBoat').style.transform='translate3d('+ (4+ratio*Math.max(0,innerWidth-36)) +'px,0,0)';};
  const queueProgress=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(progress);};
  window.addEventListener('scroll',queueProgress,{passive:true});window.addEventListener('resize',queueProgress);progress();
  const careScene=$('.care-scene');
  if(careScene&&'IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>careScene.classList.toggle('is-in-view',entry.isIntersecting&&entry.intersectionRatio>=.2),{threshold:[0,.2]}).observe(careScene);
  }
  // A quiet, locally rendered night sky. Respect reduced motion and background tabs.
  const canvas=$('#sky'),ctx=canvas.getContext('2d');let width=0,height=0,stars=[],raf=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let heroVisible=true;
  function resize(){const d=Math.min(devicePixelRatio||1,2);width=canvas.clientWidth;height=canvas.clientHeight;canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);stars=Array.from({length:70},(_,i)=>({x:((i*73.63)%100)/100*width,y:((i*31.37)%100)/100*height*.8,r:.5+(i%3)*.3}));draw(0);}
  function draw(t){ctx.clearRect(0,0,width,height);stars.forEach((s,i)=>{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(190,219,223,${.15+.22*(1+Math.sin(t*.0003+i))/2})`;ctx.fill();});for(let j=0;j<6;j++){ctx.beginPath();for(let x=0;x<=width;x+=10){const y=height-70-j*13+Math.sin(x*.006+(reduced.matches?0:t*.00012)+j*.4)*(8+j*3);x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=`rgba(105,183,183,${.05+j*.012})`;ctx.lineWidth=.7;ctx.stroke();}}
  function animate(t){draw(t);if(!reduced.matches&&!document.hidden&&heroVisible)raf=requestAnimationFrame(animate);}
  function restart(){cancelAnimationFrame(raf);draw(0);if(!reduced.matches&&!document.hidden&&heroVisible)raf=requestAnimationFrame(animate);}
  new ResizeObserver(resize).observe(canvas);document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;restart();}).observe($('#home'));restart();
  // Original individual synthesized notes: no recording, autoplay or microphone use.
  const notes=[261.63,293.66,329.63,349.23,392,440,493.88,523.25],letters='ASDFGHJK';let audio;
  $('#piano').innerHTML=notes.map((_,i)=>`<button class="key" data-note="${i}" aria-label="Play ${['C','D','E','F','G','A','B','C'][i]}${i===7?'5':'4'}">${letters[i]}</button>`).join('');
  async function play(i){try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')await audio.resume();const key=all('.key')[i];key.classList.add('playing');setTimeout(()=>key.classList.remove('playing'),250);const now=audio.currentTime;[1,2,3].forEach((h)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=notes[i]*h;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.12/(h*h),now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+1.8/h);o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+2);});}catch{toast(lang==='zh'?'当前浏览器不支持音频':'Audio is unavailable in this browser.');}}
  all('.key').forEach((k,i)=>k.addEventListener('click',()=>play(i)));
  document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||$('#privacyDialog').open)return;const i=letters.indexOf(e.key.toUpperCase());const r=$('#piano').getBoundingClientRect();if(i>=0&&r.top<innerHeight&&r.bottom>0){e.preventDefault();play(i);}});
  render();
})();
