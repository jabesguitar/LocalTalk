const save=()=>{try{localStorage.lt_h=JSON.stringify(hist)}catch(e){}};
const stat=m=>m.from!=ID?'':m.ak&&m.ak.length?' ✓✓':m.pd?' ⏳ pendente':' ✓';
const pub=m=>({t:'msg',id:m.id,from:m.from,name:m.name,text:m.text,ts:m.ts,ch:CH.includes(m.ch)?m.ch:'Geral'});
function draw(m){const b=E('div','m '+(m.sys?'s':m.from==ID?'me':'th'));if(!m.sys&&m.from!=ID)b.append(E('small','',m.name));if(!m.sys&&(m.ch||'Geral')!=chn)b.append(E('small','','# '+(m.ch||'Geral')));b.append(E('div','',m.text));if(!m.sys){const s=E('small','',new Date(m.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+stat(m)),f=E('span','fv'+(m.fav?' on':''),'⭐');f.onclick=()=>{m.fav=m.fav?0:1;save();render()};s.prepend(f);b.append(s)}$('#msgs').append(b);$('#msgs').scrollTop=1e9}
function render(){const q=$('#q').value.trim().toLowerCase();$('#msgs').textContent='';hist.filter(m=>(q||fvOn||inCh(m))&&(!fvOn||m.fav)&&(!q||(m.text||'').toLowerCase().includes(q)||(m.name||'').toLowerCase().includes(q))).forEach(draw)}
const inCh=m=>m.sys||(m.ch||'Geral')==chn;
function add(m){hist=hist.concat(m).slice(-500);save();if(!inCh(m)){const c=m.ch||'Geral';if(m.from!=ID)unr[c]=(unr[c]||0)+1;drawCh();return}if(!$('#q').value&&!fvOn)draw(m);else render()}
const sys=t=>add({sys:1,text:t,ts:Date.now(),id:rnd()});
function send(){const v=$('#tx').value.trim();if(!v)return;$('#tx').value='';const m={t:'msg',id:uid(),from:ID,name:NAME,text:v,ts:Date.now(),ak:[],ch:chn};m.pd=Object.values(peers).some(x=>x.hi&&x.on)?0:1;seen.add(m.id);add(m);all(pub(m))}
$('#snd').onclick=send;$('#tx').onkeydown=e=>{if(e.key=='Enter')send()};
$('#call').onclick=()=>{all({t:'call'});sys('Você chamou todos 🔔');beep(1000,.3)};
function say(t,ch){const m={t:'msg',id:uid(),from:ID,name:NAME,text:t,ts:Date.now(),ak:[],ch};m.pd=Object.values(peers).some(x=>x.hi&&x.on)?0:1;seen.add(m.id);add(m);all(pub(m))}
function sos(){if(txOn)return;setCh('Emergência');const pos=q=>' Posição: '+q.lat.toFixed(5)+', '+q.lon.toFixed(5)+(q.acc?' (±'+q.acc+' m)':'')+'.',gl=navigator.geolocation;
 all({t:'call'});beep(1000,.3);say('🆘 SOS de '+NAME+'.'+(me?pos(me):gl?' Procurando posição…':' Sem GPS neste aparelho.'),'Emergência');
 if(!me&&gl)gl.getCurrentPosition(g=>say('📍 Posição de '+NAME+':'+pos({lat:g.coords.latitude,lon:g.coords.longitude,acc:Math.round(g.coords.accuracy||0)}),'Emergência'),()=>say('📍 Não consegui obter a posição de '+NAME+'.','Emergência'),{enableHighAccuracy:true,timeout:8000,maximumAge:10000})}
let sst=0;const sb=$('#sos');sb.onpointerdown=e=>{try{sb.setPointerCapture(e.pointerId)}catch(x){}sb.textContent='⏳';sst=setTimeout(()=>{sst=0;sb.textContent='🆘';sos()},1200)};
sb.onpointerup=sb.onpointercancel=()=>{if(sst){clearTimeout(sst);sst=0;sb.textContent='🆘'}};sb.oncontextmenu=e=>e.preventDefault();
const busy=c=>Object.values(talk).includes(c);
function qset(c,id,l){(qs[c]=qs[c]||{})[id]={lc:l,at:Date.now()}}
function qdel(c,id){if(qs[c])delete qs[c][id]}
function qlist(c){const q=qs[c]||{},n=Date.now();return Object.keys(q).filter(k=>{if(n-q[k].at>QTTL||(k!=ID&&!(peers[k]&&peers[k].hi))){delete q[k];return false}return true}).sort((a,b)=>q[a].lc-q[b].lc||(a<b?-1:1))}
const turn=c=>{const l=qlist(c);return !l.length||l[0]==ID},qpos=c=>qlist(c).indexOf(ID)+1;
function qjoin(){wq=chn;wn=0;ql=++lc;qset(chn,ID,ql);all({t:'q',ch:chn,lc:ql,on:1})}
function qleave(){if(!wq)return;const c=wq;wq='';wn=0;qdel(c,ID);all({t:'q',ch:c,on:0})}
function qnotify(c){if(wq==c&&!wn&&!busy(c)&&qlist(c)[0]==ID){wn=1;beep(900,.15);navigator.vibrate&&navigator.vibrate(200);sys('Sua vez no canal '+c+' — segure para falar');ui()}}
setInterval(()=>{if(wq){qset(wq,ID,ql);all({t:'q',ch:wq,lc:ql,on:1})}},20000);
function audio(){Object.values(peers).forEach(p=>{if(!p.au)return;const c=talk[p.id];p.au.muted=!!p.mu||!!(c&&c!='Emergência'&&c!=chn)})}
function drawCh(){const c=$('#chs');c.textContent='';CH.forEach(n=>{const b=E('button',(n==chn?'sel ':'')+(n=='Emergência'?'em':''),n+(unr[n]?' ('+unr[n]+')':''));b.onclick=()=>setCh(n);c.append(b)})}
function setCh(n){if(txOn||n==chn)return;if(wq&&wq!=n)qleave();chn=n;localStorage.lt_ch=n;unr[n]=0;drawCh();render();ui()}
function pttOn(){if(!mic||txOn)return;if(!micLive){micAcquire(1).then(()=>{if(micLive)pttOn()});return}if(busy(chn)||!turn(chn)){if(wq!=chn){qleave();qjoin()}ui();return}qleave();txOn=1;txCh=chn;mic.getAudioTracks()[0].enabled=true;all({t:'tx',on:true,ch:txCh});ui()}
function pttOff(){if(!txOn)return;txOn=0;mic.getAudioTracks()[0].enabled=false;all({t:'tx',on:false,ch:txCh});beep(520,.08);ui();if(document.hidden)setTimeout(micRelease,250)}
/* Libera o microfone quando o app sai da tela (WhatsApp e outros apps voltam a gravar) e reabre ao voltar */
function micRelease(){try{if(txOn)pttOff()}catch(e){}try{if(mr)mr.stop()}catch(e){}try{mic&&mic.getTracks().forEach(t=>t.stop())}catch(e){}micLive=0}
function micAcquire(keep){
 if(!micOK||micLive)return Promise.resolve();
 if(micP)return micP;
 micP=(async()=>{try{
  const ns=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  const t=ns.getAudioTracks()[0];t.enabled=false;
  if(!keep&&document.hidden){ns.getTracks().forEach(x=>x.stop());return}
  mic=ns;micLive=1;
  Object.values(peers).forEach(p=>{try{p.pc.getSenders().forEach(s=>{if(s.track&&s.track.kind=='audio')s.replaceTrack(t).catch(()=>{})})}catch(e){}})
 }catch(e){}micP=null})();
 return micP}
async function tapGo(){if(!micOK)return;if(txOn){pttOff();return}if(!micLive)await micAcquire(1);pttOn()}
const pb=$('#ptt');pb.onpointerdown=e=>{pb.setPointerCapture(e.pointerId);pttOn()};pb.onpointerup=pb.onpointercancel=pttOff;pb.oncontextmenu=e=>e.preventDefault();
document.onkeydown=e=>{if(e.code=='Space'&&!e.repeat&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)&&cur=='chat'){e.preventDefault();pttOn()}};
document.onkeyup=e=>{if(e.code=='Space')pttOff()};
function ui(){audio();drawMap();$('#rn').readOnly=!!adm&&adm!=ID;const L=Object.values(peers).filter(p=>p.hi&&p.on),w=Object.keys(talk).map(i=>peers[i]&&dn(peers[i])+(talk[i]!=chn?' ['+talk[i]+']':'')).filter(Boolean);
 $('#hd').textContent=(room?'📻 '+room+' · ':'')+(L.length?L.length+' dispositivo(s) conectado(s)':'Sem dispositivos conectados')+(w.length?' · 🎙 '+w.join(', ')+' falando':'')+(adm==ID?' · 👑 você é o administrador':'');
 pb.disabled=!mic;pb.classList.toggle('tx',!!txOn);pb.textContent=!mic?'Voz indisponível':txOn?'🎙 Falando…':wq==chn?(busy(chn)||qlist(chn)[0]!=ID?'⏳ Na fila · posição '+qpos(chn):'🔔 Sua vez — segure para falar'):busy(chn)?'Canal ocupado · toque para entrar na fila':!turn(chn)?'Há fila · toque para entrar':'Segure para falar';
 const d=$('#dl');d.textContent='';const row=(n,s,on,btns)=>{const r=E('div','it'),i=E('i','d'+(on?' on':'')),t=E('div');t.append(E('b','',n),E('small','',s));r.append(i,t,...btns);d.append(r)};
 row((adm==ID?'👑 ':'')+NAME+' (este aparelho)','Online',1,[]);
 Object.values(peers).forEach(p=>{const m=E('button','',p.mu?'🔇':'🔊'),x=E('button','','✕');m.onclick=()=>{p.mu=!p.mu;ui()};const bl=E('button','','🔔'),ed=E('button','','✏️');bl.onclick=()=>{tx(p,{t:'call'});sys('Você chamou '+dn(p)+' 🔔')};ed.onclick=()=>{touch(p.id,p.name);nick(p.id,p.name)};x.title='Remover da rede';x.onclick=()=>{if(confirm('Remover '+p.name+' da rede?')){ban.add(p.id);all({t:'kick',id:p.id});drop(p.id,1)}};row((p.id==adm?'👑 ':'')+dn(p),p.hi&&p.on?'Conectado':'Conectando…',p.hi&&p.on,[...(p.hi?[bl,ed]:[]),m,...(adm==ID?[x]:[])])})
 const off=Object.keys(ct).filter(k=>!(peers[k]&&peers[k].hi)).sort((a,b)=>(ct[b].seen||0)-(ct[a].seen||0));
 if(off.length){d.append(E('small','sm','Contatos salvos (offline)'));off.forEach(k=>{const c=ct[k],e=E('button','','✏️'),r=E('button','','🗑');e.onclick=()=>nick(k,c.nick||c.name||'contato');r.onclick=()=>{if(confirm('Apagar '+(c.nick||c.name||'contato')+' dos contatos?')){delete ct[k];saveCt();ui()}};row(c.nick||c.name||'Contato','Visto em '+new Date(c.seen||0).toLocaleDateString(),0,[e,r])})}}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{cur=b.dataset.v;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('sel',x==b));['chat','dev','cfg','map'].forEach(v=>$('#v-'+v).hidden=v!=cur);drawMap()});
function wav(){const n=8000,b=new DataView(new ArrayBuffer(44+n)),s=(o,t)=>[...t].forEach((c,i)=>b.setUint8(o+i,c.charCodeAt()));s(0,'RIFF');b.setUint32(4,36+n,true);s(8,'WAVEfmt ');b.setUint32(16,16,true);b.setUint16(20,1,true);b.setUint16(22,1,true);b.setUint32(24,8000,true);b.setUint32(28,8000,true);b.setUint16(32,1,true);b.setUint16(34,8,true);s(36,'data');b.setUint32(40,n,true);for(let i=0;i<n;i++)b.setUint8(44+i,128);return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
const ka=new Audio();ka.loop=true;ka.src=wav();
async function applyOpt(){localStorage.lt_opt=JSON.stringify(opt);try{if(opt.wake&&navigator.wakeLock&&!wl){wl=await navigator.wakeLock.request('screen');wl.onrelease=()=>wl=null}else if(!opt.wake&&wl)wl.release()}catch(e){}
 if(opt.bg&&!window.LTAndroid){ka.play().catch(()=>{});if('mediaSession'in navigator)navigator.mediaSession.metadata=new MediaMetadata({title:'LocalTalk',artist:'Rádio ativo na rede local'})}else ka.pause();try{window.LTAndroid&&LTAndroid.keepAlive(!!opt.bg)}catch(e){}}
document.onvisibilitychange=()=>{if(document.hidden)micRelease();else{micAcquire();applyOpt()}};
[['o1','beep'],['o2','wake'],['o3','bg']].forEach(([id,k])=>{$('#'+id).checked=!!opt[k];$('#'+id).onchange=e=>{opt[k]=e.target.checked?1:0;pf='';localStorage.lt_pf='';$('#pf').value='';applyOpt()}});
$('#cn').onchange=e=>{NAME=e.target.value.trim()||NAME;localStorage.lt_name=NAME;all({t:'name',name:NAME});ui()};
function nick(id,name){if(!ct[id])touch(id,name);md='n';nt=id;$('#modal').hidden=false;$('#l1').textContent='Apelido para '+name+' (vazio volta ao nome original)';$('#c1').readOnly=false;$('#c1').value=ct[id].nick||'';$('#c1').inputMode='text';$('#l2').hidden=$('#c2').hidden=$('#cp1').hidden=$('#cp2').hidden=true;$('#act').textContent='Salvar';$('#act').hidden=false;$('#hint').textContent=''}
function saveNick(){const c=ct[nt];if(c){const v=$('#c1').value.trim().slice(0,20);if(v)c.nick=v;else delete c.nick;saveCt()}$('#modal').hidden=true;ui()}
$('#rn').value=room;$('#rn').onchange=e=>{if(adm&&adm!=ID){e.target.value=room;return}room=e.target.value.trim().slice(0,30);localStorage.lt_room=room;all({t:'room',name:room});ui()};
const PF={campo:{beep:1,wake:0,bg:1,ch:'Equipes'},evento:{beep:1,wake:1,bg:1,ch:'Coordenação'},familia:{beep:1,wake:0,bg:0,ch:'Geral'},silencioso:{beep:0,wake:0,bg:1,ch:'Geral'}};
let pf=PF[localStorage.lt_pf]?localStorage.lt_pf:'';$('#pf').value=pf;
function applyPf(k){const f=PF[k];pf=f?k:'';localStorage.lt_pf=pf;if(!f)return;opt.beep=f.beep;opt.wake=f.wake;opt.bg=f.bg;[['o1','beep'],['o2','wake'],['o3','bg']].forEach(([i,key])=>$('#'+i).checked=!!opt[key]);applyOpt();setCh(f.ch)}
$('#pf').onchange=e=>applyPf(e.target.value);
 // Botão do fone: toca uma vez para falar, toca de novo para parar
window.ltTap=src=>{sys('🎧 botão recebido ('+src+')');tapGo()};
 let allMute=0;
const volKeys=()=>{try{window.LTAndroid&&LTAndroid.volKeys(!!opt.vol)}catch(e){}};
window.ltKey=src=>{
 if(!opt.vol)return;
 if(src=='vu'){window.ltTap('vol');return}
 if(src=='vd'){
  if(opt.vd=='mute'){allMute=!allMute;Object.values(peers).forEach(p=>{p.mu=allMute});ui();sys(allMute?'Todas as conversas silenciadas 🔇':'Conversas reativadas 🔊')}
  else if(opt.vd=='call'){all({t:'call'});sys('Você chamou todos 🔔');beep(1000,.3)}
 }};
$('#o4').checked=!!opt.vol;$('#o4').onchange=e=>{opt.vol=e.target.checked?1:0;localStorage.lt_opt=JSON.stringify(opt);volKeys()};
$('#vd').value=opt.vd||'';$('#vd').onchange=e=>{opt.vd=e.target.value;localStorage.lt_opt=JSON.stringify(opt)};
volKeys();
 // Botão do fone/volume (o Android chama isto): toca uma vez para falar, toca de novo para parar
window.ltTap=src=>{tapGo()};
