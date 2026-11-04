(function(){
'use strict';
var D=document;
function $(i){return D.getElementById(i)}
var P={
  chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  dev:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  map:'<path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"/><path d="M9 4v13M15 7v13"/>',
  cfg:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4"/>',
  keypad:'<circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="18" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="18" cy="18" r="1.4"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  userx:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 8l5 5M22 8l-5 5"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  vol:'<path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  mute:'<path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/>',
  locate:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  pin:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14a5 5 0 0 0 8 0M9 9.5v.01M15 9.5v.01"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/>',
  camera:'<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  clip:'<path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7L10 17.4a1.7 1.7 0 0 1-2.4-2.4L15 7.6"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
  cube:'<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>'
};
function svg(k){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+P[k]+'</svg>'}
function ico(k){var s=D.createElement('span');s.className='ico';s.innerHTML=svg(k);return s}

/* 1) Cabeçalho em cada aba */
[['v-chat','chat','Conversas'],['v-dev','dev','Dispositivos'],['v-map','map','Mapa'],['v-cfg','cfg','Ajustes']].forEach(function(a){
  var s=$(a[0]);if(!s||s.querySelector('.lt-head'))return;
  var h=D.createElement('div');h.className='lt-head';
  var t=D.createElement('h2');t.textContent=a[2];
  h.appendChild(ico(a[1]));h.appendChild(t);s.insertBefore(h,s.firstChild);
});

/* 2) Botões da aba Dispositivos: ícone + texto (o texto pode ser trocado pelo app; refaz o ícone) */
function deco(btn,key){
  if(!btn)return;
  if(btn.firstElementChild&&btn.firstElementChild.tagName.toLowerCase()==='svg')return;
  var txt=btn.textContent.replace(/^[^A-Za-zÀ-ÿ0-9]+/,'').trim();
  btn.classList.add('bt');
  btn.innerHTML=svg(key);
  var s=D.createElement('span');s.textContent=txt;btn.appendChild(s);
}
[['bi','plus'],['bj','link'],['rc','qr'],['rj','keypad']].forEach(function(a){
  var b=$(a[0]);if(!b)return;deco(b,a[1]);
  new MutationObserver(function(){deco(b,a[1])}).observe(b,{childList:true});
});
var dev=$('v-dev');
if(dev)dev.querySelectorAll('p.sm:not([id])').forEach(function(p){
  if(p.classList.contains('lt-info'))return;
  p.classList.add('lt-info');
  var t=D.createElement('span');t.textContent=p.textContent;p.textContent='';
  p.appendChild(ico('info'));p.appendChild(t);
});

/* 3) Lista de dispositivos: avatar + botões redondos (a lista é refeita pelo app a cada mudança) */
var BI=[['✏','edit','edit','Editar apelido'],['🗑','trash','del','Apagar contato'],['🔔','bell','','Chamar este aparelho'],['🔊','vol','','Silenciar'],['🔇','mute','','Reativar som'],['✕','userx','del','Remover da rede']];
function picFor(name){
  /* foto real (do lt-extras.js) do aparelho dessa linha; vazio se não houver */
  try{
    if(!window.ltAvatar)return '';
    if(/\(este aparelho\)/.test(name))return window.ltAvatar(ID)||'';
    var n=name.replace(/^👑\s*/,''),ps=Object.values(peers);
    for(var i=0;i<ps.length;i++){if(dn(ps[i])===n)return ps[i].pic||''}
  }catch(e){}
  return '';
}
function rows(){
  var dl=$('dl');if(!dl)return;
  dl.querySelectorAll('.it').forEach(function(r){
    if(r.dataset.lt)return;r.dataset.lt='1';
    var dot=r.querySelector('i.d'),b=r.querySelector('b'),name=b?b.textContent:'';
    var self=/\(este aparelho\)/.test(name);
    var w=D.createElement('div');w.className='avw';
    var a=D.createElement('span');a.className='av2'+(self?' self':'');
    var pic=picFor(name);
    if(pic){a.style.background='url("'+pic+'") center/cover'}
    else if(self)a.innerHTML=svg('dev');
    else a.textContent=(name.replace(/^[^A-Za-zÀ-ÿ0-9]+/,'').charAt(0)||'?').toUpperCase();
    w.appendChild(a);if(dot)w.appendChild(dot);
    r.insertBefore(w,r.firstChild);
    if(self)r.classList.add('self');
    r.querySelectorAll('button').forEach(function(btn){
      var t=btn.textContent;
      for(var i=0;i<BI.length;i++){
        if(t.indexOf(BI[i][0])>-1){
          btn.innerHTML=svg(BI[i][1]);btn.className='rb '+BI[i][2];
          btn.setAttribute('aria-label',BI[i][3]);break;
        }
      }
    });
  });
}
var dl=$('dl');
if(dl){new MutationObserver(rows).observe(dl,{childList:true});rows()}

/* 4) Conversas: dock de falar (botão circular no centro, sino e SOS ao lado) */
var chat=$('v-chat'),bar=$('bar'),inp=$('inp'),ptt=$('ptt');
if(chat&&bar&&inp&&ptt&&!chat.querySelector('.lt-dock')){
  var dock=D.createElement('div');dock.className='lt-dock';
  var lbl=D.createElement('div');lbl.id='ltPttLbl';
  dock.appendChild(bar);dock.appendChild(lbl);dock.appendChild(inp);chat.appendChild(dock);
  var mir=function(){lbl.textContent=ptt.textContent};
  new MutationObserver(mir).observe(ptt,{childList:true,characterData:true,subtree:true});mir();
}

/* 4b) Barra de mensagem: ícones vetoriais no lugar dos emojis + quebra de linha quando há muitos botões */
var IB=[['😊','smile','Emoji'],['🖼','image','Galeria'],['📷','camera','Câmera'],['📎','clip','Anexar arquivo'],['🎤','mic','Gravar áudio'],['🎙','mic','Gravar áudio']];
function inpFix(){
  if(!inp)return;
  inp.querySelectorAll('button').forEach(function(b){
    if(!b.dataset.ltObs){b.dataset.ltObs='1';new MutationObserver(inpFix).observe(b,{childList:true})}
    if(b.firstElementChild&&b.firstElementChild.tagName.toLowerCase()==='svg')return;
    var t=b.textContent;if(t.trim().length>3)return;
    for(var i=0;i<IB.length;i++){
      if(t.indexOf(IB[i][0])>-1){b.innerHTML=svg(IB[i][1]);if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',IB[i][2]);break}
    }
  });
  var vis=[].filter.call(inp.querySelectorAll('button'),function(b){return b.offsetParent!==null}).length;
  inp.classList.toggle('lt-wrap',vis>4);
}
if(inp){
  new MutationObserver(inpFix).observe(inp,{childList:true});
  window.addEventListener('resize',inpFix);setInterval(inpFix,1500);inpFix();
  D.querySelectorAll('nav button').forEach(function(b){b.addEventListener('click',function(){setTimeout(inpFix,0)})});
}

/* 5) Mapa: usa os elementos que o app já cria (mapa real 3D e radar). NÃO substitui drawMap. */
var vm=$('v-map'),cv=$('cv'),lo=$('lo'),lh=$('lh');
if(vm&&cv&&lo&&lh&&!vm.querySelector('.lt-share')){
  var mDiv=cv.previousElementSibling,mNote=mDiv&&mDiv.previousElementSibling,
      mCtr=mNote&&mNote.previousElementSibling,mBtn=mCtr&&mCtr.previousElementSibling;
  /* cartão de compartilhamento com indicador ativado/desativado */
  var lab=lo.parentNode,t=lab.lastChild;
  if(t&&t.nodeType===3){var sp=D.createElement('span');sp.textContent=t.textContent;lab.replaceChild(sp,t)}
  lab.insertBefore(ico('pin'),lab.firstChild);
  var sh=D.createElement('div');sh.className='lt-card lt-share';
  var hr=D.createElement('div');hr.className='lt-hrow';
  var h3=D.createElement('h3');h3.textContent='Localização';
  var chip=D.createElement('span');chip.className='chip off';chip.textContent='Desativado';
  hr.appendChild(h3);hr.appendChild(chip);
  sh.appendChild(hr);sh.appendChild(lab);sh.appendChild(lh);
  var hd=vm.querySelector('.lt-head');vm.insertBefore(sh,hd?hd.nextSibling:vm.firstChild);
  var sync2=function(){var on=!!lo.checked;chip.textContent=on?'Ativado':'Desativado';chip.className='chip'+(on?'':' off')};
  lo.addEventListener('change',sync2);setInterval(sync2,1500);sync2();
  /* botões do mapa real: ícone + texto (o app troca o texto ao abrir/fechar) */
  if(mBtn&&mCtr&&mBtn.tagName==='BUTTON'&&mCtr.tagName==='BUTTON'){
    var row=D.createElement('div');row.className='lt-mrow';
    var b3=mBtn.previousElementSibling,has3=b3&&b3.tagName==='BUTTON'&&/Visão/.test(b3.textContent);
    vm.insertBefore(row,has3?b3:mBtn);
    if(has3){row.appendChild(b3);b3.classList.remove('pri')}
    row.appendChild(mBtn);row.appendChild(mCtr);
    mBtn.classList.add('pri');
    var pairs=[[mBtn,'map'],[mCtr,'locate']];if(has3)pairs.push([b3,'cube']);
    pairs.forEach(function(a){
      deco(a[0],a[1]);new MutationObserver(function(){deco(a[0],a[1])}).observe(a[0],{childList:true});
    });
    mDiv.classList.add('lt-mapbox');
  }
  cv.classList.add('lt-radar');
  /* botão de copiar coordenadas na lista de aparelhos do mapa */
  var ml=$('ml');
  if(ml){
    var fixml=function(){cv.classList.toggle('lt-none',!ml.querySelector('.it'));ml.querySelectorAll('.it button').forEach(function(b){
      if(b.textContent.indexOf('📋')>-1){b.innerHTML=svg('copy');b.className='rb';b.setAttribute('aria-label','Copiar coordenadas')}})};
    new MutationObserver(fixml).observe(ml,{childList:true});fixml();
  }
}
})();
