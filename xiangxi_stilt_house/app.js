import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
const Hands = window.Hands;

const $ = id => document.getElementById(id);
const sceneHost = $('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#11120f');
scene.fog = new THREE.FogExp2('#11120f', 0.035);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(7.4, 5.1, 9.8);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
sceneHost.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .06; controls.minDistance = 5; controls.maxDistance = 17; controls.maxPolarAngle = Math.PI * .48;
scene.add(new THREE.HemisphereLight(0xffe6bd, 0x29251c, 2.0));
const key = new THREE.DirectionalLight(0xffd9a0, 3.1); key.position.set(5,9,6); key.castShadow=true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const fill = new THREE.PointLight(0xc78e4b, 65, 18); fill.position.set(-5,4,1); scene.add(fill);
const rim = new THREE.DirectionalLight(0x8a9b9a, 1.8); rim.position.set(-4,5,-7); scene.add(rim);

const wood = new THREE.MeshStandardMaterial({color:'#74482a', roughness:.75});
const woodLight = new THREE.MeshStandardMaterial({color:'#a87543', roughness:.68});
const woodDark = new THREE.MeshStandardMaterial({color:'#35251b', roughness:.82});
const roofMat = new THREE.MeshStandardMaterial({color:'#272a25', roughness:.88});
const goldMat = new THREE.MeshStandardMaterial({color:'#c49a56', metalness:.22, roughness:.5});
const wallMat = new THREE.MeshStandardMaterial({color:'#593c29', roughness:.95});
const floorMat = new THREE.MeshStandardMaterial({color:'#3c2c20', roughness:.9});
const models = [];
let activeModel = 0;
const makeBox = (parent, w,h,d, mat, x,y,z, rotY=0) => {const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=rotY;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
function beam(parent,a,b,r,mat){const va=new THREE.Vector3(...a), vb=new THREE.Vector3(...b), diff=vb.clone().sub(va);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,diff.length(),8),mat);m.position.copy(va.add(vb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());m.castShadow=true;parent.add(m);return m;}
function roof(parent, cx, y, cz, w, d, rise, mat){
  const shape=new THREE.Shape(); shape.moveTo(-w/2,0);shape.lineTo(0,rise);shape.lineTo(w/2,0);shape.lineTo(w/2,-.12);shape.lineTo(-w/2,-.12);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.05,bevelThickness:.04});
  const m=new THREE.Mesh(geo,mat);m.rotation.y=Math.PI/2;m.position.set(cx,y,cz+d/2);m.castShadow=true;m.receiveShadow=true;parent.add(m);
  // layered eaves / roof ridge
  beam(parent,[cx-w/2,y+.03,cz],[cx+w/2,y+.03,cz],.055,goldMat);
  return m;
}
function createStiltHouse(){
 const g=new THREE.Group();
 // stone plinth and tall stilts
 makeBox(g,4.7,.22,3.5,woodDark,0,.28,0);
 for(let x of [-1.8,-.6,.6,1.8]) for(let z of [-1.25,1.25]) makeBox(g,.16,1.35,.16,woodLight,x,.94,z);
 // undercroft rails and diagonal braces
 for(let z of [-1.25,1.25]){makeBox(g,4.2,.13,.13,wood,-0,1.22,z);for(let x of [-1.5,-.3,.9,1.65])beam(g,[x, .35,z],[x+.48,1.2,z],.055,woodLight);}
 makeBox(g,4.4,.18,3.1,floorMat,0,1.7,0);
 // walls and timber frame
 makeBox(g,3.95,1.48,.14,wallMat,0,2.48,-1.35);makeBox(g,3.95,1.48,.14,wallMat,0,2.48,1.35);
 makeBox(g,.14,1.48,2.6,wallMat,-1.98,2.48,0);makeBox(g,.14,1.48,2.6,wallMat,1.98,2.48,0);
 for(let y of [1.78,3.16]) for(let z of [-1.43,1.43]) makeBox(g,4.25,.1,.1,woodLight,0,y,z);
 for(let x of [-1.9,-.95,0,.95,1.9]) for(let z of [-1.4,1.4]) makeBox(g,.11,1.45,.11,woodLight,x,2.48,z);
 // front windows
 for(let x of [-1.05,.25,1.15]){makeBox(g,.65,.56,.08,woodDark,x,2.65,1.445);for(let i=0;i<5;i++)makeBox(g,.035,.5,.035,goldMat,x-.24+i*.12,2.65,1.5);makeBox(g,.62,.04,.04,woodLight,x,2.65,1.51);}
 // upper floor and roof
 makeBox(g,4.65,.18,3.65,woodDark,0,3.3,0);
 // pitched roof surfaces as two slanted slabs
 const left=makeBox(g,2.65,.16,4.15,roofMat,-.72,4.08,0, -.42);
 const right=makeBox(g,2.65,.16,4.15,roofMat,.72,4.08,0, .42);
 beam(g,[-1.98,3.48,-1.75],[1.98,3.48,-1.75],.07,woodLight);
 beam(g,[-1.98,3.48,1.75],[1.98,3.48,1.75],.07,woodLight);
 beam(g,[0,4.95,-2],[0,4.95,2],.09,goldMat);
 // roof rafters
 for(let z=-1.8;z<=1.81;z+=.45){beam(g,[-2,3.55,z],[0,4.95,z],.035,woodLight);beam(g,[0,4.95,z],[2,3.55,z],.035,woodLight);}
 // balcony rail
 for(let z of [-1.75,1.75]){makeBox(g,4.6,.1,.1,woodLight,0,2.1,z);for(let x=-2.1;x<=2.11;x+=.35)makeBox(g,.055,.48,.055,woodLight,x,1.88,z);}
 // door
 makeBox(g,.72,1.25,.09,woodDark,-.55,2.4,1.46);makeBox(g,.05,.05,.035,goldMat,-.28,2.4,1.52);
 return g;
}
function createDougong(){
 const g=new THREE.Group();
 makeBox(g,4,.22,3.3,woodDark,0,.15,0);
 for(let x of [-1.4,0,1.4]) makeBox(g,.22,2.0,.22,woodLight,x,1.15,0);
 makeBox(g,4,.18,3.2,wood,0,2.2,0);
 for(let x of [-1.5,-.5,.5,1.5]){makeBox(g,.95,.12,.65,goldMat,x,2.38,0);makeBox(g,.18,.52,.55,woodLight,x,2.68,0);makeBox(g,1.12,.12,.72,wood,x,2.95,0);makeBox(g,.18,.34,.48,woodLight,x,3.17,0);makeBox(g,1.28,.12,.8,goldMat,x,3.39,0);}
 makeBox(g,4.5,.18,3.5,roofMat,0,3.65,0);
 for(let x of [-1.9,-1.2,-.5,.5,1.2,1.9]) beam(g,[x,3.4,-1.55],[x*.65,4.05,0],.04,woodLight);
 beam(g,[-2.2,4.05,0],[2.2,4.05,0],.07,goldMat);
 return g;
}
function createWindow(){
 const g=new THREE.Group();makeBox(g,3.8,.14,.28,woodDark,0,-1.55,0);
 // ornate lattice window in a timber frame
 for(let x of [-1.35,1.35])makeBox(g,.13,3.1,.18,woodLight,x,0,0);
 for(let y of [-1.5,1.5])makeBox(g,2.8,.13,.18,woodLight,0,y,0);
 for(let x=-1.1;x<=1.11;x+=.36)makeBox(g,.055,2.8,.12,goldMat,x,0,.02);
 for(let y=-1.15;y<=1.16;y+=.38)makeBox(g,2.6,.055,.12,woodLight,0,y,.02);
 // diamond lattice overlays
 for(let x=-.9;x<=.91;x+=.6){beam(g,[x-.35,-1.15,.11],[x+.35,-.45,.11],.025,goldMat);beam(g,[x-.35,.45,.11],[x+.35,1.15,.11],.025,goldMat);}
 const med=new THREE.MeshStandardMaterial({color:'#9b7041',roughness:.7,transparent:true,opacity:.3});
 makeBox(g,2.55,2.6,.04,med,0,0,-.12);
 return g;
}
models.push(createStiltHouse(),createDougong(),createWindow());
const modelInfo=[
 {title:'湘西吊脚楼',name:'吊脚楼',desc:'依山而建 · 临水而居 · 木构之美'},
 {title:'传统斗拱结构',name:'斗拱',desc:'层层出挑 · 榫卯相承 · 力学与美学'},
 {title:'中式木格花窗',name:'花窗',desc:'疏影横斜 · 格心有序 · 东方窗棂美学'}
];
models.forEach((m,i)=>{m.visible=i===0;scene.add(m);});
const ground=new THREE.Mesh(new THREE.CircleGeometry(12,80),new THREE.MeshStandardMaterial({color:'#151612',roughness:1,metalness:0}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);
const grid=new THREE.GridHelper(20,40,0x55452b,0x29271f);grid.position.y=.005;grid.material.transparent=true;grid.material.opacity=.18;scene.add(grid);
// subtle floating gold particles
const particleCount=750, positions=new Float32Array(particleCount*3), speeds=[];
for(let i=0;i<particleCount;i++){positions[i*3]=(Math.random()-.5)*13;positions[i*3+1]=Math.random()*7;positions[i*3+2]=(Math.random()-.5)*10;speeds.push(.001+Math.random()*.006);}
const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const pMat=new THREE.PointsMaterial({color:0xd6b16e,size:.025,transparent:true,opacity:.65,depthWrite:false});
const particles=new THREE.Points(pGeo,pMat);scene.add(particles);
let flash=0;
function resize(){const w=sceneHost.clientWidth,h=sceneHost.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
window.addEventListener('resize',resize);resize();
function animate(){requestAnimationFrame(animate);controls.update();particles.rotation.y+=.00035;
 const a=pGeo.attributes.position.array;for(let i=0;i<particleCount;i++){a[i*3+1]+=(speeds[i]);if(a[i*3+1]>7)a[i*3+1]=0;}pGeo.attributes.position.needsUpdate=true;
 if(flash>0){flash=Math.max(0,flash-.035);renderer.toneMappingExposure=1.15+Math.sin(flash*Math.PI)*.35;}else renderer.toneMappingExposure=1.15;
 renderer.render(scene,camera);}
animate();

function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),1500);}
function switchModel(dir){activeModel=(activeModel+dir+models.length)%models.length;models.forEach((m,i)=>m.visible=i===activeModel);const info=modelInfo[activeModel];$('modelIndex').innerHTML=`0${activeModel+1}<span>/03</span>`;$('modelName').textContent=info.name;$('sceneNumber').textContent=`0${activeModel+1}`;$('sceneTitle').textContent=info.title;$('sceneDescription').textContent=info.desc;combo++;$('combo').textContent=String(combo).padStart(2,'0');showToast(`已切换：${info.name}`);}
function resetModel(){controls.reset();camera.position.set(7.4,5.1,9.8);controls.target.set(0,2,0);controls.update();flash=1;combo++;$('combo').textContent=String(combo).padStart(2,'0');showToast('模型已重置 · 金色闪光反馈');}
$('resetButton').addEventListener('click',resetModel);
let dragX=null;
renderer.domElement.addEventListener('pointerdown',e=>dragX=e.clientX);
renderer.domElement.addEventListener('pointerup',e=>{if(dragX!==null){const dx=e.clientX-dragX;if(Math.abs(dx)>90)switchModel(dx<0?1:-1);dragX=null;}});
renderer.domElement.addEventListener('wheel',()=>{}, {passive:true});

// Background ambience is synthesized locally using Web Audio, no music file required.
let audioCtx=null, musicOn=false, osc1=null, osc2=null, master=null, lfo=null;
function toggleMusic(){if(!musicOn){audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=.035;master.connect(audioCtx.destination);
 osc1=audioCtx.createOscillator();osc2=audioCtx.createOscillator();const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=500;osc1.type='sine';osc1.frequency.value=110;osc2.type='sine';osc2.frequency.value=164.81;const g1=audioCtx.createGain();g1.gain.value=.7;const g2=audioCtx.createGain();g2.gain.value=.3;osc1.connect(g1).connect(filter);osc2.connect(g2).connect(filter);filter.connect(master);osc1.start();osc2.start();musicOn=true;
 }else{osc1?.stop();osc2?.stop();audioCtx?.close();musicOn=false;}
 $('musicToggle').classList.toggle('on',musicOn);$('musicState').textContent=musicOn?'背景音乐已开启':'背景音乐已关闭';}
$('musicButton').addEventListener('click',toggleMusic);

// MediaPipe hand landmarks; camera access only starts after an explicit click.
let hands=null, cameraStream=null, running=false, combo=0, lastSwipe=0, lastFist=0, lastGesture='';
let prevPalmX=null, palmStartX=null, palmStartTime=0, lastRotateX=null;
function fingersUp(lm){return [[8,6],[12,10],[16,14],[20,18]].map(([tip,pip])=>lm[tip].y<lm[pip].y);}
function detectGesture(lm){
 const up=fingersUp(lm);const thumb=lm[4].x>lm[3].x?Math.abs(lm[4].x-lm[2].x)>.055:Math.abs(lm[4].x-lm[2].x)>.055;
 const count=up.filter(Boolean).length;const fist=count===0 && lm[8].y>lm[6].y && lm[12].y>lm[10].y;
 return {open:count>=4&&thumb,fist};
}
function drawHand(lm){const canvas=$('cameraOverlay'),ctx=canvas.getContext('2d');const video=$('camera');canvas.width=video.videoWidth||640;canvas.height=video.videoHeight||480;ctx.clearRect(0,0,canvas.width,canvas.height);if(!lm)return;const links=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];ctx.strokeStyle='#e3c27d';ctx.lineWidth=2;links.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(lm[a].x*canvas.width,lm[a].y*canvas.height);ctx.lineTo(lm[b].x*canvas.width,lm[b].y*canvas.height);ctx.stroke();});ctx.fillStyle='#f3d89d';lm.forEach(p=>{ctx.beginPath();ctx.arc(p.x*canvas.width,p.y*canvas.height,3,0,Math.PI*2);ctx.fill();});}
async function startCamera(){
 if(running)return;
 try{
  $('cameraButton').textContent='正在启动…';cameraStream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480},audio:false});$('camera').srcObject=cameraStream;await $('camera').play();
  $('cameraPlaceholder').style.display='none';$('cameraStatus').textContent='CAMERA ONLINE';$('stageStatus').textContent='手势识别运行中';
  hands=new Hands({locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.65,minTrackingConfidence:.6});hands.onResults(onResults);
  running=true;$('cameraButton').textContent='停止手势识别';$('cameraButton').onclick=stopCamera;processFrame();
 }catch(err){console.error(err);$('cameraButton').textContent='启动失败，请检查权限';$('cameraStatus').textContent='CAMERA ERROR';showToast('无法访问摄像头：请使用 localhost 并允许权限');}
}
function stopCamera(){running=false;if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;$('camera').srcObject=null;$('cameraPlaceholder').style.display='flex';$('cameraStatus').textContent='CAMERA OFFLINE';$('stageStatus').textContent='交互待启动';$('cameraButton').textContent='启动手势识别';$('cameraButton').onclick=startCamera;$('cameraOverlay').getContext('2d').clearRect(0,0,$('cameraOverlay').width,$('cameraOverlay').height);}
async function processFrame(){if(!running)return;try{if($('camera').readyState>=2)await hands.send({image:$('camera')});}catch(e){console.warn(e);}if(running)requestAnimationFrame(processFrame);}
function onResults(results){
 const lm=results.multiHandLandmarks?.[0];drawHand(lm);if(!lm){prevPalmX=null;lastGesture='';return;}
 const g=detectGesture(lm);const x=lm[9].x;const now=Date.now();
 if(g.fist){if(lastGesture!=='fist'&&now-lastFist>1400){resetModel();lastFist=now;}lastGesture='fist';prevPalmX=null;return;}
 if(g.open){
  if(prevPalmX!==null){const dx=x-prevPalmX;if(Math.abs(dx)>.003){models[activeModel].rotation.y+=dx*4.5;}}
  // A fast palm movement across the frame switches exhibits; slow movement rotates.
  if(prevPalmX!==null&&Math.abs(x-prevPalmX)>.19&&now-lastSwipe>1000){switchModel(x<prevPalmX?1:-1);lastSwipe=now;}
  prevPalmX=x;lastGesture='open';
 }else{prevPalmX=null;lastGesture='other';}
}
$('cameraButton').addEventListener('click',startCamera);
