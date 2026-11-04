 // ===== Mapa real (ruas e prédios em 3D) — OPCIONAL, precisa de internet =====
// Só carrega quando você toca em "Mapa real". Sem internet, volta sozinho para o radar.
let RM_on=0,RM_map=null,RM_mk={},RM_busy=0;
// No Android o MapLibre vem dentro do app (pasta maplibre/); a CDN fica só para o Windows.
const RM_CDN=window.LTAndroid?'maplibre/':'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/';
const RM_div=E('div'),RM_btn=E('button','','🗺 Mapa real (internet)'),RM_ctr=E('button','','📍 Centralizar'),RM_note=E('small','sm','');
RM_div.hidden=true;RM_ctr.hidden=true;RM_div.style.cssText='height:380px;border-radius:16px;overflow:hidden;position:relative;background:var(--p);flex:none';
$('#cv').before(RM_btn,RM_ctr,RM_note,RM_div);
function RM_load(){return new Promise((ok,no)=>{
 if(window.maplibregl)return ok();
 const l=document.createElement('link');l.rel='stylesheet';l.href=RM_CDN+'maplibre-gl.css';document.head.append(l);
 const s=document.createElement('script');s.src=RM_CDN+'maplibre-gl.js';
 const t=setTimeout(()=>no(new Error('sem internet')),12000);
 s.onload=()=>{clearTimeout(t);window.maplibregl?ok():no(new Error('a biblioteca do mapa não carregou'))};
 s.onerror=()=>{clearTimeout(t);no(new Error(window.LTAndroid?'a biblioteca do mapa não está no app':'sem internet'))};
 document.head.append(s)})}
function RM_free(){try{Object.values(RM_mk).forEach(o=>o.mk.remove());if(RM_map)RM_map.remove()}catch(e){}RM_map=null;RM_mk={}}
function RM_off(msg){RM_on=0;RM_free();RM_div.hidden=true;RM_ctr.hidden=true;$('#cv').hidden=false;RM_btn.textContent='🗺 Mapa real (internet)';RM_note.textContent=msg||'';drawMap()}
function RM_3d(){try{const st=RM_map.getStyle();if(!st||st.layers.some(l=>l.type=='fill-extrusion'))return;
 const b=st.layers.find(l=>l['source-layer']=='building'&&l.type=='fill');if(!b)return;
 RM_map.addLayer({id:'lt-3d',type:'fill-extrusion',source:b.source,'source-layer':'building',minzoom:14,paint:{'fill-extrusion-color':'#aab4c8','fill-extrusion-height':['coalesce',['get','render_height'],10],'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':.85}})}catch(e){}}
function RM_el(){const e=document.createElement('div'),ini=document.createElement('span'),lb=document.createElement('span');
 e.style.cssText='width:32px;height:32px;border-radius:50%;border:3px solid #27c46b;background:#27c46b;box-shadow:0 0 0 2px #0008;color:#fff;font:700 13px system-ui;display:flex;align-items:center;justify-content:center';
 lb.style.cssText='position:absolute;top:35px;left:50%;transform:translateX(-50%);white-space:nowrap;font:600 11px system-ui;color:#fff;text-shadow:0 0 3px #000,0 0 3px #000';
 e.append(ini,lb);e.ini=ini;e.lb=lb;return e}
function RM_upd(){if(!RM_map)return;
 const{r}=mapRows(),sp=typeof speakers=='function'?speakers():[],seen={};
 r.forEach(q=>{seen[q.id]=1;let o=RM_mk[q.id];
  if(!o){const el=RM_el();o=RM_mk[q.id]={el,mk:new maplibregl.Marker({element:el}).setLngLat([q.lon,q.lat]).addTo(RM_map)}}
  o.mk.setLngLat([q.lon,q.lat]);
  const talking=sp.some(s=>s.id==q.id),a=(window.ltAvatar&&window.ltAvatar(q.id))||'',col=talking?'#ff4d5e':q.me?'#2f6bff':q.stale?'#8a97b3':'#27c46b';
  o.el.style.borderColor=col;o.el.style.boxShadow=talking?'0 0 0 6px #ff4d5e66':'0 0 0 2px #0008';
  if(o.a!==a){o.a=a;o.el.style.background=a?'url("'+a+'") center/cover':col}
  else if(!a)o.el.style.background=col;
  o.el.ini.textContent=a?'':(q.name||'?')[0].toUpperCase();o.el.lb.textContent=q.name})
 Object.keys(RM_mk).forEach(id=>{if(!seen[id]){RM_mk[id].mk.remove();delete RM_mk[id]}})}
async function RM_start(){if(RM_map||RM_busy)return;RM_busy=1;
 try{
  const{c}=mapRows();
  if(!c){RM_off('Ative "Compartilhar minha localização" (ou espere alguém ativar) para abrir o mapa real.');return}
  RM_note.textContent='Carregando mapa…';
  await RM_load();
  if(!RM_on)return;
  RM_div.hidden=false;$('#cv').hidden=true;RM_ctr.hidden=false;
  RM_map=new maplibregl.Map({container:RM_div,style:'https://tiles.openfreemap.org/styles/liberty',center:[c.lon,c.lat],zoom:16.5,pitch:60,maxPitch:75,attributionControl:{compact:true}});
  RM_map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
  const tm=setTimeout(()=>{if(RM_map&&!RM_map.loaded())RM_off('Não consegui carregar o mapa (sem internet?). Voltei para o radar.')},15000);
  RM_map.on('load',()=>{clearTimeout(tm);RM_note.textContent='';RM_3d();RM_upd()});
 }catch(e){RM_off('Mapa real indisponível: '+(e&&e.message||'erro')+'. Voltei para o radar.')}
 finally{RM_busy=0}}
const RM_dr=drawMap;
drawMap=function(){RM_dr();if(!RM_on)return;
 if(cur!='map'){if(RM_map)RM_free();return}
 if(!RM_map)RM_start();else RM_upd()};
RM_btn.onclick=()=>{if(RM_on){RM_off();return}RM_on=1;RM_btn.textContent='🗺 Fechar mapa real';RM_note.textContent='';drawMap()};
RM_ctr.onclick=()=>{const{c}=mapRows();if(c&&RM_map)RM_map.easeTo({center:[c.lon,c.lat],pitch:60,duration:600})};
