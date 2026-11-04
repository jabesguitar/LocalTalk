 // ===== Enviar áudio e arquivos =====
const MAXA=8*1048576,atts=[],rx={};
const b64=buf=>{const u=new Uint8Array(buf);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const fsz=n=>n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toFixed(1)+' MB';
const safe=n=>String(n||'arquivo').replace(/[\\\/:*?"<>|]/g,'_').slice(0,80);
function drawAtt(a){
 const b=E('div','m '+(a.from==ID?'me':'th'));
 if(a.from!=ID)b.append(E('small','',a.who));
 if(a.mime.startsWith('audio/')){const au=E('audio');au.controls=true;au.src=a.url;au.style.cssText='max-width:100%';b.append(au)}
 else{
  if(a.mime.startsWith('image/')){const im=E('img');im.src=a.url;im.style.cssText='max-width:100%;border-radius:8px';b.append(im)}
  b.append(E('div','','📎 '+a.name+' ('+fsz(a.size)+')'));
  const s=E('button','','💾 Salvar');s.onclick=()=>saveAtt(a);b.append(s)}
 b.append(E('small','',new Date(a.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})));
 $('#msgs').append(b);$('#msgs').scrollTop=1e9}
function saveAtt(a){
 if(window.LTAndroid&&LTAndroid.saveFile){const r=new FileReader();r.onload=()=>LTAndroid.saveFile(safe(a.name),a.mime,String(r.result).split(',')[1]);r.readAsDataURL(a.blob)}
 else{const l=E('a');l.href=a.url;l.download=safe(a.name);document.body.append(l);l.click();l.remove()}}
window.ltSaved=(n,ok)=>sys(ok?'Salvo em Downloads/LocalTalk: '+n:'Não consegui salvar '+n);
function addAtt(a){
 a.url=URL.createObjectURL(a.blob);atts.push(a);
 if(atts.length>20){const o=atts.shift();URL.revokeObjectURL(o.url)}
 if(a.ch!=chn){if(a.from!=ID){unr[a.ch]=(unr[a.ch]||0)+1;drawCh()}return}
 drawAtt(a)}
async function sendAtt(blob,name){
 if(blob.size>MAXA){sys('Arquivo grande demais (máximo 8 MB)');return}
 const L=Object.values(peers).filter(p=>p.hi&&p.on&&p.dc&&p.dc.readyState=='open');
 if(!L.length){sys('Ninguém conectado para receber');return}
 const id=uid(),buf=await blob.arrayBuffer(),CS=12288,n=Math.max(1,Math.ceil(buf.byteLength/CS)),mime=blob.type||'application/octet-stream';
 addAtt({id,from:ID,who:NAME,name:safe(name),mime,size:blob.size,ts:Date.now(),ch:chn,blob});
 const head={t:'fh',id,name:safe(name),mime,size:blob.size,n,ch:chn,from:ID};
 L.forEach(p=>tx(p,head));
 for(let i=0;i<n;i++){const d=b64(buf.slice(i*CS,(i+1)*CS));
  for(const p of L){if(!p.dc||p.dc.readyState!='open')continue;while(p.dc.bufferedAmount>262144)await new Promise(r=>setTimeout(r,30));tx(p,{t:'fc',id,i,d})}}}
const _on=on;
on=async function(p,m){
 if(m.t=='fh'){
  if(!p.hi||ban.has(p.id)||seen.has(m.id)||!(m.size>0)||m.size>MAXA||!(m.n>0)||m.n>800)return;
  seen.add(m.id);rx[m.id]={h:m,parts:[],got:0,from:p.id};return}
 if(m.t=='fc'){
  const r=rx[m.id];
  if(!r||r.from!=p.id||typeof m.d!='string'||m.d.length>20000||!(m.i>=0&&m.i<r.h.n)||r.parts[m.i]!=null)return;
  r.parts[m.i]=m.d;r.got++;
  if(r.got==r.h.n){delete rx[m.id];const h=r.h;
   try{const blob=new Blob(r.parts.map(d=>Uint8Array.from(atob(d),c=>c.charCodeAt(0))),{type:String(h.mime||'application/octet-stream')});
    addAtt({id:h.id,from:p.id,who:dn(p),name:safe(h.name),mime:blob.type,size:blob.size,ts:Date.now(),ch:CH.includes(h.ch)?h.ch:'Geral',blob});beep(660)}catch(e){}}
  return}
 return _on(p,m)};
const _rd=render;
render=function(){_rd();atts.filter(a=>a.ch==chn).forEach(drawAtt)};
let mr=null,rch=[],rt=0,rtr=null;
const rb=E('button','','🎤'),ab=E('button','','📎'),fi=E('input');
rb.title='Gravar áudio: toque para começar e toque de novo para enviar';ab.title='Enviar arquivo ou foto';fi.type='file';fi.hidden=true;
$('#inp').insertBefore(rb,$('#snd'));$('#inp').insertBefore(ab,rb);document.body.append(fi);
ab.onclick=()=>fi.click();
fi.onchange=()=>{const f=fi.files[0];fi.value='';if(f)sendAtt(f,f.name)};
rb.onclick=async()=>{
 if(mr){mr.stop();return}
 if(!mic||!window.MediaRecorder){sys('Gravação indisponível neste aparelho');return}  if(!micLive){micAcquire().then(()=>sys('Microfone reativado: toque em 🎤 de novo'));return}
 try{
  rtr=mic.getAudioTracks()[0].clone();rtr.enabled=true;
  const mt=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
  mr=new MediaRecorder(new MediaStream([rtr]),mt?{mimeType:mt}:undefined);rch=[];
  mr.ondataavailable=e=>{if(e.data&&e.data.size)rch.push(e.data)};
  mr.onstop=()=>{clearTimeout(rt);rtr.stop();
   const type=(mr.mimeType||mt||'audio/webm').split(';')[0],b=new Blob(rch,{type});
   mr=null;rb.textContent='🎤';rb.style.background='';
   if(b.size>500)sendAtt(b,'audio-'+Date.now()+'.'+(type.includes('mp4')?'m4a':'webm'))};
  mr.start();rb.textContent='⏹';rb.style.background='var(--r)';
  rt=setTimeout(()=>{if(mr)mr.stop()},60000)
 }catch(e){mr=null;sys('Não consegui gravar: '+e.message)}};
