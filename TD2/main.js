import * as THREE from 'https://unpkg.com/three@0.180.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e14);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 7);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

const dir = new THREE.DirectionalLight(0xffffff, 1.2); dir.position.set(5, 6, 4);
const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.5);
scene.add(dir, hemi);

const overhead = new THREE.SpotLight(0x99ccff, 1.2, 40, Math.PI / 6, 0.35, 2);
overhead.position.set(0, 9, 0); 
scene.add(overhead);

const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);

const textureLoader = new THREE.TextureLoader();
const lavaTexture = textureLoader.load('https://threejs.org/examples/textures/lava/lavatile.jpg');
lavaTexture.wrapS = THREE.RepeatWrapping;
lavaTexture.wrapT = THREE.RepeatWrapping;
lavaTexture.repeat.set(2, 2); 
const lavaMaterial = new THREE.MeshStandardMaterial({
  map: lavaTexture,
  emissive: 0xff3300,     
  emissiveIntensity: 0.6,
  metalness: 0.2,
  roughness: 0.7
});

const cube = new THREE.Mesh(geometry, lavaMaterial);
scene.add(cube);

const particleCount = 1200;
const area = 40;   
const height = 25; 

const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i*3 + 0] = (Math.random() - 0.5) * area;
  positions[i*3 + 1] = Math.random() * height + 5;   
  positions[i*3 + 2] = (Math.random() - 0.5) * area; 
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const pMat = new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.85 });
const rain = new THREE.Points(pGeo, pMat);
scene.add(rain);


const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta();

  cube.rotation.x += 0.25 * dt;
  cube.rotation.y += 0.5 * dt;

  const arr = pGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const base = i * 3;
    arr[base + 1] -= (5 + Math.random() * 12) * dt;
    if (arr[base + 1] < -2) {
      arr[base + 0] = (Math.random() - 0.5) * area;
      arr[base + 1] = height + Math.random() * 10;
      arr[base + 2] = (Math.random() - 0.5) * area;
    }
  }
  pGeo.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
