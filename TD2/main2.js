
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('renderCanvas');
  if (!canvas) { console.error('Canvas #renderCanvas introuvable.'); return; }

  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.043, 0.055, 0.078, 1); // #0b0e14

  const orbit = new BABYLON.ArcRotateCamera('cam', -Math.PI/2, Math.PI/3, 8, BABYLON.Vector3.Zero(), scene);
  orbit.attachControl(canvas, true);
  let gyroCam = null; 

  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.9;

  const box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, scene);
  box.position.y = 1;

  const mat = new BABYLON.StandardMaterial('mat', scene);
  mat.diffuseTexture = new BABYLON.Texture('https://assets.babylonjs.com/environments/ground.jpg', scene);
  mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  box.material = mat;

  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 30 }, scene);
  const gmat = new BABYLON.StandardMaterial('gmat', scene);
  gmat.diffuseColor = new BABYLON.Color3(0.06, 0.08, 0.12);
  ground.material = gmat;


  scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;
    box.rotation.y += 0.8 * dt;
    box.rotation.x += 0.3 * dt;
  });

  async function enableGyro() {
    try {
    
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        const state = await DeviceOrientationEvent.requestPermission();
        if (state !== 'granted') { alert('Permission gyroscope refusée'); return; }
      }
     
      if (!gyroCam) {
        gyroCam = new BABYLON.DeviceOrientationCamera('gyro', new BABYLON.Vector3(0, 1.5, -5), scene);
        gyroCam.setTarget(BABYLON.Vector3.Zero());
      }
      scene.activeCamera = gyroCam;
      gyroCam.attachControl(canvas, true);
    } catch (e) {
      console.warn('DeviceOrientation non disponible ou refusé', e);
      alert("Le gyroscope n'est pas disponible sur cet appareil/navigateur.");
    }
  }

  function backToOrbit() {
    if (gyroCam) gyroCam.detachControl();
    scene.activeCamera = orbit;
    orbit.attachControl(canvas, true);
  }


  const gyroBtn = document.getElementById('gyroBtn');
  const orbitBtn = document.getElementById('orbitBtn');
  if (gyroBtn) gyroBtn.addEventListener('click', enableGyro);
  if (orbitBtn) orbitBtn.addEventListener('click', backToOrbit);


  engine.runRenderLoop(() => scene.render());
  window.addEventListener('resize', () => engine.resize());
})

const MODEL_PATH = "models/";
const MODEL_FILE = "fatalis.glb";


const fatalisRoot = new BABYLON.TransformNode("fatalisRoot", scene);

BABYLON.SceneLoader.Append(MODEL_PATH, MODEL_FILE, scene, function () {

  const last = scene.meshes[scene.meshes.length - 1];

  scene.meshes.forEach(m => {
    if (m !== last && !m.parent && m.name && m.name !== "ground" && m !== box) {

    }
  });
  last.setParent(fatalisRoot);


  fatalisRoot.position = new BABYLON.Vector3(2.8, 0, 0);  
  fatalisRoot.scaling  = new BABYLON.Vector3(0.02, 0.02, 0.02); 
  fatalisRoot.rotation = new BABYLON.Vector3(0, Math.PI * 0.5, 0);

  console.log("Fatalis chargé :", last?.name, "→ ajuste fatalisRoot.scaling si nécessaire");
}, null, function (_scene, message, exception) {
  console.warn("⚠️ Échec chargement Fatalis :", message || exception);
  console.warn("Vérifie le chemin :", MODEL_PATH + MODEL_FILE);
});

