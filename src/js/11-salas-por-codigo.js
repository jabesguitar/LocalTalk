// ---- Sala por código (precisa do módulo nativo window.LTNative; sem ele os botões ficam ocultos) ----
// Ponte do Android: a sala por código roda no Java (MainActivity) e responde por aqui.
if(window.LTAndroid&&window.LTAndroid.roomHost&&!window.LTNative){const pd={};let nn=0;
 window.ltNativeDone=(id,ok,v)=>{const q=pd[id];if(!q)return;delete pd[id];if(ok){try{q.ok(JSON.parse(v))}catch(e){q.no(e)}}else q.no(new Error(v))};
 const call=(fn,...a)=>new Promise((ok,no)=>{const id='r'+(++nn);pd[id]={ok,no};setTimeout(()=>{if(pd[id]){delete pd[id];no(new Error('o aparelho não respondeu'))}},12000);try{window.LTAndroid[fn](id,...a)}catch(e){delete pd[id];no(e)}});
 window.LTNative={host:(n,o)=>call('roomHost',String(n),o),stop:()=>{try{window.LTAndroid.roomStop()}catch(e){}},fetchOffer:c=>call('roomFetch',c),sendAnswer:(f,c,a)=>call('roomAnswer',f.host,String(f.port),c,a)}}
const nat=window.LTNative;let roomOn=0;
const setRoom=t=>{$('#rm').textContent=t;$('#rm').hidden=!t};
async function roomNew(){try{const c=await invite(),code=await nat.host(room||NAME,c);setRoom('Sala aberta · código '+code+' (vale 10 min)');return code}catch(e){roomOn=0;setRoom('');$('#rc').textContent='🔢 Criar sala com código';throw e}}
window.ltOnAnswer=async a=>{try{if(pend&&!pend.hi)await pend.pc.setRemoteDescription(await dec(a))}catch(e){sys('Resposta de conexão inválida')}};
async function codeJoin(){const code=$('#c1').value.replace(/\D/g,'');if(code.length!=6)throw Error('o código tem 6 dígitos');$('#hint').textContent='Procurando a sala na rede…';const f=await nat.fetchOffer(code);$('#hint').textContent='Sala "'+f.name+'" encontrada. Conectando…';await nat.sendAnswer(f,code,await join(f.offer));$('#act').hidden=true}
if(nat){$('#rc').hidden=$('#rj').hidden=false;
 $('#rc').onclick=async()=>{if(roomOn){roomOn=0;try{nat.stop()}catch(e){}setRoom('');$('#rc').textContent='🔢 Criar sala com código';return}
  roomOn=1;$('#rc').textContent='✖ Fechar sala';$('#modal').hidden=false;md='r';$('#act').hidden=true;$('#l1').textContent='Código da sala (diga ou mostre aos outros aparelhos)';$('#c1').readOnly=true;$('#c1').value='Criando…';$('#l2').hidden=$('#c2').hidden=$('#cp2').hidden=true;$('#hint').textContent='Quem estiver na mesma rede digita o código em "Entrar com código".';
  try{$('#c1').value=await roomNew()}catch(e){$('#c1').value='';$('#hint').textContent='Erro: '+e.message}};
 $('#rj').onclick=()=>{md='c';$('#modal').hidden=false;$('#l1').textContent='Digite o código de 6 dígitos da sala';$('#c1').readOnly=false;$('#c1').value='';$('#c1').inputMode='numeric';$('#l2').hidden=$('#c2').hidden=$('#cp1').hidden=$('#cp2').hidden=true;$('#act').textContent='Entrar';$('#act').hidden=false;$('#hint').textContent=''}}
$('#bi').onclick=()=>setMode('i');$('#bj').onclick=()=>setMode('j');$('#x').onclick=()=>$('#modal').hidden=true;
$('#act').onclick=async()=>{try{if(md=='n')saveNick();else if(md=='c')await codeJoin();else if(md=='i'){const o=await dec($('#c2').value);await pend.pc.setRemoteDescription(o);$('#hint').textContent='Conectando…'}else{$('#c2').value=await join($('#c1').value);$('#act').hidden=true;$('#hint').textContent='Envie a resposta e aguarde conectar…'}}catch(e){$('#hint').textContent='Erro: '+e.message}};
const cp=el=>{el.select();document.execCommand('copy');navigator.clipboard&&navigator.clipboard.writeText(el.value).catch(()=>{})};
$('#cp1').onclick=()=>cp($('#c1'));$('#cp2').onclick=()=>cp($('#c2'));
