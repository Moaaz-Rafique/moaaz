import * as THREE from "three/webgpu";
import { thumbnails, APPEAR_DELAY } from "./config.js";
import {
  float,
  fwidth,
  mix,
  sin,
  smoothstep,
  texture,
  time,
  uniform,
  uv,
  vec2,
  vec4,
} from "three/tsl";

const STATES = {
  LOADING: "LOADING",
  WAITING: "WAITING",
  READY: "READY",
};

export class Gallery {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;

    this.imagePlanes = [];
    this.textureStore = [];
    this.loadProgress = 0;

    this.currentState = STATES.LOADING;
    this.startTime = performance.now();
    this.readyStartTime = 0; // Tracks when the READY state begins

    this.loaderElement = document.getElementById("loader");
    this.btnElement = document.getElementById("btn");

    this.initCSS();
    this.initLoaders();
    this.initEvents();
  }

  // Inject CSS transition so the button smoothly fades away
  initCSS() {
    if (this.btnElement) {
      this.btnElement.style.transition = "opacity 0.6s ease, visibility 0.6s";
    }
    if (this.loaderElement) {
      this.loaderElement.style.transition =
        "opacity 0.6s ease, visibility 0.6s";
    }
  }

  initLoaders() {
    this.thumbManager = new THREE.LoadingManager();
    this.fullManager = new THREE.LoadingManager();

    this.textureLoader = new THREE.TextureLoader(this.thumbManager);
    this.fullTextureLoader = new THREE.TextureLoader(this.fullManager);

    this.thumbManager.onLoad = () => this.loadFullImages();
    this.fullManager.onProgress = (url, loaded, total) =>
      (this.loadProgress = loaded / total);
  }

  initEvents() {
    if (this.btnElement) {
      this.btnElement.addEventListener("click", () => {
        if (this.currentState === STATES.WAITING) {
          this.currentState = STATES.READY;
          this.readyStartTime = performance.now(); // Record animation start time

          // Smoothly fade out HTML UI elements
          if (this.btnElement) {
            this.btnElement.style.opacity = "0";
            this.btnElement.style.visibility = "hidden";
          }
          if (this.loaderElement) {
            this.loaderElement.style.opacity = "0";
            this.loaderElement.style.visibility = "hidden";
          }
        }
      });
    }
  }

  build() {
    const cols = 3;
    const spacingX = 2.5;
    const spacingY = 1.6;

    thumbnails.forEach((item, index) => {
      // Load the thumbnail texture first
      this.textureLoader.load(item.thumb, (thumbTex) => {
        thumbTex.colorSpace = THREE.SRGBColorSpace;

        const thumbAspect = thumbTex.image.width / thumbTex.image.height;
        const fullAspect = 600 / 400;
        const height = 1.5;
        const width = height * fullAspect;

        const geometry = new THREE.PlaneGeometry(width, height);

        // 1. Dynamic TSL Uniforms controlled from CPU
        const transitionNode = uniform(0); // This holds our custom dynamic 'ease' (t)
        const aspectScaleX = uniform(1.0); // Dynamically computed multiplier for aspect matching

        // 2. Initialize full image placeholder as a dynamic texture uniform
        const placeholderTex = new THREE.Texture();
        placeholderTex.colorSpace = THREE.SRGBColorSpace;
        const fuNode = texture(placeholderTex); // Can be dynamically changed or reassigned later

        // 3. Construct your custom TSL Node graph
        const uvNode = uv();


        const updatedUV = uvNode.sub(0.5).mul(vec2(3, 1.1)).add(0.5);

        // --- ANTI-ALIASED MASK FOR THUMBNAIL ---
        // Calculate screen-space derivative to find a 1-pixel wide smoothing filter size
        const tx = fwidth(updatedUV.x);
        const ty = fwidth(updatedUV.y);

        // Create smooth borders instead of rigid true/false steps
        const edgeLeft = smoothstep(float(0.0), tx, updatedUV.x);
        const edgeRight = smoothstep(
          float(0.0),
          tx,
          float(1.0).sub(updatedUV.x),
        );
        const edgeBottom = smoothstep(float(0.0), ty, updatedUV.y);
        const edgeTop = smoothstep(float(0.0), ty, float(1.0).sub(updatedUV.y));

        // Combine them smoothly
        const smoothInside = edgeLeft
          .mul(edgeRight)
          .mul(edgeBottom)
          .mul(edgeTop);

        // Sample textures
        const thumb = texture(thumbTex, updatedUV);
        // Mix into transparent using our smooth gradient mask
        const thumbCropped = mix(vec4(0, 0, 0, 0), thumb, smoothInside);
        const minX = mix(float(1 / 3.0), float(0.0), transitionNode);
        const maxX = mix(float(1.0 - 1 / 3.0), float(1.0), transitionNode);

        const minY = mix(float(1.0 - 1.0 / 1.1), float(0.0), transitionNode);
        const maxY = mix(float(1.0 / 1.1), float(1.0), transitionNode);
        const animatedFull = uvNode.x
          .greaterThanEqual(minX)
          .and(uvNode.x.lessThanEqual(maxX))
          .and(uvNode.y.greaterThanEqual(minY))
          .and(uvNode.y.lessThanEqual(maxY));
        const full = texture(fuNode);
        const fullCropped = mix(vec4(0, 0, 0, 0), full, animatedFull);

        // Final mixed texture driven by transitionNode
        const tex = mix(
          thumbCropped,
          fullCropped,
          transitionNode.greaterThan(0),
        );

        const material = new THREE.MeshBasicNodeMaterial({
          side: THREE.DoubleSide,
          transparent: true,
        });
        material.colorNode = tex;

        // 4. Instantiate and position mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        mesh.position.z = -index * 0.01;
        this.scene.add(mesh);

        const group = Math.floor(index / 2) + 1;
        const sign = index & 1 ? -1 : 1;

        // Grid position calculations
        const col = index % cols;
        const row = Math.floor(index / cols);
        const gridX = (col - (cols - 1) / 2) * spacingX;
        const gridY =
          -(row - (Math.ceil(thumbnails.length / cols) - 1) / 2) * spacingY;

        // Save tracking handles to reference array
        this.imagePlanes.push({
          mesh,
          thumbTexture: thumbTex,
          fullPath: item.full,
          currentX: -sign * (group - 1) * 0.1,
          currentRz: (group - 1) * 0.2 * sign,
          prev: { x: -sign * (group - 1) * 0.1, rz: (group - 1) * 0.2 * sign },
          target: { x: -sign * group * 0.1, rz: group * 0.2 * sign },
          grid: { x: gridX, y: gridY },
          startTime: performance.now() + index * APPEAR_DELAY,

          // Node references updated on CPU during execution loop
          transitionNode,
          aspectScaleX,
          fuNode,
        });
      });
    });
  }

  loadFullImages() {
    this.imagePlanes.forEach((item, index) => {
      this.fullTextureLoader.load(item.fullPath, (fullTexture) => {
        fullTexture.colorSpace = THREE.SRGBColorSpace;
        this.textureStore[index] = fullTexture;

        // 1. Update the dynamic uniform node's value seamlessly
        if (item.fuNode) {
          item.fuNode.value = fullTexture;
        }
      });
    });
  }
  update(now) {
    switch (this.currentState) {
      case STATES.LOADING: {
        this.imagePlanes.forEach((item) => {
          const mesh = item.mesh;
          const elapsed = now - item.startTime;
          const t = THREE.MathUtils.clamp(elapsed / 600, 0, 1);

          if (t <= 0) return;

          mesh.visible = true;
          item.currentX = THREE.MathUtils.lerp(item.prev.x, item.target.x, t);
          item.currentRz = THREE.MathUtils.lerp(
            item.prev.rz,
            item.target.rz,
            t,
          );

          mesh.position.x = item.currentX;
          mesh.rotation.z = item.currentRz;
        });

        const finalProgress = Math.min(
          (now - this.startTime) / (APPEAR_DELAY * (thumbnails.length + 2)), // added 2 to make the transition less sudden
          this.loadProgress,
        );

        if (this.loaderElement) {
          this.loaderElement.style.setProperty("--p", finalProgress);
        }

        if (finalProgress >= 0.999) {
          this.loaderElement.style.setProperty("--p", 1);
          this.currentState = STATES.WAITING;
        }
        break;
      }

      case STATES.WAITING: {
        if (this.btnElement) {
          this.btnElement.innerText = "Click to Enter";
        }

        this.imagePlanes.forEach((item) => {
          item.mesh.position.x = item.target.x;
          item.mesh.rotation.z = item.target.rz;
          // Capture positions cleanly before transitioning state
          item.currentX = item.target.x;
          item.currentRz = item.target.rz;
        });
        break;
      }

      case STATES.READY: {
        const elapsed = now - this.readyStartTime;
        const duration = 1200; // ms
        const t = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
        const ease = t * t * (3 - 2 * t); // Smooth ease-in-out curve

        this.imagePlanes.forEach((item, index) => {
          const mesh = item.mesh;

          // 1. Interpolate Transforms
          mesh.position.x = THREE.MathUtils.lerp(
            item.currentX,
            item.grid.x,
            ease,
          );
          mesh.position.y = THREE.MathUtils.lerp(0, item.grid.y, ease);
          mesh.rotation.z = THREE.MathUtils.lerp(item.currentRz, 0, ease);

          // 3. Drive WebGPU TSL Node Uniform Mix Target
          // (Assumes item.transitionNode = THREE.uniform(0) was wired inside your material setup)
          if (item.transitionNode) {
            item.transitionNode.value = ease;
          }
        });
        break;
      }
    }
  }
}
