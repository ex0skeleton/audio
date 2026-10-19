export function encode(description) { return 'AW1.' + btoa(JSON.stringify({type:description.type,sdp:description.sdp})); }
export function decode(text, expected) {
 const value=text.trim(); if(value.length>150000 || !value.startsWith('AW1.')) throw Error('Paste a complete Audio Wiz connection code.');
 let data;try{data=JSON.parse(atob(value.slice(4)));}catch{throw Error('This code is incomplete or damaged. Copy it again.');}
 if(data.type!==expected || typeof data.sdp!=='string' || !data.sdp.startsWith('v=0')) throw Error(`This device needs an ${expected} code. Check Send / Receive on both devices.`);
 return {type:data.type,sdp:data.sdp};
}
export function gather(pc, timeout=30000) {
 if(pc.iceGatheringState==='complete')return Promise.resolve();
 return new Promise((resolve,reject)=>{
 const done=()=>{clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',change);};
 const change=()=>{if(pc.iceGatheringState==='complete'){done();resolve();}};
 const timer=setTimeout(()=>{done();reject(Error('Network discovery timed out. Reset and retry, or try TURN settings.'));},timeout);
 pc.addEventListener('icegatheringstatechange',change);
 });
}
export function configuration() {
 const $=id=>document.getElementById(id),iceServers=[];
 if($('stun').checked)iceServers.push({urls:'stun:stun.l.google.com:19302'});
 const url=$('turn-url').value.trim();
 if(url){if(!/^turns?:[^\s]+$/.test(url))throw Error('Enter a valid turn: or turns: URL.');iceServers.push({urls:url,username:$('turn-user').value,credential:$('turn-pass').value});}
 if($('relay').checked&&!url)throw Error('Enter TURN details before forcing relay.');
 return {iceServers,iceTransportPolicy:$('relay').checked?'relay':'all',iceCandidatePoolSize:0};
}
