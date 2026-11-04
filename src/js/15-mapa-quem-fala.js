 // ===== Mapa: destaque de quem está falando =====
const avc={};
function avImg(id){const u=window.ltAvatar&&window.ltAvatar(id);if(!u)return null;let c=avc[id];if(!c||c.u!=u){const im=new Image();im.onload=()=>drawMap();im.src=u;c=avc[id]={u,im}}return c.im.complete&&c.im.naturalWidth?c.im:null}
const speakers=()=>{const l=[];if(txOn)l.push({id:ID,name:'Você'});Object.keys(talk).forEach(i=>{if(peers[i])l.push({id:i,name:dn(peers[i])})});return l};
const _dm=drawMap;
drawMap=function(){
 _dm();
 if(cur!='map')return;
 const sp=speakers(),bn=$('#spk'),{c,r}=mapRows();
 bn.textContent='';bn.hidden=!sp.length;
 sp.forEach(s=>{const d=E('div','it'),a=avImg(s.id),onMap=r.some(q=>q.id==s.id);
  if(a){const im=E('img');im.src=a.src;im.style.cssText='width:40px;height:40px;border-radius:50%;object-fit:cover';d.append(im)}
  d.append(E('b','','🎙 '+s.name+' falando'+(onMap?'':' (sem localização)')));bn.append(d)});
 if(!c||!r.length)return;
 const cv=$('#cv'),g=cv.getContext('2d'),W=cv.width,H=cv.height,t=Date.now()/300;
 const xy=q=>({x:(q.lon-c.lon)*Math.cos(rad(c.lat))*111320,y:(q.lat-c.lat)*110540});
 const mx=Math.max(50,...r.map(q=>{const o=xy(q);return Math.hypot(o.x,o.y)}))*1.2,k=(W/2-28)/mx;
 r.forEach(q=>{if(!sp.some(s=>s.id==q.id))return;
  const o=xy(q),x=W/2+o.x*k,y=H/2-o.y*k;
  g.strokeStyle='#ff4d5e';g.lineWidth=3;g.beginPath();g.arc(x,y,14+3*Math.sin(t),0,7);g.stroke();
  const a=avImg(q.id);
  if(a){g.save();g.beginPath();g.arc(x,y,12,0,7);g.clip();g.drawImage(a,x-12,y-12,24,24);g.restore()}
  else{g.fillStyle='#ff4d5e';g.beginPath();g.arc(x,y,9,0,7);g.fill()}})};
setInterval(()=>{if(cur=='map'&&speakers().length)drawMap()},400);
