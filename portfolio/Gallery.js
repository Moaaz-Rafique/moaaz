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
    this.camera = experience.camera; // Ensure camera reference is available for raycasting

    this.imagePlanes = [];
    this.textureStore = [];
    this.loadProgress = 0;

    // Existing Raycasting and Pointer handles
    this.pointer = new THREE.Vector2(-1000, -1000);
    this.raycaster = new THREE.Raycaster();
    this.hovered = null;

    // --- Added for Click-and-Drag / Scroll ---
    this.scrollCurrentY = 0;
    this.scrollTargetY = 0;
    this.isDragging = false;
    this.startY = 0;
    this.maxScrollY = 0; // Computed during build() based on item count

    this.currentState = STATES.LOADING;
    this.startTime = performance.now();
    this.readyStartTime = 0;

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
          this.readyStartTime = performance.now();

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

    // Consolidated pointer move handling raycast mapping and dragging math
    window.addEventListener("pointermove", (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Track drag tracking if active
      if (this.isDragging && this.currentState === STATES.READY) {
        const deltaY = e.clientY - this.startY;
        this.scrollTargetY += deltaY * 0.07; // Multiplier adjusts screen pixel drag speed
        this.startY = e.clientY;
      }
    });

    // Native Wheel Scroll Event
    window.addEventListener(
      "wheel",
      (e) => {
        if (this.currentState === STATES.READY) {
          this.scrollTargetY -= e.deltaY * 0.003;
        }
      },
      { passive: true },
    );

    // Drag Initialization Hook
    window.addEventListener("pointerdown", (e) => {
      if (this.currentState === STATES.READY) {
        this.isDragging = true;
        this.startY = e.clientY;
      }
    });

    // Drag Terminations
    window.addEventListener("pointerup", () => (this.isDragging = false));
    window.addEventListener("pointercancel", () => (this.isDragging = false));
  }

  build() {
    // 1. Calculate visible frustum dimensions at camera distance
    const distance = this.experience.camera.position.z;
    const vFOV = THREE.MathUtils.degToRad(this.experience.camera.fov);
    const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
    const visibleWidth =
      visibleHeight * (window.innerWidth / window.innerHeight);

    // 2. Determine structural layout parameters based on screen aspect
    const isMobile = window.innerWidth < window.innerHeight;
    const cols = isMobile ? 2 : 3;
    const totalRows = Math.ceil(thumbnails.length / cols);

    // --- THE FIX STARTS HERE ---

    // 3. Define aspect ratios and safe boundaries
    const fullAspect = 600 / 400;
    const paddingFactor = 0.85; // Use 85% of the screen width for the grid area
    const gapFactor = 0.25; // 25% of the card width/height as a gap

    // 4. Calculate responsive item dimensions based on available column width
    // Split the available width into chunks, accounting for the gap between columns
    const spacingX = (visibleWidth * paddingFactor) / cols;
    const width = spacingX * (1 - gapFactor);
    const height = width / fullAspect;

    // 5. Calculate responsive vertical spacing based on the dynamic height
    const spacingY = height * (1 + gapFactor);

    // 6. Calculate accurate scroll boundaries
    const gridHeight = (totalRows - 1) * spacingY + height;
    const viewHeight = visibleHeight * 0.85; // Match padding factor for consistency
    this.maxScrollY = Math.max(0, gridHeight - viewHeight);

    // // 7. Positioning Logic (Loop through your items using this)
    // const col = index % cols;
    // const row = Math.floor(index / cols);

    // // Centers the grid perfectly regardless of column count
    // const gridX = (col - (cols - 1) / 2) * spacingX;
    // // Aligns the first row near the top of the visible screen area
    // const gridY = viewHeight / 2 - row * spacingY - height / 2;

    thumbnails.forEach((item, index) => {
      // Load the thumbnail texture first
      this.textureLoader.load(item.thumb, (thumbTex) => {
        thumbTex.colorSpace = THREE.SRGBColorSpace;

        const geometry = new THREE.PlaneGeometry(width, height);

        // 1. Dynamic TSL Uniforms controlled from CPU
        const transitionNode = uniform(0); // This holds our custom dynamic 'ease' (t)
        const hoverNode = uniform(0);

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

        // Soft hover glow
        const hoverGlow = hoverNode.mul(0.15);

        const finalTex = tex.add(vec4(hoverGlow, hoverGlow, hoverGlow, 0));

        const material = new THREE.MeshBasicNodeMaterial({
          side: THREE.DoubleSide,
          transparent: true,
        });
        material.colorNode = finalTex;
        // 4. Instantiate and position mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        mesh.position.z = -index * 0.01;
        this.scene.add(mesh);

        const group = Math.floor(index / 2) + 1;
        const sign = index & 1 ? -1 : 1;

        // Grid position calculations
        // 4. Calculate static layout coordinates relative to screen sizing at build time
        const col = index % cols;
        const row = Math.floor(index / cols);

        // Centers the grid perfectly regardless of column count
        const gridX = (col - (cols - 1) / 2) * spacingX;
        // Aligns the first row near the top of the visible screen area
        const gridY = viewHeight / 2 - row * spacingY - height / 2;
        

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
          fuNode,
          hoverNode,
          hover: 0,
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
    this.raycaster.setFromCamera(this.pointer, this.experience.camera);

    const intersects = this.raycaster.intersectObjects(
      this.imagePlanes.map((i) => i.mesh),
    );

    this.hovered = intersects.length > 0 ? intersects[0].object : null;

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
          const mesh = item.mesh;
          const isHovered = mesh === this.hovered;

          //   item.hover = THREE.MathUtils.lerp(
          //     item.hover,
          //     isHovered ? 1 : 0,
          //     0.08,
          //   );

          //   item.hoverNode.value = item.hover;

          item.mesh.position.x = item.target.x;
          item.mesh.rotation.z = item.target.rz;
          // Capture positions cleanly before transitioning state
          item.currentX = item.target.x;
          item.currentRz = item.target.rz;
        });
        break;
      }

      case STATES.READY: {
        const isReady = this.currentState === STATES.READY;
        const elapsed = now - this.readyStartTime;
        const duration = 1200; // ms
        const t = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
        const ease = t * t * (3 - 2 * t); // Smooth ease-in-out curve
        // 1. Keep track of current scrolling limits smoothly using lerp
        if (isReady) {
          // Clamp scroll boundaries to keep grid contents safely framed in view bounds
          this.scrollTargetY = THREE.MathUtils.clamp(
            this.scrollTargetY,
            -this.maxScrollY,
            0,
          );
          this.scrollCurrentY = THREE.MathUtils.lerp(
            this.scrollCurrentY,
            this.scrollTargetY,
            0.1,
          );
        }
        this.imagePlanes.forEach((item, index) => {
          const mesh = item.mesh;
          const isHovered = mesh === this.hovered;

          item.hover = THREE.MathUtils.lerp(
            item.hover,
            isHovered ? 1 : 0,
            0.08,
          );

          item.hoverNode.value = item.hover;
          // 1. Interpolate Transforms
          mesh.position.x =
            THREE.MathUtils.lerp(item.currentX, item.grid.x, ease) +
            item.hover * 0.08;
          mesh.position.z = -index * 0.01 + item.hover * 0.2;
          mesh.position.y = THREE.MathUtils.lerp(
            0,
            item.grid.y - this.scrollCurrentY,
            ease,
          );
          mesh.rotation.z =
            THREE.MathUtils.lerp(item.currentRz, 0, ease) + item.hover * 0.03;
          const s = 1 + item.hover * 0.04;

          mesh.scale.setScalar(s);
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
