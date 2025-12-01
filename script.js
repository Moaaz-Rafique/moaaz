import * as THREE from "three/webgpu";

import { gsap } from "gsap";
import { pass } from "three/tsl";
import { sobel } from "three/examples/jsm/tsl/display/SobelOperatorNode.js";
import { dotScreen } from "three/examples/jsm/tsl/display/DotScreenNode.js";
import { film } from "three/examples/jsm/tsl/display/FilmNode.js";
import { mix } from "three/tsl";
import { Fn } from "three/tsl";
import { vec4 } from "three/tsl";
import { vec3 } from "three/tsl";
import { positionLocal } from "three/tsl";
import { mx_noise_float } from "three/tsl";
import { float } from "three/tsl";
import { abs } from "three/tsl";

import { uniform } from "three/tsl";
import { time } from "three/tsl";

import { smoothstepElement } from "three/tsl";
import { mod } from "three/tsl";
import { floor } from "three/tsl";
import { If } from "three/tsl";
import { int } from "three/tsl";
import { Vector2 } from "three/src/Three.Core.js";

const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const objectsDistance = 4;

// Material
const material = new THREE.MeshMatcapMaterial({ color: "#ffeded" });
const material1 = new THREE.MeshMatcapMaterial({ color: "#734ef2" });
const material2 = new THREE.MeshMatcapMaterial({ color: "#ef258d" });
// Meshes
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 32, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material1);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 32),
  material2
);

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = -objectsDistance * 1;
mesh3.position.y = -objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

const sectionMeshes = [mesh1, mesh2, mesh3];

scene.add(mesh1, mesh2, mesh3);

/**
 * Particles
 */
// Geometry
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: "#ffeded",
  sizeAttenuation: true,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Lights
 */
const hemi = new THREE.HemisphereLight("green", "blue", 2);
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
  100
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

const postProcessing = new THREE.PostProcessing(renderer);
const scenePass = pass(scene, camera);
const scenePassColor = scenePass.getTextureNode();
postProcessing.outputNode = scenePassColor.mul(film(scenePassColor));

const effectTime = uniform(0);
const isF1 = uniform(0);
const texelOne = dotScreen(scenePassColor, new Vector2(2, 1), 0.5);
const texelTwo = sobel(scenePassColor);

const transition = Fn(() => {
  const f1 = mx_noise_float(vec3(positionLocal.xy.mul(5), effectTime));
  const f2 = positionLocal.y;

  const tInput = vec4().toVar();
  If(isF1.equal(int(1)), () => {
    tInput.assign(f1);
  }).Else(() => {
    tInput.assign(f2);
  });

  const t = smoothstepElement(tInput, effectTime.add(-1), effectTime.add(1));

  const color = mix(texelTwo, texelOne, t);
  return color;
});

// postProcessing.outputNode = transition();
postProcessing.outputNode = scenePassColor.mul(transition());
/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;
const scrollHandler = () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    // const effect =
    //   currentSection - newSection > 0
    //     ? dotScreen(scenePassColor)
    //     : sobel(scenePassColor);

    // postProcessing.outputNode = scenePassColor.mul(effect);
    // postProcessing.needsUpdate = true;
    // console.log(effect);

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
    });
  }
  currentSection = newSection;
};
window.addEventListener("scroll", scrollHandler);
// scrollHandler();

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
let cycles = 0;
let prevCycle = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  effectTime.value = Math.cos(elapsedTime) * 2.5;
  if (prevCycle !== Math.sign(Math.sin(elapsedTime))) {
    cycles++;
    prevCycle = Math.sign(Math.sin(elapsedTime));
  }
  isF1.value = Math.floor(cycles / 2) % 2;

  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Render
  //   renderer.render(scene, camera);
  postProcessing.render();
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
tick();
