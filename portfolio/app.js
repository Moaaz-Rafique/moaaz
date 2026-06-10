import { OrbitControls } from "three/examples/jsm/Addons.js";
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
    thumb: "./images/thumbnails/animatedTorus.png",
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

/**
 * Timing
 */
const APPEAR_DELAY = 250; // ms between thumbnails

/**
 * Storage
 */
const imagePlanes = [];
const textureStore = [];
let animationProgress = 0;
let isReady = false;
/**
 * Separate loaders
 */
const thumbManager = new THREE.LoadingManager();
const fullManager = new THREE.LoadingManager();

const textureLoader = new THREE.TextureLoader(thumbManager);
const fullTextureLoader = new THREE.TextureLoader(fullManager);

/**
 * Track completion
 */
let thumbsFinishedLoading = false;

/**
 * When ALL thumbs are loaded
 * start loading full images
 */
thumbManager.onLoad = () => {
  console.log("All thumbnails loaded");

  thumbsFinishedLoading = true;

  loadFullImages();
};

/**
 * Create planes progressively
 */
const startTime = performance.now();
thumbnails.forEach((item, index) => {
  textureLoader.load(item.thumb, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;

    const aspect = texture.image.width / texture.image.height;
    const height = 1.5;
    const width = height * aspect;

    const geometry = new THREE.PlaneGeometry(width, height);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    scene.add(mesh);

    const group = Math.floor(index / 2) + 1;
    const sign = index & 1 ? -1 : 1;

    const prevX = -sign * (group - 1) * 0.1;
    const prevRz = (group - 1) * 0.2 * sign;

    const targetX = -sign * group * 0.1;
    const targetRz = group * 0.2 * sign;
    mesh.position.z = -index * 0.01;
    imagePlanes.push({
      mesh,
      thumbTexture: texture,
      fullPath: item.full,

      // animation states
      prev: {
        x: prevX,
        rz: prevRz,
      },

      target: {
        x: targetX,
        rz: targetRz,
      },
      startTime: performance.now() + index * APPEAR_DELAY,
    });
  });
});

/**
 * Load full resolution textures
 */

function loadFullImages() {
  console.log("Starting full image loading");

  imagePlanes.forEach((item, index) => {
    fullTextureLoader.load(item.fullPath, (fullTexture) => {
      fullTexture.colorSpace = THREE.SRGBColorSpace;

      textureStore[index] = fullTexture;

      console.log(`Stored full texture ${index}:`, item.fullPath);
    });
  });
}

/**
 * Optional:
 * track progress of full image loading
 */
const loader = document.getElementById("loader");
let loadProgress = 0;

fullManager.onProgress = (url, loaded, total) => {
  loadProgress = loaded / total;
};

fullManager.onLoad = () => {
  console.log("All full images loaded", textureStore);
};
/**
 * Tick
 */
const tick = () => {
  orbit.update();

  const now = performance.now();

  if (!isReady) {
    // -----------------------------
    // LOADING / INTRO ANIMATION
    // -----------------------------
    imagePlanes.forEach((item) => {
      const mesh = item.mesh;

      const elapsed = now - item.startTime;
      const t = THREE.MathUtils.clamp(elapsed / 600, 0, 1);

      if (t <= 0) return;

      mesh.visible = true;

      mesh.position.x = THREE.MathUtils.lerp(item.prev.x, item.target.x, t);
      mesh.rotation.z = THREE.MathUtils.lerp(item.prev.rz, item.target.rz, t);
    });

    const finalProgress = Math.min(
      (now - startTime) / (APPEAR_DELAY * thumbnails.length),
      loadProgress,
    );
    if (finalProgress >= 0.95)
      document.getElementById("btn").innerText = "Click to Enter";

    loader.style.setProperty("--p", finalProgress);
  } else {
    // -----------------------------
    // READY STATE (different behavior)
    // -----------------------------

    document.getElementById("btn").innerText = "Ready";

    imagePlanes.forEach((item) => {
      const mesh = item.mesh;

      // example: subtle idle animation instead of intro
      mesh.rotation.z += 0.001;
    });
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
