import { OrbitControls } from "three/examples/jsm/Addons.js";
import {
  color,
  float,
  mix,
  positionLocal,
  sin,
  texture,
  time,
  uv,
  vec2,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";

const canvas = document.querySelector("canvas.webgl");

/**
 * Scene
 */
const scene = new THREE.Scene();

scene.add(new THREE.AmbientLight("white", 2));

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
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100,
);

camera.position.set(0, 0, 10);

/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
  canvas,
  antialias: true,
  alpha: true,
});

await renderer.init();

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Controls
 */
const orbit = new OrbitControls(camera, renderer.domElement);

/**
 * IMPORTANT:
 * You cannot automatically read local folders in browser JS.
 * You need a manifest array.
 */
const thumbnails = [
  {
    thumb: "./images/thumbnails1/animatedTorus.png",
    full: "./images/animatedTorus.png",
  },
  {
    thumb: "./images/thumbnails/clay_effect.png",
    full: "./images/clay_effect.png",
  },
  {
    thumb: "./images/thumbnails/fortune_teller.png",
    full: "./images/fortune_teller.png",
  },
  {
    thumb: "./images/thumbnails/model_animation.png",
    full: "./images/model_animation.png",
  },
  {
    thumb: "./images/thumbnails/ohana_development.png",
    full: "./images/ohana_development.png",
  },
  {
    thumb: "./images/thumbnails/process_animation.png",
    full: "./images/process_animation.png",
  },
  {
    thumb: "./images/thumbnails/scroll_tsl_transition.png",
    full: "./images/scroll_tsl_transition.png",
  },
  {
    thumb: "./images/thumbnails/sphere_depth.png",
    full: "./images/sphere_depth.png",
  },
  { thumb: "./images/thumbnails/ssgi.png", full: "./images/ssgi.png" },
  {
    thumb: "./images/thumbnails/tron_racer.png",
    full: "./images/tron_racer.png",
  },
  { thumb: "./images/thumbnails/walking.png", full: "./images/walking.png" },
  { thumb: "./images/thumbnails/worley3.png", full: "./images/worley3.png" },
  {
    thumb: "./images/thumbnails/light_rays.jpg",
    full: "./images/light_rays.jpg",
  },
  {
    thumb: "./images/thumbnails/particle_cpp.jpg",
    full: "./images/particle_cpp.jpg",
  },
];

const textureLoader = new THREE.TextureLoader();
const th = textureLoader.load(thumbnails[0].thumb);
const fu = textureLoader.load(thumbnails[0].full);
const planeMat1 = new THREE.MeshBasicNodeMaterial({
  side: 2,
  map: fu,
  transparent: true,
  opacity: 0.1,
});
const aspect = 600 / 400;
const aspect2 = 180 / 320;
const height = 1.5;
const width = height * aspect;
const plane1 = new THREE.Mesh(
  new THREE.PlaneGeometry(width, height),
  planeMat1,
);
// scene.add(plane1);

const planeMat = new THREE.MeshBasicNodeMaterial({
  side: 2,
  map: th,
  transparent: true,
});
const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), planeMat);
scene.add(plane);
const t = sin(time.mul(0.5)).mul(0.5).add(0.5);

const uvNode = uv();
const a = mix(float(aspect2), float(aspect), 0);

const full = texture(fu, uvNode);
const updatedUV = uvNode.sub(0.5).mul(vec2(3, 1.1)).add(0.5);
const inside = updatedUV.x
  .greaterThanEqual(0)
  .and(updatedUV.x.lessThanEqual(1))
  .and(updatedUV.y.greaterThanEqual(0))
  .and(updatedUV.y.lessThanEqual(1));
const thumb = texture(th, updatedUV);
const thumbCropped = mix(vec4(0, 0, 0, 0), thumb, inside);
const tex = mix(thumbCropped, full, t);
planeMat.colorNode = tex

const tick = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
