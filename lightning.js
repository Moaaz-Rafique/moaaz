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
} from "three/tsl";
import * as THREE from "three/webgpu";

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

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
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
const bloomFilter = bloom(scenePassColor);
postProcessing.outputNode = scenePassColor
  .add(bloomFilter.mul(0.5))
  .mul(film(bloomFilter));

// postProcessing.outputNode = bloomFilter;

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
const planeMat = new THREE.MeshStandardNodeMaterial({
  side: THREE.DoubleSide,
  transparent: true,
});

// Animated grayscale pulse with per-instance phase
const SPEED = 10.0;
const BURST_DELAY = 0.05;

const phase = float(instanceIndex.mul(12.9898));

const pulse = time.mul(SPEED).add(phase).mul(BURST_DELAY).mod(1);

const offset = pulse;

planeMat.colorNode = mix(color(0xbbffff), color("cyan"), offset.mul(3));

const animatedUV = uv().add(vec2(0, 0));

const tex = texture(dist, animatedUV);
planeMat.opacityNode = tex
  .abs()
  .sub(mx_noise_float(uv().mul(10).add(phase).add(time)).abs().mul(0.5))
  .sub(0.4)
  .greaterThan(offset);

planeMat.blending = THREE.AdditiveBlending;

// ======================================================
// LOAD MODEL
// ======================================================

const gltfLoader = new GLTFLoader();

gltfLoader.load(url, (gltf) => {
  let sourceMesh = null;

  gltf.scene.traverse((obj) => {
    if (obj.isMesh && !sourceMesh) sourceMesh = obj;
  });

  if (!sourceMesh) return;

  const instanced = new THREE.InstancedMesh(
    sourceMesh.geometry,
    // new THREE.MeshBasicMaterial({ side: 2 }),
    planeMat,
    N,
  );

  scene.add(instanced);

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);

  // --------------------------------------------------
  // ATTRIBUTES (SAFE FOR WEBGPU)
  // --------------------------------------------------

  const instancePos = new Float32Array(N * 3);
  const instanceQuat = new Float32Array(N * 4);

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
    // const scale
    // dummy.scale.set(1, 1, 1).multiplyScalar(.5);

    dummy.updateMatrix();

    instanced.setMatrixAt(i, dummy.matrix);

    // store position
    instancePos[i * 3 + 0] = position.x;
    instancePos[i * 3 + 1] = position.y;
    instancePos[i * 3 + 2] = position.z;

    // store quaternion
    instanceQuat[i * 4 + 0] = quat.x;
    instanceQuat[i * 4 + 1] = quat.y;
    instanceQuat[i * 4 + 2] = quat.z;
    instanceQuat[i * 4 + 3] = quat.w;
  }

  instanced.instanceMatrix.needsUpdate = true;

  // attach attributes
  instanced.geometry.setAttribute(
    "iPos",
    new THREE.InstancedBufferAttribute(instancePos, 3),
  );

  instanced.geometry.setAttribute(
    "iQuat",
    new THREE.InstancedBufferAttribute(instanceQuat, 4),
  );
});
const orbit = new OrbitControls(camera, renderer.domElement);

orbit.update();
const tick = () => {
  orbit.enablePan = true;
  postProcessing.render();
  // renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
