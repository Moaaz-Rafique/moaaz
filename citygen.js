import * as THREE from "three/webgpu";

import { OrbitControls } from "three/examples/jsm/Addons.js";

let camera, scene, renderer, postProcessing, orbit, control;

init();

async function init() {
  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 10, 30);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  renderer = new THREE.WebGPURenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

 
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 7, 0);
  orbit.enablePan = true;
  orbit.minDistance = 1;
  orbit.maxDistance = 100;
  orbit.update();
  const wallGeometry = new THREE.PlaneGeometry(1, 1);
  const whiteMaterial = new THREE.MeshPhysicalMaterial({
    color: "#fff",
    side: 2,
  });
  const floor = new THREE.Mesh(wallGeometry, whiteMaterial);
  floor.scale.set(20, 20, 1);
  floor.rotation.x = Math.PI * -0.5;
  floor.receiveShadow = true;
  scene.add(floor);

  const pointLight = new THREE.PointLight("#ffffff", 100);
  pointLight.position.set(0, 13, 0);
  pointLight.distance = 100;
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.shadow.bias = -0.0025;
  scene.add(pointLight);

  // Helper for visualization
  const pointLightHelper = new THREE.PointLightHelper(
    pointLight,
    0.5,
    "#ffcc00"
  );
  scene.add(pointLightHelper);

  // Ambient light
  const ambientLight = new THREE.AmbientLight("#0c0c0c");
  scene.add(ambientLight);



  



  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

function animate() {
  renderer.render(scene, camera);
}
