export function configuration() {
 const $=id=>document.getElementById(id),iceServers=[];
 if($('stun').checked)iceServers.push({urls:'stun:stun.l.google.com:19302'});
 const url=$('turn-url').value.trim();
 if(url){if(!/^turns?:[^\s]+$/.test(url))throw Error('Enter a valid turn: or turns: URL.');iceServers.push({urls:url,username:$('turn-user').value,credential:$('turn-pass').value});}
 if($('relay').checked&&!url)throw Error('Enter TURN details before forcing relay.');
 return {iceServers,iceTransportPolicy:$('relay').checked?'relay':'all',iceCandidatePoolSize:0};
}
export async function encode(description,log=()=>{}){
 const plain=JSON.stringify({type:description.type,sdp:description.sdp}),fallback=()=>{log('compression-fallback');return 'AW1.'+btoa(plain);};
 if(typeof CompressionStream==='undefined')return fallback();
 let timer;try{return await Promise.race([(async()=>{const bytes=new Uint8Array(await new Response(new Blob([plain]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());let raw='';for(const b of bytes)raw+=String.fromCharCode(b);return 'AW2.'+btoa(raw).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');})(),new Promise(resolve=>{timer=setTimeout(()=>resolve(fallback()),2500);})]);}catch(e){log('compression-error',{name:e.name});return fallback();}finally{clearTimeout(timer);}
}
export async function decode(text,expected){const code=text.replace(/\s/g,'');if(code.length>150000)throw Error('Connection code is too large.');let data;try{if(code.startsWith('AW1.'))data=JSON.parse(atob(code.slice(4)));else if(code.startsWith('AW2.')){if(typeof DecompressionStream==='undefined')throw Error('This browser needs an update to read compressed codes.');const raw=atob(code.slice(4).replaceAll('-','+').replaceAll('_','/')),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)),reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();let total=0,parts=[];try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>150000){await reader.cancel();throw Error('Decoded code too large.');}parts.push(value);}}finally{reader.releaseLock();}data=JSON.parse(await new Blob(parts).text());}else throw Error('Paste the full code, including the AW2. or AW1. prefix.');}catch(e){if(e.message.includes('browser')||e.message.includes('prefix'))throw e;throw Error('Incomplete or damaged code. Copy and paste it again.');}if(!data||data.type!==expected||typeof data.sdp!=='string'||!data.sdp.startsWith('v=0'))throw Error(expected==='offer'?'Paste the receiver code on this sending device.':'Paste the sender reply on this receiving device.');return {type:data.type,sdp:data.sdp};}
export function gather(pc,log=()=>{},timeout=15000){
 return new Promise((resolve,reject)=>{
 let timer,poll,finished=false,lastCount=0,lastChange=Date.now();const started=Date.now();
 const snapshot=()=>{const candidates=pc.localDescription?.sdp.match(/^a=candidate:.*$/gm)||[];return {count:candidates.length,external:candidates.some(c=>/ typ (srflx|relay)( |\r?$)/.test(c))};};
 const finish=(partial,reason)=>{if(finished)return;finished=true;clearTimeout(timer);clearInterval(poll);pc.removeEventListener('icegatheringstatechange',change);const {count}=snapshot();log('gather-finished',{partial,reason,candidateCount:count,elapsedMs:Date.now()-started});if(!count)reject(Error('No network routes found. Try Chrome, disable VPN, or enable STUN / configure TURN, then Reset and retry.'));else resolve({partial,reason});};
 const change=()=>{if(pc.iceGatheringState==='complete')finish(false,'complete');};
 pc.addEventListener('icegatheringstatechange',change);
 poll=setInterval(()=>{const {count,external}=snapshot(),now=Date.now();if(count!==lastCount){lastCount=count;lastChange=now;}
 if(count&&now-lastChange>=1200&&(external||now-started>=4000))finish(true,external?'external-routes-ready':'local-routes-ready');},200);
 timer=setTimeout(()=>finish(true,'timeout'),timeout);change();
 });
}
