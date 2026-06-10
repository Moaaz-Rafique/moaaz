import * as THREE from "three/webgpu";
import { thumbnails, APPEAR_DELAY } from "./config.js";
import { createGalleryMaterial } from "./GalleryMaterial.js";
import { calculateGridLayout } from "./GalleryLayout.js";
import { vec2 } from "three/tsl";

const STATES = {
  LOADING: "LOADING",
  WAITING: "WAITING",
  READY: "READY",
};

export class Gallery {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.camera = experience.camera;

    this.imagePlanes = [];
    this.raycastTargets = []; // OPTIMIZATION: Cached array to bypass allocation in render loop
    this.textureStore = [];
    this.loadProgress = 0;

    this.pointer = new THREE.Vector2(-1000, -1000);
    this.raycaster = new THREE.Raycaster();
    this.hovered = null;
    this.hoveredUVs = null;

    this.scrollCurrentY = 0;
    this.scrollTargetY = 0;
    this.isDragging = false;
    this.startY = 0;
    this.maxScrollY = 0;

    this.currentState = STATES.LOADING;
    this.startTime = performance.now();
    this.readyStartTime = 0;

    this.loaderElement = document.getElementById("loader");
    this.btnElement = document.getElementById("btn");

    this.initCSS();
    this.initLoaders();
    this.initEvents();
  }

  initCSS() {
    const hiddenStyle = "opacity 0.6s ease, visibility 0.6s";
    if (this.btnElement) this.btnElement.style.transition = hiddenStyle;
    if (this.loaderElement) this.loaderElement.style.transition = hiddenStyle;
  }

  initLoaders() {
    this.thumbManager = new THREE.LoadingManager();
    this.fullManager = new THREE.LoadingManager();

    this.textureLoader = new THREE.TextureLoader(this.thumbManager);
    this.textureLoader.path = '/portfolio/'
    this.fullTextureLoader = new THREE.TextureLoader(this.fullManager);
    this.fullTextureLoader.path = '/portfolio/'

    this.thumbManager.onLoad = () => this.loadFullImages();
    this.fullManager.onProgress = (url, loaded, total) => {
      this.loadProgress = loaded / total;
    };
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

    window.addEventListener("pointermove", (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.isDragging && this.currentState === STATES.READY) {
        const deltaY = e.clientY - this.startY;
        this.scrollTargetY += deltaY * 0.07;
        this.startY = e.clientY;
      }
      // OPTIMIZATION: Bypasses raycasting logic on frames during system loading state
      if (this.currentState !== STATES.LOADING) {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.raycastTargets);
        if (intersects.length > 0) {
          this.hovered = intersects[0].object;
          this.hoveredUVs = intersects[0].uv;
        } else {
          this.hovered = null;
          this.hoveredUVs = null;
        }
      }
    });

    window.addEventListener(
      "wheel",
      (e) => {
        if (this.currentState === STATES.READY) {
          this.scrollTargetY -= e.deltaY * 0.003;
        }
      },
      { passive: true },
    );

    window.addEventListener("pointerdown", (e) => {
      if (this.currentState === STATES.READY) {
        this.isDragging = true;
        this.startY = e.clientY;
      }
    });

    window.addEventListener("pointerup", () => (this.isDragging = false));
    window.addEventListener("pointercancel", () => (this.isDragging = false));
  }

  build() {
    const layout = calculateGridLayout(this.camera, thumbnails.length);
    this.maxScrollY = layout.maxScrollY;

    thumbnails.forEach((item, index) => {
      this.textureLoader.load(item.thumb, (thumbTex) => {
        thumbTex.colorSpace = THREE.SRGBColorSpace;

        const geometry = new THREE.PlaneGeometry(layout.width, layout.height);
        const { material, nodes } = createGalleryMaterial(thumbTex);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        mesh.position.z = -index * 0.01;
        this.scene.add(mesh);

        // Track targets explicitly for memory runtime efficiency
        this.raycastTargets.push(mesh);

        const group = Math.floor(index / 2) + 1;
        const sign = index & 1 ? -1 : 1;

        const col = index % layout.cols;
        const row = Math.floor(index / layout.cols);

        const gridX = (col - (layout.cols - 1) / 2) * layout.spacingX;
        const gridY =
          layout.viewHeight / 2 - row * layout.spacingY - layout.height / 2;

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

          transitionNode: nodes.transitionNode,
          fuNode: nodes.fuNode,
          hoverNode: nodes.hoverNode,
          hoverPositionUV: nodes.hoverPositionUV,
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
          (now - this.startTime) / (APPEAR_DELAY * (thumbnails.length + 2)),
          this.loadProgress,
        );

        if (this.loaderElement) {
          this.loaderElement.style.setProperty("--p", finalProgress);
        }

        if (finalProgress >= 0.999) {
          if (this.loaderElement)
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
          item.currentX = item.target.x;
          item.currentRz = item.target.rz;
        });
        break;
      }

      case STATES.READY: {
        const elapsed = now - this.readyStartTime;
        const duration = 1200;
        const t = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
        const ease = t * t * (3 - 2 * t);

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

        this.imagePlanes.forEach((item, index) => {
          const mesh = item.mesh;
          const isHovered = mesh === this.hovered;

          item.hover = THREE.MathUtils.lerp(
            item.hover,
            isHovered ? 1 : 0,
            0.08,
          );
          item.hoverNode.value = item.hover;
          console.log(item);

          if (isHovered) item.hoverPositionUV.value = vec2(this.hoveredUVs);

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

          mesh.scale.setScalar(1 + item.hover * 0.04);

          if (item.transitionNode) {
            item.transitionNode.value = ease;
          }
        });
        break;
      }
    }
  }
}
