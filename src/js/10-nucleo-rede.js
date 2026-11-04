const $=s=>document.querySelector(s),rnd=()=>Math.random().toString(36).slice(2,8);
const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ID=localStorage.lt_id||(localStorage.lt_id=rnd());
let NAME=localStorage.lt_name||'',mic=null,peers={},talk={},hist=[],cur='chat',txOn=0,micOK=0,micLive=0,micP=null,pend,md='',wl,ac;
let opt={beep:1,wake:0,bg:0};try{opt=Object.assign(opt,JSON.parse(localStorage.lt_opt))}catch(e){}
try{hist=JSON.parse(localStorage.lt_h||'[]')}catch(e){}
const seen=new Set(hist.map(x=>x.id));let fvOn=0;const uid=()=>rnd()+Date.now().toString(36)+rnd();
const CH=['Geral','Coordenação','Equipes','Emergência'];let chn=localStorage.lt_ch;if(!CH.includes(chn))chn='Geral';
let adm='',lc=0,ql=0,wn=0,wq='',txCh='Geral';const ban=new Set(),qs={},unr={},QTTL=60000;
let ct={};try{ct=JSON.parse(localStorage.lt_ct||'{}')||{}}catch(e){}let room=localStorage.lt_room||'',nt='';
const saveCt=()=>{try{localStorage.lt_ct=JSON.stringify(ct)}catch(e){}},dn=p=>(ct[p.id]&&ct[p.id].nick)||p.name;
function touch(id,name){const c=ct[id]||(ct[id]={});if(name)c.name=name;c.seen=Date.now();const k=Object.keys(ct);if(k.length>50){k.sort((a,b)=>(ct[a].seen||0)-(ct[b].seen||0));delete ct[k[0]]}saveCt()}
const gather=pc=>new Promise(r=>{
 if(pc.iceGatheringState=='complete')return r();
 const f=()=>{if(pc.iceGatheringState=='complete'){clearInterval(iv);pc.removeEventListener('icegatheringstatechange',f);r()}};
 pc.addEventListener('icegatheringstatechange',f);
 const wantRelay=localStorage.lt_net==='1'&&(window.ltTurn||[]).length>0,t0=Date.now();
 const iv=setInterval(()=>{
  const s=(pc.localDescription&&pc.localDescription.sdp)||'';
  if(Date.now()-t0>(wantRelay?12000:3000)||(wantRelay&&/typ relay/.test(s))){clearInterval(iv);r()}
 },250);
});
const tx=(p,m)=>{if(p.dc&&p.dc.readyState=='open')p.dc.send(JSON.stringify(m))},all=m=>Object.values(peers).forEach(p=>tx(p,m));
function beep(f=880,d=.1){if(!opt.beep)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
const enc=async d=>{const s=new Blob([JSON.stringify({type:d.type,sdp:d.sdp})]).stream().pipeThrough(new CompressionStream('deflate-raw'));const b=new Uint8Array(await new Response(s).arrayBuffer());let x='';b.forEach(c=>x+=String.fromCharCode(c));return 'LT1:'+btoa(x)};
const dec=async c=>{c=c.trim();if(!c.startsWith('LT1:'))throw Error('código inválido');const b=Uint8Array.from(atob(c.slice(4)),k=>k.charCodeAt());return JSON.parse(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text())};
function mk(id){const p=peers[id]={id,name:'Dispositivo',on:0,pc:new RTCPeerConnection({iceServers:[]})};
 if(mic)mic.getTracks().forEach(t=>p.pc.addTrack(t,mic));else p.pc.addTransceiver('audio',{direction:'recvonly'});
 p.pc.ontrack=e=>{p.au=p.au||new Audio();p.au.srcObject=e.streams[0]||new MediaStream([e.track]);p.au.play().catch(()=>{});audio()};
 p.pc.onconnectionstatechange=()=>{const s=p.pc.connectionState;p.on=s=='connected'?1:0;if(s=='failed'||s=='closed')drop(p.id);else if(s=='disconnected')setTimeout(()=>{if(peers[p.id]===p&&p.pc.connectionState!='connected')drop(p.id)},6000);ui()};
 return p}
function drop(id,quiet){const p=peers[id];if(!p)return;delete peers[id];delete talk[id];try{p.pc.close()}catch(e){}if(p.au)p.au.srcObject=null;if(p.hi){touch(id);sys(p.name+' saiu da rede');if(id==adm&&!quiet){adm=[ID,...Object.values(peers).filter(x=>x.hi).map(x=>x.id)].sort()[0];sys(adm==ID?'Você agora é o administrador':peers[adm].name+' agora é o administrador')}}CH.forEach(c=>{qdel(c,id);qnotify(c)});ui()}
function dcs(p,dc){p.dc=dc;dc.onopen=()=>tx(p,{t:'hi',id:ID,name:NAME,adm,room,mem:Object.values(peers).filter(x=>x!==p&&x.hi).length});dc.onmessage=e=>{try{on(p,JSON.parse(e.data))}catch(x){}}}
async function dial(id,via){const p=mk(id);dcs(p,p.pc.createDataChannel('c'));await p.pc.setLocalDescription(await p.pc.createOffer());await gather(p.pc);tx(via,{t:'sig',to:id,from:ID,k:'offer',d:p.pc.localDescription.sdp})}
async function on(p,m){
 if(m.t=='hi'){if(ban.has(m.id)){drop(p.id);return}if(p.id!=m.id){if(peers[m.id]&&peers[m.id]!==p)drop(m.id,1);delete peers[p.id];p.id=m.id;peers[m.id]=p}p.name=m.name;p.on=1;const lone=!Object.values(peers).some(x=>x!==p&&x.hi);if(m.adm&&m.adm!=adm&&(!adm||(adm==ID&&lone&&(m.mem>0||m.adm<ID))))adm=m.adm;if(m.id==adm&&typeof m.room=='string'){room=m.room.slice(0,30);$('#rn').value=room}if(!p.hi){p.hi=1;touch(m.id,m.name);sys(m.name+' conectou');beep(700);if(locOn&&me)tx(p,{t:'loc',lat:me.lat,lon:me.lon,acc:me.acc});$('#modal').hidden=true;if(roomOn&&p===pend)roomNew().catch(()=>{});hist.filter(h=>h.pd&&h.from==ID).forEach(h=>tx(p,pub(h)))}
  tx(p,{t:'peers',l:Object.values(peers).filter(x=>x!==p&&x.hi).map(x=>x.id)});ui()}
 else if(m.t=='peers')m.l.forEach(id=>{if(id==ID||peers[id]||ban.has(id))return;if(ID>id)dial(id,p);else tx(p,{t:'sig',to:id,from:ID,k:'want'})});
 else if(m.t=='sig'){if(m.to!=ID){const q=peers[m.to];if(q)tx(q,m);return}
  if(m.k=='want'){if(!peers[m.from])dial(m.from,p)}
  else if(m.k=='offer'){if(peers[m.from])return;const q=mk(m.from);q.pc.ondatachannel=e=>dcs(q,e.channel);await q.pc.setRemoteDescription({type:'offer',sdp:m.d});await q.pc.setLocalDescription(await q.pc.createAnswer());await gather(q.pc);tx(p,{t:'sig',to:m.from,from:ID,k:'answer',d:q.pc.localDescription.sdp})}
  else if(m.k=='answer'){const q=peers[m.from];if(q)await q.pc.setRemoteDescription({type:'answer',sdp:m.d})}}
 else if(m.t=='msg'){tx(p,{t:'ack',id:m.id});if(seen.has(m.id))return;seen.add(m.id);const n=pub(m);add(n);beep(n.ch=='Emergência'?1200:660);if(n.ch=='Emergência'){navigator.vibrate&&navigator.vibrate([400,150,400]);if(n.text.startsWith('🆘')&&chn!='Emergência')sys('🆘 SOS de '+n.name+' — veja o canal Emergência')}}
 else if(m.t=='ack'){const x=hist.find(h=>h.id==m.id&&h.from==ID);if(x){x.ak=x.ak||[];if(!x.ak.includes(p.id)){x.ak.push(p.id);x.pd=0;save();render()}}}
 else if(m.t=='call'){sys(dn(p)+' está chamando 🔔');beep(1000,.4);navigator.vibrate&&navigator.vibrate([300,100,300])}
 else if(m.t=='tx'){const c=CH.includes(m.ch)?m.ch:'Geral';if(m.on){talk[p.id]=c;qdel(c,p.id);if(c==wq)wn=0}else{const c0=talk[p.id]||c;delete talk[p.id];if(c0==chn||c0=='Emergência')beep(520,.08);qnotify(c0)}ui()}
 else if(m.t=='q'){const c=CH.includes(m.ch)?m.ch:'Geral';if(m.on){lc=Math.max(lc,m.lc|0);qset(c,p.id,m.lc|0)}else{qdel(c,p.id);qnotify(c)}ui()}
 else if(m.t=='loc'){if(m.off)delete p.loc;else if(typeof m.lat=='number'&&typeof m.lon=='number'&&Math.abs(m.lat)<=90&&Math.abs(m.lon)<=180)p.loc={lat:+m.lat,lon:+m.lon,acc:Math.min(Math.max(+m.acc||0,0),99999),ts:Date.now()};drawMap()}
 else if(m.t=='room'){if(p.id==adm){room=String(m.name||'').slice(0,30);$('#rn').value=room;ui()}}
 else if(m.t=='name'){p.name=m.name;if(ct[p.id]){ct[p.id].name=m.name;saveCt()}ui()}
 else if(m.t=='kick'){if(p.id!=adm)return;ban.add(m.id);if(m.id==ID){sys('Você foi removido da rede pelo administrador');Object.keys(peers).forEach(k=>drop(k,1))}else drop(m.id)}}
async function invite(){if(!adm)adm=ID;if(pend&&!pend.hi)drop(pend.id);pend=mk('tmp'+rnd());dcs(pend,pend.pc.createDataChannel('c'));await pend.pc.setLocalDescription(await pend.pc.createOffer());await gather(pend.pc);return enc(pend.pc.localDescription)}
async function join(c){const o=await dec(c),p=mk('tmp'+rnd());p.pc.ondatachannel=e=>dcs(p,e.channel);await p.pc.setRemoteDescription(o);await p.pc.setLocalDescription(await p.pc.createAnswer());await gather(p.pc);return enc(p.pc.localDescription)}
function setMode(m){md=m;$('#l2').hidden=$('#c2').hidden=$('#cp1').hidden=$('#cp2').hidden=false;$('#c1').inputMode='text';const i=m=='i';$('#modal').hidden=false;$('#l1').textContent=i?'1) Envie este convite ao outro aparelho':'1) Cole o convite recebido';$('#l2').textContent=i?'2) Cole aqui a resposta dele':'2) Envie esta resposta ao primeiro aparelho';$('#c1').readOnly=i;$('#c2').readOnly=!i;$('#c1').value=$('#c2').value='';$('#act').textContent=i?'Conectar':'Gerar resposta';$('#act').hidden=false;$('#hint').textContent='';
 if(i){$('#c1').value='Gerando…';invite().then(c=>$('#c1').value=c).catch(e=>$('#hint').textContent='Erro: '+e.message)}}
