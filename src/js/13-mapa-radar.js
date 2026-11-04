// ---- Mapa: posição dos aparelhos (sem internet; GPS só onde o aparelho tiver) ----
let locOn=0,me=null,lw=null,lt=0;const R=6371000,rad=x=>x*Math.PI/180;
function hav(a,b){const dl=rad(b.lat-a.lat),dg=rad(b.lon-a.lon),x=Math.sin(dl/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(x)))}
function brg(a,b){const y=Math.sin(rad(b.lon-a.lon))*Math.cos(rad(b.lat)),x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lon-a.lon));return(Math.atan2(y,x)*180/Math.PI+360)%360}
const card=d=>['N','NE','L','SE','S','SO','O','NO'][Math.round(d/45)%8],fd=m=>m<1000?Math.round(m)+' m':(m/1000).toFixed(1)+' km';
function mapRows(){const n=Date.now(),r=[];if(me)r.push({id:ID,name:'Você',me:1,lat:me.lat,lon:me.lon,acc:me.acc});Object.values(peers).filter(p=>p.loc&&n-p.loc.ts<1800000).forEach(p=>r.push({id:p.id,name:dn(p),lat:p.loc.lat,lon:p.loc.lon,acc:p.loc.acc,age:Math.round((n-p.loc.ts)/1000),stale:n-p.loc.ts>300000}));
 let c=me;if(!c&&r.length)c={lat:r.reduce((s,x)=>s+x.lat,0)/r.length,lon:r.reduce((s,x)=>s+x.lon,0)/r.length};r.forEach(x=>{if(c){x.d=hav(c,x);x.b=brg(c,x)}});return{c,r}}
function copyTxt(t){try{navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{})}catch(e){}try{const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();document.execCommand('copy');a.remove()}catch(e){}}
function drawMap(){if(cur!='map')return;const{c,r}=mapRows(),cv=$('#cv'),g=cv.getContext('2d'),W=cv.width,H=cv.height,ml=$('#ml');g.clearRect(0,0,W,H);ml.textContent='';
 if(!r.length){ml.append(E('small','sm',locOn?'Aguardando sinal de localização…':'Ninguém compartilhou localização ainda. Ative acima para aparecer, ou espere os outros ativarem.'));return}
 const xy=q=>({x:(q.lon-c.lon)*Math.cos(rad(c.lat))*111320,y:(q.lat-c.lat)*110540}),mx=Math.max(50,...r.map(q=>{const o=xy(q);return Math.hypot(o.x,o.y)}))*1.2,k=(W/2-28)/mx;
 g.strokeStyle='#1b2740';g.lineWidth=1;g.fillStyle='#8a97b3';g.font='11px sans-serif';[.5,1].forEach(f=>{g.beginPath();g.arc(W/2,H/2,(W/2-28)*f,0,7);g.stroke();g.fillText(fd(f*mx),W/2+4,H/2-(W/2-28)*f+12)});g.fillText('N',W/2-4,14);
 r.forEach(q=>{const o=xy(q),x=W/2+o.x*k,y=H/2-o.y*k;g.fillStyle=q.me?'#2f6bff':q.stale?'#8a97b3':'#27c46b';g.beginPath();g.arc(x,y,7,0,7);g.fill();g.fillStyle='#e9efff';g.fillText(q.name,Math.min(x+10,W-60),y+4)});
 r.forEach(q=>{const it=E('div','it'),t=E('div'),b=E('button','','📋');t.append(E('b','',q.name),E('small','',(q.me||!me?'':fd(q.d)+' ao '+card(q.b)+' · ')+q.lat.toFixed(5)+', '+q.lon.toFixed(5)+(q.acc?' (±'+q.acc+' m)':'')+(q.age!=null?' · há '+(q.age<90?q.age+' s':Math.round(q.age/60)+' min')+(q.stale?' · desatualizada':''):'')));b.title='Copiar coordenadas';b.onclick=()=>copyTxt(q.lat.toFixed(6)+', '+q.lon.toFixed(6));it.append(t,b);ml.append(it)})}
function locStart(){if(!navigator.geolocation){$('#lh').textContent='Este aparelho não tem localização.';return false}
 $('#lh').textContent='Procurando sinal de localização…';
 lw=navigator.geolocation.watchPosition(g=>{me={lat:g.coords.latitude,lon:g.coords.longitude,acc:Math.round(g.coords.accuracy||0),ts:Date.now()};if(Date.now()-lt>8000){lt=Date.now();all({t:'loc',lat:me.lat,lon:me.lon,acc:me.acc})}$('#lh').textContent='Localização ativa (precisão de cerca de '+me.acc+' m). Compartilhada só com quem está conectado.';drawMap()},
  e=>{$('#lh').textContent=e&&e.code==1?'Permissão de localização negada. No Android, permita a localização nas configurações do app.':'Sem sinal de localização. No Windows isso é normal: você vê os outros no mapa, mas não aparece.'},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});return true}
function locStop(){try{navigator.geolocation&&navigator.geolocation.clearWatch(lw)}catch(e){}lw=null;me=null;lt=0;all({t:'loc',off:1});$('#lh').textContent='Desligado. Só quem está conectado a você vê a posição, e ela não é guardada. Ao fechar o app, volta a ficar desligado.';drawMap()}
$('#lo').onchange=e=>{if(e.target.checked){locOn=locStart();if(!locOn)e.target.checked=false}else{locOn=0;locStop()}};
setInterval(drawMap,15000);
$('#q').oninput=render;$('#fv').onclick=()=>{fvOn=!fvOn;$('#fv').classList.toggle('pri',!!fvOn);render()};
$('#nm').value=NAME;
$('#go').onclick=async()=>{NAME=$('#nm').value.trim()||'Dispositivo '+ID.slice(0,3);localStorage.lt_name=NAME;$('#cn').value=NAME;
 if(!window.RTCPeerConnection||!window.CompressionStream){$('#err').textContent='Navegador sem suporte. Use Chrome, Edge ou Safari atualizados.';return}
 try{mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});mic.getAudioTracks()[0].enabled=false;micOK=1;micLive=1}catch(e){mic=null;window.micErr=(e&&e.name||'erro')+' '+(e&&e.message||'')}
 $('#splash').hidden=true;$('#app').hidden=false;drawCh();render();if(!mic)sys('Microfone indisponível: chat e recebimento de voz ativos, mas falar está desativado. Abra por HTTPS e permita o microfone. ['+window.micErr+']')
 applyOpt();ui()};
