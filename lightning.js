import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";

import { film } from "three/examples/jsm/tsl/display/FilmNode.js";
import { smoothstep } from "three/src/math/MathUtils.js";
import { texture } from "three/src/nodes/accessors/TextureNode.js";
import { instanceIndex } from "three/src/nodes/core/IndexNode.js";
import { length } from "three/src/nodes/math/MathNode.js";
import { mix } from "three/src/nodes/math/MathNode.js";
import { cos } from "three/src/nodes/math/MathNode.js";
import { vec2 } from "three/src/nodes/tsl/TSLCore.js";
import { color } from "three/src/nodes/tsl/TSLCore.js";
import {
  pass,
  time,
  positionLocal,
  vec3,
  uv,
  float,
  sin,
  positionWorld,
  instancedArray,
  attribute,
  mat4,
  mx_noise_float,
  max,
  min,
  vec4,
  select,
  step,
} from "three/tsl";
import * as THREE from "three/webgpu";

THREE.Node.captureStackTrace = true;

const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const hemi = new THREE.AmbientLight("white", 2);
scene.add(hemi);
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.z = 10;

const renderer = new THREE.WebGPURenderer({
  canvas: canvas,
  alpha: true,
});
await renderer.init();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const postProcessing = new THREE.RenderPipeline(renderer);
const scenePass = pass(scene, camera);
const scenePassColor = scenePass.getTextureNode();
const bloomFilter = bloom(scenePassColor, 1.2, 0.1, 0.135);
postProcessing.outputNode = scenePassColor
  .add(bloomFilter)
  .mul(film(bloomFilter, 0.25));

const N = 100;
const radius = 2;
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(radius, 100, 100),
  new THREE.MeshStandardMaterial({ color: "gray" }),
);
scene.add(sphere);

const url = "/models/lightning.glb";
const loader = new THREE.TextureLoader();
const dist = loader.load("/images/dist.png");

const gltfLoader = new GLTFLoader();

gltfLoader.load(url, (gltf) => {
  const planeMat = new THREE.MeshStandardNodeMaterial({
    side: THREE.DoubleSide,
    transparent: true,
  });
  const SPEED = 10.0;
  const BURST_DELAY = 0.05;

  const phase = instanceIndex.mul(12.9898);
  const pulse = time.mul(SPEED).add(phase).mul(BURST_DELAY).mod(1.0);
  const offset = float(pulse);
  let finalColor = vec4(float(1).sub(offset.mul(3)), 1, 1, 1);

  planeMat.colorNode = finalColor;

  const animatedUV = uv();
  const texVal = texture(dist, animatedUV).x;
  const noiseVal = mx_noise_float(uv().mul(10.0).add(phase).add(time))
    .abs()
    .mul(0.5);
  const mask = texVal.sub(noiseVal).sub(offset);
  planeMat.opacityNode = step(0.4, mask);
  planeMat.blending = THREE.AdditiveBlending;

  let sourceMesh = null;

  gltf.scene.traverse((obj) => {
    if (obj.isMesh && !sourceMesh) sourceMesh = obj;
  });

  if (!sourceMesh) return;

  const instanced = new THREE.InstancedMesh(sourceMesh.geometry, planeMat, N);

  scene.add(instanced);

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i < N; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const position = new THREE.Vector3(x, y, z);
    const normal = position.clone().normalize();
    const align = new THREE.Quaternion().setFromUnitVectors(up, normal);
    const twist = new THREE.Quaternion().setFromAxisAngle(
      normal,
      Math.random() * Math.PI * 2,
    );
    const quat = new THREE.Quaternion().copy(twist).multiply(align);

    dummy.position.copy(position);
    dummy.quaternion.copy(quat);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
  }

  instanced.instanceMatrix.needsUpdate = true;
});
const orbit = new OrbitControls(camera, renderer.domElement);

orbit.update();
const tick = () => {
  postProcessing.render();
  window.requestAnimationFrame(tick);
};
tick();
