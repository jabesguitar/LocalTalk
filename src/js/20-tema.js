/* Camada visual: troca ícones e reorganiza os Ajustes em cartões.
   Os elementos originais (ids, eventos) são apenas MOVIDOS, nunca recriados. */
(function(){
'use strict';
var D=document;
function $(i){return D.getElementById(i)}
var P={
  chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  dev:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  map:'<path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z"/><path d="M9 4v13M15 7v13"/>',
  cfg:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  home:'<path d="M3 11 12 3l9 8v10H3z"/><path d="M9 21v-6h6v6"/>',
  vol:'<path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  screen:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  pulse:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
  camera:'<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>'
};
function svg(k){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+P[k]+'</svg>'}
function ico(k){var s=D.createElement('span');s.className='ico';s.innerHTML=svg(k);return s}

/* 1) Barra de navegação com ícones vetoriais */
var N={chat:'Conversas',dev:'Dispositivos',map:'Mapa',cfg:'Ajustes'};
var tabs=D.querySelectorAll('nav button[data-v]');
tabs.forEach(function(b){
  var k=b.dataset.v;
  b.textContent='';
  b.insertAdjacentHTML('afterbegin',svg(k));
  var s=D.createElement('span');s.textContent=N[k];b.appendChild(s);
  b.setAttribute('aria-label',N[k]);
  if(b.classList.contains('sel'))b.setAttribute('aria-current','page');
  b.addEventListener('click',function(){
    tabs.forEach(function(x){x.removeAttribute('aria-current')});
    b.setAttribute('aria-current','page');
  });
});

/* 2) Botões de ícone (sem emoji) */
function ib(id,k,label){var e=$(id);if(!e)return;e.innerHTML=svg(k);e.setAttribute('aria-label',label)}
ib('call','bell','Chamar atenção de todos');
ib('snd','send','Enviar mensagem');
ib('fv','star','Mostrar só favoritas');
var sos=$('sos');if(sos)sos.setAttribute('aria-label','SOS: segure por 1 segundo para enviar');

/* 3) Ajustes em cartões */
var cfg=$('v-cfg');
if(cfg&&!cfg.querySelector('.lt-card')&&$('cn')&&$('rn')&&$('pf')&&$('o1')&&$('o2')&&$('o3')){
  var field=function(id,icon){
    var el=$(id),lb=el.previousElementSibling,w=D.createElement('div');
    w.className='fld';lb.insertBefore(ico(icon),lb.firstChild);w.appendChild(lb);w.appendChild(el);return w;
  };
  var tog=function(id,icon){
    var lb=$(id).parentNode,t=lb.lastChild;
    if(t&&t.nodeType===3){var s=D.createElement('span');s.textContent=t.textContent;lb.replaceChild(s,t)}
    lb.insertBefore(ico(icon),lb.firstChild);return lb;
  };
  var card=function(title){var c=D.createElement('div');c.className='lt-card';var h=D.createElement('h3');h.textContent=title;c.appendChild(h);return c};
  var info=cfg.querySelector('p.sm');

  var prof=D.createElement('div');prof.className='lt-card';
  prof.innerHTML='<div class="prof"><div class="av" id="ltAv" aria-hidden="true"></div><div><b id="ltPn"></b><small><i class="dot" id="ltDot"></i><span id="ltSt"></span></small></div></div>';

  var c1=card('Perfil');
  c1.appendChild(field('cn','user'));c1.appendChild(field('rn','home'));c1.appendChild(field('pf','cfg'));

  var c2=card('Conexão e áudio');
  c2.appendChild(tog('o1','vol'));c2.appendChild(tog('o2','screen'));c2.appendChild(tog('o3','pulse'));

  var c4=null;
  if($('o4')&&$('vd')){c4=card('Botões de volume');c4.appendChild(tog('o4','vol'));c4.appendChild(field('vd','vol'))}

  var c3=card('Rede');
  var chip=D.createElement('span');chip.className='chip';chip.textContent='WebRTC · criptografado';
  c3.appendChild(chip);if(info)c3.appendChild(info);

  /* Itens que o lt-extras.js coloca nos Ajustes: foto de perfil (vai para o topo do cartão Perfil)
     e "microfone aberto" (vai para Conexão e áudio). Só são movidos, os eventos continuam valendo. */
  var rest=Array.prototype.slice.call(cfg.children).filter(function(n){return n.nodeType===1&&!n.classList.contains('lt-card')});
  var fLb=null,fBox=null,extra=[];
  rest.forEach(function(n){
    if(n.tagName==='LABEL'&&n.classList.contains('ck')){
      var t0=n.lastChild;
      if(t0&&t0.nodeType===3){var s0=D.createElement('span');s0.textContent=t0.textContent.replace(/^[^A-Za-zÀ-ÿ0-9]+/,'');n.replaceChild(s0,t0)}
      n.insertBefore(ico('mic'),n.firstChild);c2.appendChild(n);
    }else if(n.tagName==='LABEL'){fLb=n}
    else if(n.tagName==='DIV'&&n.querySelector('button')){fBox=n}
    else extra.push(n);
  });
  if(fLb||fBox){
    var fw=D.createElement('div');fw.className='fld';
    if(fLb){fLb.insertBefore(ico('camera'),fLb.firstChild);fw.appendChild(fLb)}
    if(fBox){
      fBox.querySelectorAll('button').forEach(function(b){
        var tx=b.textContent.replace(/^[^A-Za-zÀ-ÿ0-9]+/,'').trim();
        b.classList.add('bt');b.innerHTML=svg('camera');var sp=D.createElement('span');sp.textContent=tx;b.appendChild(sp);
      });
      fw.appendChild(fBox);
    }
    c1.insertBefore(fw,c1.children[1]||null);
  }
  extra.forEach(function(n){c1.appendChild(n)});
  cfg.appendChild(prof);cfg.appendChild(c1);cfg.appendChild(c2);if(c4)cfg.appendChild(c4);cfg.appendChild(c3);

  /* Cabeçalho do perfil: só dados reais (nome digitado, estado da rede). Não há foto no app: usa a inicial. */
  var sync=function(){
    var n=(($('cn').value)||localStorage.lt_name||'').trim();
    var pic='';try{pic=(window.ltAvatar&&typeof ID!=='undefined')?window.ltAvatar(ID):''}catch(e){}
    var av=$('ltAv');
    if(pic){av.textContent='';av.style.background='url("'+pic+'") center/cover'}
    else{av.style.background='';av.textContent=n.charAt(0)||'?'}
    $('ltPn').textContent=n||'Seu nome';
    var hd=$('hd')?$('hd').textContent:'';
    $('ltSt').textContent=hd||'Aguardando conexão';
    $('ltDot').className='dot'+(hd&&hd.indexOf('Sem dispositivos')<0?' on':'');
  };
  ['change','input'].forEach(function(ev){$('cn').addEventListener(ev,sync);$('rn').addEventListener(ev,sync)});
  var go=$('go');if(go)go.addEventListener('click',sync);
  setInterval(sync,1500);sync();
}
})();
