(function(){
'use strict';
var D=document;
/* precisa das funções do app e da Parte 3 */
if(typeof $!=='function'||typeof invite!=='function'||typeof join!=='function'||typeof dec!=='function')return;
var tg=D.getElementById('lt_net');if(!tg)return;
var card=null;
D.querySelectorAll('#v-cfg .lt-card').forEach(function(c){var h=c.querySelector('h3');if(h&&h.textContent==='Rede')card=c});
if(!card||D.getElementById('ltSrv'))return;

function ls(k){try{return localStorage[k]||''}catch(e){return ''}}
function sv(k,v){try{localStorage[k]=v}catch(e){}}
function netOn(){return ls('lt_net')==='1'}
function base(){return ls('lt_srv').trim().replace(/\/+$/,'')}
function okUrl(u){return /^https:\/\//.test(u)||/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(u)}
function ready(){return netOn()&&okUrl(base())&&!!ls('lt_key')}

var IC={
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4"/>',
  keypad:'<circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="18" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="18" cy="18" r="1.4"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  plug:'<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>'
};
function svg(k){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+IC[k]+'</svg>'}
function btn(id,k,txt,cls){
  var b=D.createElement('button');b.id=id;b.type='button';b.className='bt '+(cls||'');
  b.innerHTML=svg(k);var s=D.createElement('span');s.textContent=txt;b.appendChild(s);return b;
}

/* ---------- Conversa com o servidor ---------- */
async function api(path,method,body){
  if(!base())throw new Error('preencha o endereço do servidor em Ajustes');
  if(!okUrl(base()))throw new Error('o endereço do servidor precisa começar com https://');
  var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},12000);
  try{
    var r=await fetch(base()+path,{method:method||'GET',signal:ctl.signal,
      headers:Object.assign({'x-lt-key':ls('lt_key')},body?{'content-type':'application/json'}:{}),
      body:body?JSON.stringify(body):undefined});
    if(r.status===204)return null;
    var d={};try{d=await r.json()}catch(e){}
    if(!r.ok)throw new Error(r.status===401?'chave de acesso incorreta':(d.error||('erro '+r.status)));
    return d;
  }catch(e){
    if(e.name==='AbortError')throw new Error('o servidor não respondeu');
    if(e instanceof TypeError)throw new Error('sem conexão com o servidor');
    throw e;
  }finally{clearTimeout(t)}
}

/* ---------- Relé TURN (credenciais temporárias) para a Parte 3 usar ---------- */
async function loadTurn(){
  window.ltTurn=[];
  if(!ready())return;
  try{var d=await api('/turn');if(d&&Array.isArray(d.iceServers))window.ltTurn=d.iceServers}catch(e){}
}

/* ---------- Campos nos Ajustes (cartão Rede) ---------- */
var box=D.createElement('div');box.className='lt-srv';box.id='ltSrv';
function fld(label,type,key,ph){
  var w=D.createElement('div');w.className='fld';
  var l=D.createElement('label');l.textContent=label;
  var i=D.createElement('input');i.type=type;i.value=ls(key);i.placeholder=ph||'';i.autocomplete='off';i.spellcheck=false;
  i.setAttribute('autocapitalize','none');
  i.addEventListener('change',function(){sv(key,i.value.trim());loadTurn()});
  w.appendChild(l);w.appendChild(i);return w;
}
box.appendChild(fld('Endereço do servidor de salas','url','lt_srv','https://localtalk.seunome.workers.dev'));
box.appendChild(fld('Chave de acesso do grupo','password','lt_key','a mesma em todos os aparelhos'));
var tb=btn('ltTest','plug','Testar servidor','');
var st=D.createElement('p');st.className='sm';st.id='ltTestMsg';
tb.onclick=async function(){
  st.textContent='Testando…';
  try{
    var d=await api('/ping');await loadTurn();
    st.textContent='Servidor OK'+(d&&d.turn?' · relé TURN ativo':' · sem relé TURN (só conexão direta)');
  }catch(e){st.textContent='Falhou: '+e.message}
};
box.appendChild(tb);box.appendChild(st);
var after=tg.parentNode.nextSibling;  /* depois do texto explicativo da Parte 3 */
card.insertBefore(box,after&&after.nextSibling||null);

/* ---------- Botões em Dispositivos ---------- */
var anchor=$('#rj')||$('#bj');
if(!anchor)return;
var bC=btn('ltRc','qr','Criar sala pela internet','pri'),bJ=btn('ltRj','keypad','Entrar com código (internet)','');
anchor.after(bC,bJ);
function apply(){var on=netOn();box.hidden=!on;bC.hidden=bJ.hidden=!on}
tg.addEventListener('change',function(){apply();loadTurn()});
setInterval(apply,1500);apply();

/* ---------- Janela de convite: estado compartilhado ---------- */
var sess=0,curCode='';
function modalBase(){
  $('#modal').hidden=false;
  $('#l1').hidden=$('#c1').hidden=false;
  $('#l2').hidden=$('#c2').hidden=$('#cp1').hidden=$('#cp2').hidden=true;
  $('#c1').inputMode='text';$('#c1').setAttribute('autocapitalize','characters');
  $('#hint').textContent='';
}
function precisaConfig(){
  if(ready())return false;
  sess++;md='k';modalBase();$('#act').hidden=true;
  $('#l1').textContent='Sala pela internet';$('#c1').readOnly=true;$('#c1').value='';
  $('#hint').textContent='Antes, preencha o endereço do servidor e a chave de acesso em Ajustes, no cartão Rede.';
  return true;
}
function limpaSala(){sess++;if(curCode){api('/r/'+curCode,'DELETE').catch(function(){});curCode=''}}
$('#x').addEventListener('click',limpaSala);

/* ---------- Criar sala ---------- */
bC.onclick=async function(){
  if(precisaConfig())return;
  limpaSala();var s=sess;
  md='w';modalBase();$('#act').hidden=true;
  $('#l1').textContent='Código da sala (diga ou envie aos outros aparelhos)';
  var c1=$('#c1');c1.readOnly=true;c1.value='Criando…';
  try{
    var offer=await invite();
    var r=await api('/r','POST',{name:(typeof room==='string'&&room)||NAME,offer:offer});
    if(s!==sess){api('/r/'+r.code,'DELETE').catch(function(){});return}
    curCode=r.code;
    c1.value=r.code.slice(0,4)+'-'+r.code.slice(4);
    $('#hint').textContent='Sala aberta por 10 minutos. Em qualquer rede, a outra pessoa toca em “Entrar com código (internet)” e digita este código.';
    esperar(s,r.code);
  }catch(e){c1.value='';$('#hint').textContent='Erro: '+e.message}
};
async function esperar(s,code){
  var fim=Date.now()+600000,msgExp='A sala expirou. Feche e crie outra.';
  while(s===sess&&Date.now()<fim){
    await new Promise(function(r){setTimeout(r,2000)});
    if(s!==sess)return;
    if(pend&&pend.hi)return;
    try{
      var d=await api('/r/'+code+'/answer');
      if(d&&d.answer){
        curCode='';$('#hint').textContent='Conectando… aguarde alguns segundos.';
        if(pend&&!pend.hi)await pend.pc.setRemoteDescription(await dec(d.answer));
        return;
      }
    }catch(e){if(/expir|existe/.test(e.message)){$('#hint').textContent=msgExp;return}}
  }
  if(s===sess)$('#hint').textContent=msgExp;
}

/* ---------- Entrar com código ---------- */
bJ.onclick=function(){
  if(precisaConfig())return;
  limpaSala();
  md='k';modalBase();
  $('#l1').textContent='Digite o código da sala (8 letras e números)';
  $('#c1').readOnly=false;$('#c1').value='';
  $('#act').textContent='Entrar';$('#act').hidden=false;
};
var act=$('#act'),oldAct=act.onclick;
act.onclick=async function(){
  if(md!=='k'||!ready())return oldAct&&oldAct.apply(this,arguments);
  var c1=$('#c1'),h=$('#hint');
  try{
    var code=c1.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(code.length!==8)throw new Error('o código tem 8 letras e números');
    h.textContent='Procurando a sala…';
    var f=await api('/r/'+code);
    h.textContent='Sala “'+f.name+'” encontrada. Conectando…';
    var ans=await join(f.offer);
    await api('/r/'+code+'/answer','POST',{answer:ans});
    act.hidden=true;h.textContent='Conectando… aguarde alguns segundos.';
  }catch(e){h.textContent='Erro: '+e.message}
};

/* ---------- Botão Compartilhar (convite, resposta e código de sala) ---------- */
var sh=btn('ltShare','share','Compartilhar','');sh.hidden=true;
$('#cp2').after(sh);
function shareInfo(){
  var c1=$('#c1').value.trim(),c2=$('#c2').value.trim();
  if(md==='i')return /^LT1:/.test(c1)?c1:'';
  if(md==='j')return /^LT1:/.test(c2)?c2:'';
  if(md==='w')return /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c1)?'LocalTalk: toque em “Entrar com código (internet)” e digite o código da sala: '+c1:'';
  if(md==='r')return /^\d{6}$/.test(c1)?'LocalTalk: toque em “Entrar com código” e digite o código da sala: '+c1:'';
  return '';
}
setInterval(function(){sh.hidden=$('#modal').hidden||!shareInfo()},400);
sh.onclick=function(){
  var t=shareInfo();if(!t)return;
  try{LTAndroid.share(t);return}catch(e){}
  if(navigator.share){navigator.share({text:t}).catch(function(){});return}
  copyTxt(t);$('#hint').textContent='Copiado. Cole em uma conversa para enviar.';
};

loadTurn();setInterval(loadTurn,3*3600*1000);
})();
