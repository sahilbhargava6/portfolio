/* CURSOR */
const dot=document.getElementById('cur-dot'),ring=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.cssText=`left:${mx-4}px;top:${my-4}px`});
(function raf(){rx+=(mx-rx-20)*.12;ry+=(my-ry-20)*.12;ring.style.cssText=`left:${rx}px;top:${ry}px`;requestAnimationFrame(raf)})();
document.querySelectorAll('a,button').forEach(el=>{el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'))});

/* NAV */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>60));

/* PARTICLES */
(function(){
  const cv=document.getElementById('particleCanvas'),ctx=cv.getContext('2d');
  let W,H;const pts=[];
  function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight}
  resize();window.addEventListener('resize',resize);
  for(let i=0;i<80;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.5+.5});
  let mouseX=W/2,mouseY=H/2;
  document.addEventListener('mousemove',e=>{mouseX=e.clientX;mouseY=e.clientY});
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      const dx=mouseX-p.x,dy=mouseY-p.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<180){p.vx+=dx/d*.015;p.vy+=dy/d*.015}
      p.vx*=.98;p.vy*=.98;p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(183,180,174,0.5)';ctx.fill();
    });
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<130){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(122,32,32,${(1-d/130)*.4})`;ctx.lineWidth=.6;ctx.stroke()}
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* TYPING */
(function(){
  const roles=['Laravel & PHP web apps.','full stack websites.','clean, fast backends.','pixel-perfect frontends.','production-ready code.'];
  let ri=0,ci=0,del=false;
  const el=document.getElementById('typed-text');
  function tick(){
    const cur=roles[ri];
    if(!del){ci++;el.textContent=cur.slice(0,ci);if(ci===cur.length){del=true;setTimeout(tick,1600);return}}
    else{ci--;el.textContent=cur.slice(0,ci);if(ci===0){del=false;ri=(ri+1)%roles.length;setTimeout(tick,400);return}}
    setTimeout(tick,del?40:80);
  }
  setTimeout(tick,1400);
})();

/* TERMINAL */
(function(){
  const lines=[
    {t:'<span class="c-comment"># Sahil Bhargava — Full Stack Developer</span>'},
    {t:'<span class="c-green">$</span> <span class="c-white">php artisan about</span>'},
    {t:'<span class="c-yellow">→</span> Laravel / PHP Full Stack Developer'},
    {t:'<span class="c-green">$</span> <span class="c-white">cat stack.json</span>'},
    {t:'<span class="c-blue">{</span>'},
    {t:'&nbsp;&nbsp;<span class="c-yellow">"backend"</span>: <span class="c-green">"Laravel, PHP, Python"</span>,'},
    {t:'&nbsp;&nbsp;<span class="c-yellow">"frontend"</span>: <span class="c-green">"HTML, CSS, JavaScript"</span>,'},
    {t:'&nbsp;&nbsp;<span class="c-yellow">"databases"</span>: <span class="c-green">"MySQL, PostgreSQL, Oracle"</span>,'},
    {t:'&nbsp;&nbsp;<span class="c-yellow">"tools"</span>: <span class="c-green">"phpMyAdmin, Git, cPanel"</span>'},
    {t:'<span class="c-blue">}</span>'},
    {t:'<span class="c-green">$</span> <span class="c-white">ls live-projects/</span>'},
    {t:'<span class="c-orange">mnddesigns.in</span> &nbsp;<span class="c-orange">miraiglobalpolymers.com</span> &nbsp;<span class="c-orange">theaugrandair.in</span> &nbsp;<span class="c-orange">klothix.com</span>'},
    {t:'<span class="c-green">$</span> <span class="c-white">echo $STATUS</span>'},
    {t:'<span class="c-green">✓ Available for new projects</span> <span style="display:inline-block;width:8px;height:12px;background:var(--red);vertical-align:middle;animation:blink .7s infinite"></span>'},
  ];
  const body=document.getElementById('termBody');
  lines.forEach(l=>{const d=document.createElement('div');d.className='term-line';d.innerHTML=l.t;body.appendChild(d)});
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){body.querySelectorAll('.term-line').forEach((l,i)=>setTimeout(()=>l.classList.add('show'),i*110));obs.disconnect()}});
  },{threshold:.3});
  obs.observe(body);
})();

/* REVEAL */
const revEls=document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
const revObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')})},{threshold:.1});
revEls.forEach(el=>revObs.observe(el));

/* COUNTERS */
const cntObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,tgt=+el.dataset.target;let s=0;const go=()=>{s+=Math.ceil(tgt/40);if(s>=tgt){el.textContent=tgt+'+';return}el.textContent=s+'+';requestAnimationFrame(go)};go();cntObs.unobserve(el)});
},{threshold:.5});
document.querySelectorAll('.stat-n[data-target]').forEach(el=>cntObs.observe(el));

/* ARC PROGRESS */
const arcObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(!e.isIntersecting)return;e.target.querySelectorAll('.arc-fg').forEach(a=>{const p=+a.dataset.pct,c=2*Math.PI*20;a.style.strokeDashoffset=c-(c*p/100)});arcObs.unobserve(e.target)});
},{threshold:.3});
document.querySelectorAll('.skill-item').forEach(el=>arcObs.observe(el));

/* PROJECT SLIDER */
(function(){
  const track=document.getElementById('projTrack'),cards=track.querySelectorAll('.proj-card'),counter=document.getElementById('projCounter');
  let cur=0;const W=440+24;
  function go(n){cur=Math.max(0,Math.min(n,cards.length-1));track.style.transform=`translateX(-${cur*W}px)`;counter.textContent=`${String(cur+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`}
  document.getElementById('prevBtn').addEventListener('click',()=>go(cur-1));
  document.getElementById('nextBtn').addEventListener('click',()=>go(cur+1));
})();

/* 3D TILT */
document.querySelectorAll('.proj-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateY(${x*10}deg) rotateX(${-y*7}deg) scale(1.02)`});
  card.addEventListener('mouseleave',()=>{card.style.transform='perspective(1000px) rotateY(0) rotateX(0) scale(1)'});
});

/* MAGNETIC BUTTON */
(function(){
  const btn=document.getElementById('magBtn');if(!btn)return;
  btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.35,y=(e.clientY-r.top-r.height/2)*.35;btn.style.transform=`translate(${x}px,${y}px)`});
  btn.addEventListener('mouseleave',()=>{btn.style.transform='translate(0,0)'});
})();

/* TEXT SCRAMBLE */
(function(){
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
  const el=document.querySelector('.hero-name');if(!el)return;
  const orig=el.dataset.text;
  el.addEventListener('mouseenter',()=>{
    let iter=0;
    const iv=setInterval(()=>{
      el.textContent=orig.split('').map((c,i)=>{if(c===' ')return ' ';if(i<iter)return orig[i];return chars[Math.floor(Math.random()*chars.length)]}).join('');
      iter+=.5;if(iter>=orig.length)clearInterval(iv);
    },40);
  });
})();