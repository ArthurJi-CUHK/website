/* Aggregate page views only. The UUID lives in this document and only deduplicates retries. */
(() => {
  'use strict';
  const KEY='arthur-visitor-count-off';
  const SITE='https://arthurji-cuhk.github.io';
  const labels={
    en:{eyebrow:'AROUND THE WORLD',title:'Hello, from around the world.',visits:'Recorded page views',countries:'Countries / regions',total:'Since Nov 12, 2026',sync:'Updated',checking:'Connecting…',retry:'Refresh delayed',cadence:'Refreshes every minute',disable:'Turn off visit counting',enable:'Allow visit counting',blocked:'Counting is off in this browser.',off:'Visit counting is off for this browser.',on:'Visit counting is on.',failed:'Your preference could not be saved.'},
    zh:{eyebrow:'好奇心，让世界相遇',title:'来自世界各地的问候。',visits:'累计浏览次数',countries:'国家／地区',total:'自 2026 年 11 月 12 日起',sync:'更新于',checking:'正在同步…',retry:'更新延迟',cadence:'每分钟刷新',disable:'停用访问计数',enable:'启用访问计数',blocked:'此浏览器已停用访问计数。',off:'此浏览器的访问计数已关闭。',on:'访问计数已开启。',failed:'未能保存偏好。'}
  };
  let lang=document.documentElement.lang.startsWith('zh')?'zh':'en', el, globe, stats, stopped=false;
  let busy=false, stale=false, timer, sent=false, sending=false, retryCount=0, visitId='', preferOff=false, lastRead=0;
  const shown={};
  const validInt=n=>Number.isSafeInteger(n)&&n>=0;
  const dnt=()=>navigator.globalPrivacyControl===true||[navigator.doNotTrack,navigator.msDoNotTrack,window.doNotTrack].some(s=>s==='1'||s==='yes');
  const preference=()=>{try{return localStorage.getItem(KEY)==='yes';}catch{return true;}};
  const make=(tag,className,parent)=>{const node=document.createElement(tag);node.className=className;parent?.append(node);return node;};
  function endpoint(){
    try {const url=new URL(window.SITE_CONFIG?.visitorStatsEndpoint);return url.protocol==='https:'&&url.pathname==='/stats'&&!url.search&&!url.hash&&!url.username&&!url.password?url:null;}catch{return null;}
  }
  const statsURL=endpoint();
  const visitURL=statsURL&&new URL('/visit',statsURL);
  function metric(name,n){
    if(shown[name]===n)return;
    shown[name]=n;
    if(!validInt(n)){el[name].textContent='—';return;}
    if(!window.SiteNumbers?.set(el[name],n))el[name].textContent=String(n);
  }
  function render(){
    if(!el)return;
    const t=labels[lang];
    for(const name of ['eyebrow','title','visits','countries','total'])el[name].textContent=t[name];
    metric('visitValue',stats?.totalPageviews);
    metric('countryValue',stats?.countryCount);
    if(!stats){el.meta.textContent=stale?t.retry:t.checking;}
    else {
      const at=new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(stats.updatedAt));
      el.meta.textContent=stale?`${t.retry} · ${t.sync} ${at}`:`${t.sync} ${at} · ${t.cadence}`;
    }
    globe?.setCountries(stats?.countryCodes||[]);globe?.setLanguage(lang);
    if(el.toggle){el.toggle.textContent=preferOff?t.enable:t.disable;el.toggle.disabled=dnt();el.privacyStatus.textContent=dnt()?t.blocked:preferOff?t.off:t.on;}
  }
  function accept(data){
    if(data?.version!==1||data.provider!=='Cloudflare'||!validInt(data.totalPageviews)||!validInt(data.countryCount)||
       data.countryCount>250||data.countryCount>data.totalPageviews||!Array.isArray(data.countryCodes)||
       data.countryCodes.length!==data.countryCount||new Set(data.countryCodes).size!==data.countryCount||
       data.countryCodes.some(s=>typeof s!=='string'||!/^[A-Z]{2}$/.test(s)||s==='ZZ')||!Number.isFinite(Date.parse(data.updatedAt)))return false;
    if(!stats||data.totalPageviews>=stats.totalPageviews)stats=data;
    stale=false;return true;
  }
  function options(extra={}){return{mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal:AbortSignal.timeout(9000),...extra};}
  async function read(force=false){
    if(stopped||busy||document.hidden)return;
    clearTimeout(timer);
    if(!force&&Date.now()-lastRead<60000){timer=setTimeout(read,60000-(Date.now()-lastRead));return;}
    lastRead=Date.now();busy=true;
    try{const r=await fetch(statsURL,options());if(!r.ok||!accept(await r.json()))throw Error();}
    catch{stale=true;}
    finally{busy=false;render();if(!stopped&&!document.hidden)timer=setTimeout(read,60000);}
  }
  async function record(){
    if(stopped||sending||sent||retryCount>=2||preferOff||dnt()||document.hidden||document.prerendering||location.origin!==SITE||!crypto.randomUUID)return;
    visitId ||= crypto.randomUUID();sending=true;retryCount++;
    try{
      const response=await fetch(visitURL,options({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitId})}));
      if(!response.ok)throw Error();
      const result=await response.json();if(typeof result.recorded!=='boolean')throw Error();
      sent=true;
      if(accept(result.stats))render();else read(true);
    }catch{if(retryCount<2)setTimeout(record,15000);}
    finally{sending=false;}
  }
  function init(){
    const root=document.getElementById('visitorMap');if(!root||!statsURL)return;
    preferOff=preference();
    el={};root.classList.add('visitor-map');
    const card=make('div','vm-card',root),copy=make('div','vm-copy',card);
    el.eyebrow=make('p','vm-eyebrow',copy);el.title=make('h2','vm-title',copy);
    const metrics=make('div','vm-metrics',copy);
    const a=make('div','vm-metric',metrics),b=make('div','vm-metric',metrics);
    el.visitValue=make('strong','vm-metric-number',a);el.visitValue.textContent='—';
    el.countryValue=make('strong','vm-metric-number',b);el.countryValue.textContent='—';
    el.visits=make('span','vm-metric-label',a);el.countries=make('span','vm-metric-label',b);
    el.total=make('span','vm-metric-scope',a);el.meta=make('p','vm-stats-meta',copy);
    const host=make('div','vm-host',card);globe=window.VisitorGlobe?.mount(host);
    const dialog=document.getElementById('privacyDialog');
    if(dialog){
      const group=make('section','vm-privacy-group',dialog);
      el.privacyStatus=make('p','vm-status',group);el.privacyStatus.setAttribute('role','status');
      el.toggle=make('button','vm-button vm-button-secondary',group);el.toggle.type='button';
      el.toggle.addEventListener('click',()=>{
        if(dnt())return;
        const next=!preferOff;
        try{if(next)localStorage.setItem(KEY,'yes');else localStorage.removeItem(KEY);preferOff=next;render();if(!preferOff)record();}
        catch{el.privacyStatus.textContent=labels[lang].failed;}
      });
    }
    root.dataset.visitorMapReady='true';root.hidden=false;render();
    window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){preferOff=preference();render();}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);}else{render();read();record();}});
    window.addEventListener('pagehide',()=>{stopped=true;clearTimeout(timer);});
    window.addEventListener('pageshow',()=>{stopped=false;render();read();record();});
    document.addEventListener('prerenderingchange',record,{once:true});
    read();record();
  }
  window.VisitorMap=Object.freeze({setLanguage(value){lang=String(value).startsWith('zh')?'zh':'en';render();}});
  init();
})();
