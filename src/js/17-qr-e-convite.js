 // ===== QR Code e convite (gerador de QR próprio, funciona sem internet) =====
function Q_make(text){
 const T=[0,[10,[[1,16]]],[16,[[1,28]]],[26,[[1,44]]],[18,[[2,32]]],[24,[[2,43]]],[16,[[4,27]]],[18,[[4,31]]],[22,[[2,38],[2,39]]],[22,[[3,36],[2,37]]],[26,[[4,43],[1,44]]]];
 const AL=[0,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
 const d=[...new TextEncoder().encode(text)];
 let v=1;const cap=k=>T[k][1].reduce((s,b)=>s+b[0]*b[1],0)*8;
 while(v<=10&&4+(v<10?8:16)+8*d.length>cap(v))v++;
 if(v>10)throw Error('texto grande demais para o QR');
 const bits=[],put=(x,n)=>{for(let i=n-1;i>=0;i--)bits.push((x>>i)&1)};
 put(4,4);put(d.length,v<10?8:16);d.forEach(b=>put(b,8));
 const cb=cap(v);put(0,Math.min(4,cb-bits.length));while(bits.length%8)bits.push(0);
 const dc=[];for(let i=0;i<bits.length;i+=8)dc.push(parseInt(bits.slice(i,i+8).join(''),2));
 for(let p=0xEC;dc.length<cb/8;p^=0xEC^0x11)dc.push(p);
 const ex=new Array(256),lg=new Array(256);for(let i=0,x=1;i<255;i++){ex[i]=x;lg[x]=i;x<<=1;if(x&256)x^=0x11d}
 const mul=(a,b)=>a&&b?ex[(lg[a]+lg[b])%255]:0;
 const ec=T[v][0];let g=[1];for(let i=0;i<ec;i++){const n=new Array(g.length+1).fill(0);g.forEach((c,j)=>{n[j]^=c;n[j+1]^=mul(c,ex[i])});g=n}
 const blocks=[];let pos=0;T[v][1].forEach(([n,k])=>{for(let i=0;i<n;i++){const data=dc.slice(pos,pos+k);pos+=k;const r=new Array(ec).fill(0);data.forEach(b=>{const f=b^r.shift();r.push(0);if(f)g.slice(1).forEach((c,j)=>r[j]^=mul(c,f))});blocks.push({data,ec:r})}});
 const out=[];const mk=Math.max(...blocks.map(b=>b.data.length));
 for(let i=0;i<mk;i++)blocks.forEach(b=>{if(i<b.data.length)out.push(b.data[i])});
 for(let i=0;i<ec;i++)blocks.forEach(b=>out.push(b.ec[i]));
 const N=17+4*v,M=[],F=[];for(let y=0;y<N;y++){M.push(new Array(N).fill(0));F.push(new Array(N).fill(0))}
 const sf=(x,y,b)=>{if(x>=0&&y>=0&&x<N&&y<N){M[y][x]=b?1:0;F[y][x]=1}};
 for(let i=0;i<N;i++){sf(6,i,i%2==0);sf(i,6,i%2==0)}
 [[3,3],[N-4,3],[3,N-4]].forEach(([x,y])=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const s=Math.max(Math.abs(dx),Math.abs(dy));sf(x+dx,y+dy,s!=2&&s!=4)}});
 const ap=AL[v];ap.forEach((a,i)=>ap.forEach((b,j)=>{if((i==0&&j==0)||(i==0&&j==ap.length-1)||(i==ap.length-1&&j==0))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)sf(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!=1)}));
 const fmt=mask=>{let data=(0<<3)|mask,r=data;for(let i=0;i<10;i++)r=(r<<1)^((r>>9)*0x537);const b=((data<<10)|r)^0x5412,bit=i=>(b>>i)&1;
  for(let i=0;i<=5;i++)sf(8,i,bit(i));sf(8,7,bit(6));sf(8,8,bit(7));sf(7,8,bit(8));for(let i=9;i<15;i++)sf(14-i,8,bit(i));
  for(let i=0;i<8;i++)sf(N-1-i,8,bit(i));for(let i=8;i<15;i++)sf(8,N-15+i,bit(i));sf(8,N-8,1)};
 fmt(0);
 if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>11)*0x1f25);const b=(v<<12)|r;for(let i=0;i<18;i++){const bt=(b>>i)&1,a=N-11+i%3,c=Math.floor(i/3);sf(a,c,bt);sf(c,a,bt)}}
 let k=0;for(let right=N-1;right>=1;right-=2){if(right==6)right=5;for(let vert=0;vert<N;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)==0,y=up?N-1-vert:vert;if(!F[y][x]&&k<out.length*8){M[y][x]=(out[k>>3]>>(7-(k&7)))&1;k++}}}
 const MC=[(x,y)=>(x+y)%2==0,(x,y)=>y%2==0,(x,y)=>x%3==0,(x,y)=>(x+y)%3==0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2==0,(x,y)=>x*y%2+x*y%3==0,(x,y)=>(x*y%2+x*y%3)%2==0,(x,y)=>((x+y)%2+x*y%3)%2==0];
 const pen=m=>{let p=0;const run=(get)=>{for(let a=0;a<N;a++){let c=get(a,0),n=1;for(let b=1;b<N;b++){const x=get(a,b);if(x==c)n++;else{if(n>=5)p+=3+n-5;c=x;n=1}}if(n>=5)p+=3+n-5;
   const s=[];for(let b=0;b<N;b++)s.push(get(a,b));const str=s.join('');['10111010000','00001011101'].forEach(pt=>{let i=-1;while((i=str.indexOf(pt,i+1))>=0)p+=40})}};
  run((a,b)=>m[a][b]);run((a,b)=>m[b][a]);
  for(let y=0;y<N-1;y++)for(let x=0;x<N-1;x++){const c=m[y][x];if(c==m[y][x+1]&&c==m[y+1][x]&&c==m[y+1][x+1])p+=3}
  let dk=0;m.forEach(r=>r.forEach(c=>dk+=c));p+=(Math.ceil(Math.abs(dk*20-N*N*10)/(N*N))-1)*10;return p};
 let best=0,bp=1e9,bm=null;
 for(let mk2=0;mk2<8;mk2++){const c=M.map(r=>r.slice());for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!F[y][x]&&MC[mk2](x,y))c[y][x]^=1;
  const sv=M.map(r=>r.slice());for(let y=0;y<N;y++)M[y]=c[y];fmt(mk2);const cc=M.map(r=>r.slice());const p=pen(cc);if(p<bp){bp=p;best=mk2;bm=cc}for(let y=0;y<N;y++)M[y]=sv[y]}
 return bm}


// ---- QR: desenho, caixa de convite e entrada por convite ----
let Q_txt='',Q_inv='';
function Q_draw(cv,text){const m=Q_make(text),n=m.length,s=Math.max(3,Math.floor(240/(n+8))),z=(n+8)*s;cv.width=cv.height=z;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,z,z);g.fillStyle='#000';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(m[y][x])g.fillRect((x+4)*s,(y+4)*s,s,s);cv.style.cssText='width:220px;height:220px;image-rendering:pixelated;border-radius:8px;align-self:center'}
const Q_bc=E('canvas'),Q_mc=E('canvas'),Q_sh=E('button','pri','📤 Compartilhar convite'),Q_sh2=E('button','','📤 Compartilhar convite');
const Q_box=E('div');Q_box.hidden=true;Q_box.style.cssText='display:flex;flex-direction:column;gap:8px';
Q_box.append(E('b','','📱 Convite por QR'),Q_bc,Q_sh,E('small','sm','No outro aparelho: Entrar com código → cole o convite recebido.'));
$('#rm').after(Q_box);$('#c1').after(Q_mc);Q_mc.hidden=true;$('#cp2').before(Q_sh2);Q_sh2.hidden=true;
const Q_send=()=>{try{LTAndroid.share(Q_inv)}catch(e){copyTxt(Q_inv);sys('Convite copiado')}};
Q_sh.onclick=Q_sh2.onclick=Q_send;
function Q_show(code){let a=null;try{a=JSON.parse(LTAndroid.roomAddr())}catch(e){}
 if(!a||!a.ips||!a.ips.length){Q_txt='';Q_inv='';return}
 Q_txt='LT2:'+code+':'+a.ips[0]+':'+a.port;
 Q_inv='Entre na minha sala no Talk Local'+(room?' ('+room+')':'')+'! Código: '+code+' · Convite: '+Q_txt+' (vale 10 min, na mesma rede Wi-Fi)';
 try{Q_draw(Q_bc,Q_txt);Q_draw(Q_mc,Q_txt)}catch(e){Q_txt=''}}
const Q_rn=roomNew;
roomNew=async function(){const c=await Q_rn();Q_show(c);return c};
setInterval(()=>{const on=!!(roomOn&&Q_txt);Q_box.hidden=!on;Q_mc.hidden=Q_sh2.hidden=!(on&&md=='r')},500);
// entrar com o convite colado (LT2:código:ip:porta); sem ele, segue o caminho normal
const Q_pd={},Q_nd=window.ltNativeDone;
window.ltNativeDone=(id,ok,v)=>{const q=Q_pd[id];if(!q)return Q_nd&&Q_nd(id,ok,v);delete Q_pd[id];if(ok){try{q.ok(JSON.parse(v))}catch(e){q.no(e)}}else q.no(new Error(v))};
const Q_fetchAt=(c,h,p)=>new Promise((ok,no)=>{const id='q'+Date.now();Q_pd[id]={ok,no};setTimeout(()=>{if(Q_pd[id]){delete Q_pd[id];no(new Error('o aparelho não respondeu'))}},12000);try{LTAndroid.roomFetchAt(id,c,h,String(p))}catch(e){delete Q_pd[id];no(e)}});
const Q_cj=codeJoin;
codeJoin=async function(){const m=$('#c1').value.match(/LT2:(\d{6}):(\d{1,3}(?:\.\d{1,3}){3}):(\d{2,5})/);
 if(!m||!(window.LTAndroid&&LTAndroid.roomFetchAt))return Q_cj();
 $('#hint').textContent='Conectando à sala…';
 const f=await Q_fetchAt(m[1],m[2],m[3]);
 $('#hint').textContent='Sala "'+f.name+'" encontrada. Conectando…';
 await nat.sendAnswer(f,m[1],await join(f.offer));$('#act').hidden=true};
const Q_rj=$('#rj').onclick;
if(Q_rj)$('#rj').onclick=()=>{Q_rj();$('#l1').textContent='Digite o código de 6 dígitos ou cole o convite recebido'};
