(function(){
'use strict';
var md=navigator.mediaDevices;if(!md||!md.getUserMedia||!window.AudioContext)return;
var gum=md.getUserMedia.bind(md);
function thr(){try{return parseFloat(localStorage.lt_gate)||0.02}catch(e){return 0.02}}
md.getUserMedia=async function(c){
  if(!c||!c.audio||c.video)return gum(c);
  var a=(typeof c.audio==='object')?c.audio:{};
  var raw=await gum(Object.assign({},c,{audio:Object.assign({},a,{echoCancellation:true,noiseSuppression:true,autoGainControl:false})}));
  try{
    var ctx=new AudioContext();ctx.resume&&ctx.resume();
    var src=ctx.createMediaStreamSource(raw);
    var hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=180;
    var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3600;
    var an=ctx.createAnalyser();an.fftSize=1024;
    var g=ctx.createGain();g.gain.value=0;
    var comp=ctx.createDynamicsCompressor();
    comp.threshold.value=-30;comp.ratio.value=4;comp.attack.value=0.005;comp.release.value=0.2;
    var dest=ctx.createMediaStreamDestination();
    src.connect(hp);hp.connect(lp);lp.connect(an);lp.connect(g);g.connect(comp);comp.connect(dest);
    var buf=new Float32Array(an.fftSize),hold=0;
    var iv=setInterval(function(){
      if(ctx.state==='suspended')ctx.resume();
      an.getFloatTimeDomainData(buf);
      var s=0;for(var i=0;i<buf.length;i++)s+=buf[i]*buf[i];
      var rms=Math.sqrt(s/buf.length),now=Date.now();
      if(rms>thr())hold=now+350;
      g.gain.setTargetAtTime(now<hold?1:0,ctx.currentTime,now<hold?0.01:0.08);
    },20);
    var tr=dest.stream.getAudioTracks()[0],st=tr.stop.bind(tr);
    tr.stop=function(){st();clearInterval(iv);raw.getTracks().forEach(function(t){t.stop()});try{ctx.close()}catch(e){}};
    return dest.stream;
  }catch(e){return raw}
};
})();
