/* Three views, two curtains. Pointer capture is limited to the two handles. */
(() => {
  'use strict';
  const scenes=[
    {image:'life-piano.webp',tone:'piano',en:['Piano','Finding the quiet rhythm.','At the piano, I trade code for keys — and give curiosity a different voice.'],zh:['钢琴','把节律，交给琴键。','写代码之外，也喜欢把时间交给琴键，在音乐里寻找另一种专注。'],altEn:'Arthur playing the piano',altZh:'Arthur 在弹钢琴'},
    {image:'life-diving.webp',tone:'ocean',en:['Ocean','A little deeper. A little freer.','Beneath the surface, the world slows down. Diving reminds me how much there is still to discover.'],zh:['潜水','向深处，多一点自由。','水面之下，世界慢了下来。潜水提醒我，还有很多未知值得探索。'],altEn:'A collage of Arthur exploring underwater',altZh:'Arthur 在水下探索的生活照片拼图'},
    {image:'life-riding.webp',tone:'road',en:['Open road','Another way to move forward.','On two wheels, I enjoy a different kind of momentum — new views, fresh perspectives, and the journey itself.'],zh:['骑行','换一种方式，向前。','在两轮之上，寻找另一种节奏：新的风景、新的视角，还有旅途本身。'],altEn:'Arthur in motorcycle riding gear',altZh:'Arthur 身着摩托骑行装备的生活照'}
  ];
  const ui={
    en:{label:'Different sides of Arthur',eyebrow:'SAME CURIOSITY. DIFFERENT RHYTHMS.',title:'Three sides. One curiosity.',description:'From piano keys to the ocean to the open road — a few things that keep me curious beyond the lab.',hint:'Drag the two dividers. Or choose a side.',reset:'All three',left:'Left curtain',right:'Right curtain',keyboard:'Handles and sliders support arrow keys.',photo:'Personal photographs'},
    zh:{label:'Arthur 的不同侧面',eyebrow:'同一份好奇，不同的节律。',title:'三个侧面，同一份好奇。',description:'从琴键到海洋，再到旅途——实验室之外，这些小小的热爱让我一直保持好奇。',hint:'拖动两条分界，或直接选择一个侧面。',reset:'三面同屏',left:'左侧卷帘',right:'右侧卷帘',keyboard:'拖柄与滑块均支持方向键。',photo:'个人生活照片'}
  };
  let root=null,lang=document.documentElement.lang.startsWith('zh')?'zh':'en';
  let bounds=[100/3,200/3],active=-1,raf=0,timer=0,drag=null;
  const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||min));
  function text(){
    if(!root)return;
    const words=ui[lang],scene=active>=0?scenes[active][lang]:null;
    root.setAttribute('aria-label',words.label);
    root.dataset.lifeActive=String(active);
    $('.life-eyebrow').textContent=words.eyebrow;
    $('.life-title').textContent=scene?scene[1]:words.title;
    $('.life-description').textContent=scene?scene[2]:words.description;
    $('.life-choices').setAttribute('aria-label',words.label);
    $('.life-hint').textContent=words.hint;
    $('.life-reset').textContent=words.reset;
    $('.life-reset').setAttribute('aria-pressed',String(active===-1));
    $('.life-keyboard-note').textContent=words.keyboard;
    all('.life-panel').forEach((panel,i)=>{
      panel.querySelector('img').alt=lang==='zh'?scenes[i].altZh:scenes[i].altEn;
      panel.querySelector('.life-panel-name').textContent=scenes[i][lang][0];
      panel.classList.toggle('life-featured',active===i);
    });
    all('.life-choice').forEach((button,i)=>{
      button.querySelector('span').textContent=scenes[i][lang][0];
      button.setAttribute('aria-pressed',String(active===i));
    });
    all('.life-handle').forEach((handle,i)=>handle.setAttribute('aria-label',i===0?words.left:words.right));
    all('.life-range-label').forEach((label,i)=>label.textContent=i===0?words.left:words.right);
  }
  function paint(){
    raf=0;
    $('.life-reset').setAttribute('aria-pressed',String(Math.abs(bounds[0]-100/3)<.1&&Math.abs(bounds[1]-200/3)<.1));
    root.style.setProperty('--life-left',`${bounds[0]}%`);
    root.style.setProperty('--life-right',`${bounds[1]}%`);
    const limits=[[8,bounds[1]-8],[bounds[0]+8,92]];
    all('.life-range').forEach((range,i)=>{
      range.min=String(limits[i][0]);range.max=String(limits[i][1]);range.value=String(bounds[i]);
      range.setAttribute('aria-valuetext',`${Math.round(bounds[i])}%`);
    });
    all('.life-handle').forEach((handle,i)=>{
      handle.setAttribute('aria-valuemin',String(Math.round(limits[i][0])));
      handle.setAttribute('aria-valuemax',String(Math.round(limits[i][1])));
      handle.setAttribute('aria-valuenow',String(Math.round(bounds[i])));
      handle.setAttribute('aria-valuetext',`${Math.round(bounds[i])}%`);
    });
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(paint);}
  function settling(animated){clearTimeout(timer);root.classList.toggle('life-settling',animated);if(animated)timer=setTimeout(()=>root?.classList.remove('life-settling'),560);}
  function setBoundary(index,value){
    if(!root)return;
    bounds[index]=index===0?clamp(value,8,bounds[1]-8):clamp(value,bounds[0]+8,92);
    settling(false);
    if(active!==-1){active=-1;text();}
    schedule();
  }
  function setScene(index){
    if(!root)return;
    active=Number.isInteger(index)&&index>=0&&index<=2?index:-1;
    bounds=active===0?[84,92]:active===1?[8,92]:active===2?[8,16]:[100/3,200/3];
    settling(true);text();schedule();
  }
  function init(selector='#lifeGallery'){
    const node=typeof selector==='string'?document.querySelector(selector):selector;
    if(!node)return;
    if(root===node&&node.dataset.lifeReady==='true'){text();return;}
    root=node;root.dataset.lifeReady='true';root.classList.add('life-gallery');root.setAttribute('role','group');
    root.innerHTML=`<div class="life-heading"><div><p class="life-eyebrow"></p><h3 class="life-title"></h3></div><p class="life-description"></p></div>
      <div class="life-stage" id="lifeTriptych">
        ${scenes.map((scene,i)=>`<figure class="life-panel life-panel-${scene.tone}"><img src="${scene.image}" alt="" loading="lazy" decoding="async" width="1000" height="1500" draggable="false"><figcaption><span class="life-panel-name"></span><span class="life-panel-number">0${i+1}</span></figcaption></figure>`).join('')}
        ${[0,1].map(i=>`<span class="life-divider life-divider-${i}" aria-hidden="true"></span><div class="life-handle life-handle-${i}" role="slider" tabindex="0" data-boundary="${i}" aria-orientation="horizontal" aria-controls="lifeTriptych"><span aria-hidden="true">↔</span></div>`).join('')}
      </div>
      <div class="life-toolbar"><div><p class="life-hint"></p><div class="life-choices" role="group">
        ${scenes.map((scene,i)=>`<button class="life-choice" type="button" data-life-choice="${i}" aria-pressed="false"><small>0${i+1}</small><span></span></button>`).join('')}<button class="life-reset" type="button" aria-pressed="true"></button>
      </div></div><div class="life-precise">
        ${[0,1].map(i=>`<div><label class="life-range-label" for="lifeCurtain${i}"></label><input class="life-range" id="lifeCurtain${i}" type="range" min="8" max="92" step="1" value="${(i+1)*100/3}" data-boundary="${i}" aria-controls="lifeTriptych"></div>`).join('')}
        <small class="life-keyboard-note"></small>
      </div></div>`;
    all('.life-choice').forEach(button=>button.addEventListener('click',()=>setScene(Number(button.dataset.lifeChoice))));
    $('.life-reset').addEventListener('click',()=>setScene(-1));
    all('.life-range').forEach((range,i)=>range.addEventListener('input',()=>setBoundary(i,range.value)));
    all('.life-handle').forEach((handle,i)=>{
      handle.addEventListener('keydown',event=>{
        let value=bounds[i],step=event.shiftKey?10:2;
        if(event.key==='ArrowLeft'||event.key==='ArrowDown')value-=step;
        else if(event.key==='ArrowRight'||event.key==='ArrowUp')value+=step;
        else if(event.key==='Home')value=i===0?8:bounds[0]+8;
        else if(event.key==='End')value=i===0?bounds[1]-8:92;
        else return;
        event.preventDefault();setBoundary(i,value);
      });
      handle.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;
        const rect=$('.life-stage').getBoundingClientRect();
        if(!rect.width)return;
        drag={id:event.pointerId,index:i,left:rect.left,width:rect.width};
        handle.setPointerCapture(event.pointerId);handle.focus({preventScroll:true});settling(false);root.classList.add('life-dragging');event.preventDefault();
      });
      handle.addEventListener('pointermove',event=>{
        if(!drag||drag.id!==event.pointerId||drag.index!==i)return;
        setBoundary(i,(event.clientX-drag.left)/drag.width*100);
      });
      const end=event=>{if(drag?.id===event.pointerId){drag=null;root.classList.remove('life-dragging');}};
      handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);handle.addEventListener('lostpointercapture',end);
    });
    // No wheel handlers, touchmove interception, document-level dragging or autoplay.
    text();paint();
  }
  window.LifeGallery={init,setScene,reset:()=>setScene(-1),setLanguage(value){lang=value==='zh'||value==='zh-CN'?'zh':'en';text();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});else init();
})();
