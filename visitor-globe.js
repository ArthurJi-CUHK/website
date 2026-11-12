(() => {
  'use strict';
  const radians=Math.PI/180;
  const words={en:{globe:'Visitor globe. Drag or use the arrow keys to turn.',play:'Start globe rotation',pause:'Pause globe rotation'},zh:{globe:'访客地球。拖动或按方向键旋转。',play:'开始旋转地球',pause:'暂停旋转地球'}};
  const mounted=new WeakMap();
  const make=(tag,className)=>Object.assign(document.createElement(tag),{className});
  const point=(lon,lat)=>{
    const l=lon*radians,b=lat*radians,c=Math.cos(b);
    return [c*Math.sin(l),Math.sin(b),c*Math.cos(l)];
  };
  const range=(start,end,step)=>Array.from({length:Math.floor((end-start)/step)+1},(_,i)=>start+step*i);
  const graticule=[
    ...range(-60,60,30).map(lat=>range(-180,180,5).map(lon=>point(lon,lat))),
    ...range(0,330,30).map(lon=>range(-90,90,5).map(lat=>point(lon,lat)))
  ];

  function mount(host) {
    if (!(host instanceof HTMLElement)) return null;
    if(mounted.has(host)) return mounted.get(host);
    const data=window.VisitorGlobeGeo;
    if(!data?.land?.length || !data?.centers) return null;
    const land=[];
    for(let i=0;i<data.land.length;i+=2) land.push(point(data.land[i],data.land[i+1]));

    const canvas=make('canvas','vg-canvas');
    const ctx=canvas.getContext('2d');
    if(!ctx) return null;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const toggle=make('button','vg-toggle');
    toggle.type='button';
    canvas.tabIndex=0;
    canvas.setAttribute('role','img');
    host.replaceChildren(canvas,toggle);
    host.classList.add('vg-globe');

    let lang='en', yaw=38, pitch=19, selected=[], hasOriented=false, interacted=false;
    let w=0,h=0,frame=0,last=0,visible=false,playing=!motion.matches,dirty=true,drag=null;

    function refreshLabels(){
      const t=words[lang];
      canvas.setAttribute('aria-label',t.globe);
      toggle.textContent=playing?'Ⅱ':'▷';
      toggle.setAttribute('aria-label',playing?t.pause:t.play);
      toggle.title=playing?t.pause:t.play;
    }

    function paint() {
      if(!w||!h)return;
      const cx=w/2,cy=h/2,r=Math.min(w,h)*.405;
      const y=yaw*radians,p=pitch*radians;
      const sy=Math.sin(y),cyaw=Math.cos(y),sp=Math.sin(p),cp=Math.cos(p);
      const project=([vx,vy,vz])=>{
        const depth=vx*sy+vz*cyaw;
        return [vx*cyaw-vz*sy,vy*cp-depth*sp,vy*sp+depth*cp];
      };
      ctx.clearRect(0,0,w,h);
      ctx.beginPath();ctx.arc(cx,cy,r*1.13,0,Math.PI*2);
      const atmosphere=ctx.createRadialGradient(cx,cy,r*.88,cx,cy,r*1.13);
      atmosphere.addColorStop(0,'#8de2cd30');atmosphere.addColorStop(.6,'#6cc9c433');atmosphere.addColorStop(1,'#6cc9c400');
      ctx.fillStyle=atmosphere;ctx.fill();
      const ocean=ctx.createRadialGradient(cx-r*.46,cy-r*.5,r*.04,cx+r*.12,cy+r*.12,r*1.14);
      ocean.addColorStop(0,'#235565');ocean.addColorStop(.56,'#133644');ocean.addColorStop(1,'#081b2b');
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=ocean;ctx.fill();ctx.clip();

      ctx.lineWidth=.55;ctx.strokeStyle='#9bd7db32';
      ctx.beginPath();
      for(const line of graticule){
        let prev=null;
        for(const geo of line){
          const [x,y,z]=project(geo);
          if(z>=0){
            if(prev)ctx.lineTo(cx+x*r,cy-y*r);
            else ctx.moveTo(cx+x*r,cy-y*r);
          }
          prev=z>=0;
        }
      }
      ctx.stroke();

      // Mint pixels are land texture. Gold halos are exclusively verified aggregate locations.
      for(const geo of land){
        const [x,y,z]=project(geo);
        if(z<=.01)continue;
        ctx.globalAlpha=.25+z*.53;
        ctx.fillStyle='#91d5bf';
        const size=(.72+z*.51)*r/117;
        ctx.fillRect(cx+x*r-size,cy-y*r-size,size*2,size*2);
      }
      ctx.globalAlpha=1;
      for(const geo of selected){
        const [x,y,z]=project(geo);
        if(z<.055)continue;
        const px=cx+x*r,py=cy-y*r,dot=Math.max(2.7,r*.029),halo=dot*5.4;
        const glow=ctx.createRadialGradient(px,py,dot*.6,px,py,halo);
        glow.addColorStop(0,'#ffc86bd4');glow.addColorStop(.32,'#f3ae5a4d');glow.addColorStop(1,'#f3ae5a00');
        ctx.beginPath();ctx.arc(px,py,halo,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();
        ctx.beginPath();ctx.arc(px,py,dot*1.65,0,Math.PI*2);ctx.strokeStyle='#ffd88cbf';ctx.lineWidth=1;ctx.stroke();
        ctx.beginPath();ctx.arc(px,py,dot,0,Math.PI*2);ctx.fillStyle='#ffe4ab';ctx.fill();
      }
      ctx.restore();
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='#a0dbd3a6';ctx.lineWidth=1;ctx.stroke();
    }

    function tick(now){
      frame=0;
      if(!visible||document.hidden){last=0;return;}
      const moving=playing&&!drag;
      if(moving&&last&&now-last<30){frame=requestAnimationFrame(tick);return;}
      if(moving&&last)yaw=(yaw+Math.min(now-last,65)*.006)%360;
      last=moving?now:0;
      if(dirty||moving){paint();dirty=false;}
      if(moving)frame=requestAnimationFrame(tick);
    }
    function invalidate(){dirty=true;if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
    function resumeOrStop(){last=0;if(visible&&!document.hidden)invalidate();else if(frame){cancelAnimationFrame(frame);frame=0;}}
    const observer='IntersectionObserver' in window?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resumeOrStop();},{threshold:0}):null;
    if(observer)observer.observe(host);else visible=true;
    function resize(){
      const bounds=canvas.getBoundingClientRect();
      const dpr=Math.min(window.devicePixelRatio||1,2);
      w=bounds.width;h=bounds.height;
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);invalidate();
    }
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(host);else window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',resumeOrStop);
    motion.addEventListener?.('change',event=>{if(event.matches){playing=false;last=0;refreshLabels();invalidate();}});
    function playPause(){playing=!playing;last=0;refreshLabels();invalidate();}
    function turn(dx,dy){interacted=true;yaw=(yaw+dx)%360;pitch=Math.max(-72,Math.min(72,pitch+dy));invalidate();}

    toggle.addEventListener('click',playPause);
    canvas.addEventListener('keydown',event=>{
      const steps={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,9],ArrowDown:[0,-9]};
      if(Object.hasOwn(steps,event.key)){event.preventDefault();playing=false;last=0;turn(...steps[event.key]);refreshLabels();}
      else if(event.key==='Home'){event.preventDefault();playing=false;last=0;yaw=38;pitch=19;interacted=true;refreshLabels();invalidate();}
      else if(event.key===' '||event.key==='Enter'){event.preventDefault();playPause();}
    });
    canvas.addEventListener('pointerdown',event=>{
      if(drag||event.button!==0)return;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY};
      canvas.setPointerCapture?.(event.pointerId);
      host.classList.add('vg-dragging');
      last=0;
    });
    canvas.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      const scale=116/Math.max(w,120);
      turn((drag.x-event.clientX)*scale,(event.clientY-drag.y)*scale);
      drag.x=event.clientX;drag.y=event.clientY;
    });
    const release=event=>{
      if(!drag||event.pointerId!==drag.id)return;
      drag=null;host.classList.remove('vg-dragging');last=0;invalidate();
    };
    for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);

    const globe={
      setCountries(codes){
        const valid=Array.isArray(codes)?[...new Set(codes)].filter(code=>typeof code==='string'&&/^[A-Z]{2}$/.test(code)&&Object.hasOwn(data.centers,code)):[];
        selected=valid.map(code=>point(...data.centers[code]));
        if(valid.length&&!hasOriented&&!interacted){
          const [lon,lat]=data.centers[valid[0]];yaw=lon-12;pitch=Math.max(-52,Math.min(52,lat*.66));hasOriented=true;
        }
        invalidate();
      },
      setLanguage(value){lang=String(value).toLowerCase().startsWith('zh')?'zh':'en';refreshLabels();}
    };
    mounted.set(host,globe);
    refreshLabels();resize();
    return globe;
  }
  window.VisitorGlobe={mount};
})();
