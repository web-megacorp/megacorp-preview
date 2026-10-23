/* Home upcoming-section emphasis; section gestures are handled below. */
(function(){
  const main=document.querySelector('main#top'),root=document.getElementById('home-publishing-sections');
  if(!main||!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  function update(){
    frame=0;
    const groups=[...main.querySelectorAll(':scope > section')].filter(node=>node.id!=='features'&&(node.compareDocumentPosition(root)&Node.DOCUMENT_POSITION_PRECEDING));
    const sections=[...root.querySelectorAll('.home-post-row'),...groups].filter(node=>node.getClientRects().length);
    const viewport=window.visualViewport,offset=viewport?.offsetTop||0,height=Math.min(innerHeight,viewport?.height||innerHeight);
    const header=document.querySelector('.mc-header,.site-header');
    const headerEdge=header?.getBoundingClientRect().bottom||0;
    // Mask only content crossing the sticky header, never the header or overlays.
    // Features contains the post rows: mask its heading separately to avoid doubling.
    const upperNodes=[main.querySelector(':scope > .hero'),document.querySelector('#features .section-head'),...sections].filter(Boolean);
    for(const node of upperNodes){
      const edge=headerEdge-node.getBoundingClientRect().top;
      node.classList.toggle('home-top-fade',edge>0);
      if(edge>0){const value=edge.toFixed(1)+'px';if(node.style.getPropertyValue('--home-top-fade-edge')!==value)node.style.setProperty('--home-top-fade-edge',value);}
    }
    const top=Math.max(offset,(header?.getBoundingClientRect().bottom||0)+16),usable=Math.max(1,height+offset-top);
    const readingLine=top+usable*.22,revealLine=readingLine+usable*.2;
    const bottom=document.documentElement.scrollHeight-(scrollY+innerHeight)<=Math.max(8,usable*.12);
    const preview=Math.max(0,Math.min(1,parseFloat(getComputedStyle(root).getPropertyValue('--home-upcoming-opacity'))||.20));
    for(const section of sections){
      section.classList.add('home-reading-section');
      const y=section.getBoundingClientRect().top;
      const progress=Math.max(0,Math.min(1,(revealLine-y)/(revealLine-readingLine)));
      const opacity=(reduced.matches||bottom?1:preview+(1-preview)*progress).toFixed(3);
      if(section.style.getPropertyValue('--home-focus-opacity')!==opacity)section.style.setProperty('--home-focus-opacity',opacity);
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  visualViewport?.addEventListener('resize',schedule,{passive:true});visualViewport?.addEventListener('scroll',schedule,{passive:true});
  reduced.addEventListener('change',schedule);
  new ResizeObserver(schedule).observe(main);
  new MutationObserver(schedule).observe(root,{childList:true});
  schedule();
})();

/* Home only: Explore community, visible publishing rows, then later sections. */
(function(){
  const main=document.querySelector('main#top');if(!main)return;
  let frame=0,moving=false,lastWheel=0,amount=0,direction=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function clearance(){const h=document.querySelector('.mc-header');return h? h.offsetHeight+(parseFloat(getComputedStyle(h).top)||0)+16:24;}
  function stops(){
    const gap=clearance(),max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    const features=document.getElementById('features');
    // Only actual section starts: never a second stop inside the opening hero.
    const later=[...main.querySelectorAll(':scope > section')].filter(node=>features&&(node.compareDocumentPosition(features)&Node.DOCUMENT_POSITION_PRECEDING));
    const nodes=[features?.querySelector('.section-head'),...main.querySelectorAll('.home-post-row'),...later.map(node=>node.querySelector(':scope > .container')||node),document.querySelector('footer')].filter(node=>node&&node.getClientRects().length);
    const values=[0,...nodes.map(node=>Math.max(0,Math.min(max,scrollY+node.getBoundingClientRect().top-gap))),max];
    return [...new Set(values.map(Math.round))].sort((a,b)=>a-b);
  }
  function bypass(target){
    if(document.querySelector('dialog[open]')||getComputedStyle(document.body).overflow==='hidden')return true;
    if(!(target instanceof Element))target=document.body;
    if(target.closest('input,textarea,select,[contenteditable="true"],.site-profile-panel,.site-dashboard-panel,.login-dropdown,[role="dialog"]'))return true;
    for(let el=target;el&&el!==document.body;el=el.parentElement){const s=getComputedStyle(el);if(/auto|scroll/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+2)return true;}
    return false;
  }
  function move(sign){
    const points=stops(),y=scrollY;
    const target=sign>0?points.find(p=>p>y+12):points.slice().reverse().find(p=>p<y-12);
    if(target===undefined)return;
    cancelAnimationFrame(frame);
    if(reduced.matches){scrollTo({top:target,behavior:'instant'});return;}
    moving=true;const start=performance.now(),from=scrollY;
    function tick(now){const t=Math.min(1,(now-start)/520),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;scrollTo({top:from+(target-from)*ease,behavior:'instant'});if(t<1)frame=requestAnimationFrame(tick);else moving=false;}
    frame=requestAnimationFrame(tick);
  }
  window.addEventListener('wheel',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY||bypass(event.target))return;
    event.preventDefault();const now=performance.now(),quiet=now-lastWheel>200;lastWheel=now;
    if(moving||!quiet&&amount===0)return;
    const sign=Math.sign(event.deltaY);if(quiet||direction!==sign)amount=0;direction=sign;
    amount+=Math.abs(event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(amount>=16){amount=0;move(sign);}
  },{passive:false});
  window.addEventListener('keydown',event=>{if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||bypass(event.target))return;if(event.key==='PageDown'||event.key==='PageUp'){event.preventDefault();if(!moving)move(event.key==='PageDown'?1:-1);}else if(event.key==='Escape'){cancelAnimationFrame(frame);moving=false;}});
  window.addEventListener('pointerdown',()=>{cancelAnimationFrame(frame);moving=false;amount=0;},{passive:true});
  window.addEventListener('resize',()=>{cancelAnimationFrame(frame);moving=false;},{passive:true});
})();
