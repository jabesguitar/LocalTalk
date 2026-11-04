(function(){
'use strict';
var D=document;
function on(){try{return localStorage.lt_net==='1'}catch(e){return false}}
function set(v){try{localStorage.lt_net=v?'1':'0'}catch(e){}}

/* 1) Servidores de descoberta. window.ltTurn é reservado para a Etapa 2 (relé TURN). */
var STUN=[{urls:['stun:stun.cloudflare.com:3478','stun:stun.l.google.com:19302']}];
var Orig=window.RTCPeerConnection;
if(Orig&&!Orig.__lt){
  var LTPC=class extends Orig{
    constructor(cfg){
      cfg=Object.assign({},cfg||{});
      if(on()&&(!cfg.iceServers||!cfg.iceServers.length))cfg.iceServers=STUN.concat(window.ltTurn||[]);
      super(cfg);
    }
  };
  LTPC.__lt=1;
  window.RTCPeerConnection=LTPC;
}

/* 2) Interruptor nos Ajustes (cartão "Rede") */
var cfg=D.getElementById('v-cfg');if(!cfg)return;
var card=null;
cfg.querySelectorAll('.lt-card').forEach(function(c){var h=c.querySelector('h3');if(h&&h.textContent==='Rede')card=c});
if(!card||D.getElementById('lt_net'))return;

var lb=D.createElement('label');lb.className='ck';
var ic=D.createElement('span');ic.className='ico';
ic.innerHTML='<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>';
var inp=D.createElement('input');inp.type='checkbox';inp.id='lt_net';inp.checked=on();
var sp=D.createElement('span');sp.textContent='Conexão pela internet (outras redes)';
lb.appendChild(ic);lb.appendChild(sp);lb.appendChild(inp);

var note=D.createElement('p');note.className='sm';
note.textContent='Ligada: usa servidores públicos (Cloudflare e Google) só para descobrir o seu endereço na internet e conectar com aparelhos em outras redes. Mensagens, áudio e localização continuam indo direto entre os aparelhos. Vale para as próximas conexões; desligada, o app usa só a rede local.';

card.insertBefore(lb,card.children[1]||null);
card.insertBefore(note,lb.nextSibling);
inp.addEventListener('change',function(){set(inp.checked)});
})();
