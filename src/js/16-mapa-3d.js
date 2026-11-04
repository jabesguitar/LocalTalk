 // ===== Mapa em visão 3D inclinada (funciona sem internet) =====
let v3=1,yaw=0;
const _d3=drawMap;
drawMap=function(){_d3();if(v3&&cur=='map')draw3d()};
function draw3d(){
 const{c,r}=mapRows();if(!c||!r.length)return;
 const cv=$('#cv'),g=cv.getContext('2d'),W=cv.width,H=cv.height,t=Date.now()/300;
 const sp=typeof speakers=='function'?speakers():[];
 const xy=q=>({x:(q.lon-c.lon)*Math.cos(rad(c.lat))*111320,y:(q.lat-c.lat)*110540});
 const mx=Math.max(50,...r.map(q=>{const o=xy(q);return Math.hypot(o.x,o.y)}))*1.2,k=(W/2-28)/mx;
 const cs=Math.cos(yaw),sn=Math.sin(yaw);
 const P=(x,y)=>{const xr=x*cs-y*sn,yr=x*sn+y*cs,d=yr/mx,pr=Math.min(1.5,Math.max(.45,1-.3*d));return{x:W/2+xr*k*pr,y:H*.62-yr*k*.5*pr,pr,d}};
 g.clearRect(0,0,W,H);
 const sky=g.createLinearGradient(0,0,0,H*.4);sky.addColorStop(0,'#0b1730');sky.addColorStop(1,'#16223a');
 g.fillStyle=sky;g.fillRect(0,0,W,H*.4);
 const ring=R=>{g.beginPath();for(let a=0;a<=64;a++){const th=a/64*Math.PI*2,p=P(R*Math.cos(th),R*Math.sin(th));a?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}};
 ring(mx);g.fillStyle='rgba(47,107,255,.08)';g.fill();g.strokeStyle='#2a3a5c';g.lineWidth=1.5;g.stroke();
 ring(mx/2);g.stroke();
 for(let a=0;a<8;a++){const th=a*Math.PI/4,p=P(mx*Math.cos(th),mx*Math.sin(th)),o=P(0,0);g.beginPath();g.moveTo(o.x,o.y);g.lineTo(p.x,p.y);g.stroke()}
 g.fillStyle='#8a97b3';g.font='11px sans-serif';
 const n=P(0,mx*1.08);g.fillStyle='#ff4d5e';g.fillText('N',n.x-4,n.y);
 g.fillStyle='#8a97b3';const e1=P(mx/2,0),e2=P(mx,0);g.fillText(fd(mx/2),e1.x+3,e1.y-3);g.fillText(fd(mx),e2.x+3,e2.y-3);
 const pts=r.map(q=>{const o=xy(q),p=P(o.x,o.y);return Object.assign({q},p)}).sort((a,b)=>b.d-a.d);
 pts.forEach(o=>{const q=o.q,h=22*o.pr,x=o.x,y=o.y,talking=sp.some(s=>s.id==q.id);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,y,7*o.pr,3.5*o.pr,0,0,7);g.fill();
  g.strokeStyle='#8a97b3';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-h);g.stroke();
  const col=talking?'#ff4d5e':q.me?'#2f6bff':q.stale?'#8a97b3':'#27c46b';
  if(talking){g.strokeStyle='#ff4d5e';g.lineWidth=3;g.beginPath();g.arc(x,y-h,(13+3*Math.sin(t))*o.pr,0,7);g.stroke()}
  const a=talking&&typeof avImg=='function'?avImg(q.id):null;
  if(a){g.save();g.beginPath();g.arc(x,y-h,11*o.pr,0,7);g.clip();g.drawImage(a,x-11*o.pr,y-h-11*o.pr,22*o.pr,22*o.pr);g.restore()}
  else{g.fillStyle=col;g.beginPath();g.arc(x,y-h,8*o.pr,0,7);g.fill()}
  g.fillStyle='#e9efff';g.font=Math.round(11*Math.min(1.2,o.pr+.1))+'px sans-serif';g.fillText(q.name,Math.min(x+12,W-60),y-h+4)})}
const b3=E('button','pri','🧭 Visão: 3D'),cvs=$('#cv');
b3.onclick=()=>{v3=v3?0:1;b3.textContent='🧭 Visão: '+(v3?'3D':'2D');drawMap()};
cvs.before(b3);cvs.style.touchAction='pan-y';
let dx0=null;
cvs.onpointerdown=e=>{dx0=e.clientX;try{cvs.setPointerCapture(e.pointerId)}catch(x){}};
cvs.onpointermove=e=>{if(dx0==null||!v3)return;yaw+=(e.clientX-dx0)*.012;dx0=e.clientX;drawMap()};
cvs.onpointerup=cvs.onpointercancel=()=>{dx0=null};
