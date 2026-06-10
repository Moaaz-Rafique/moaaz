import * as THREE from "three/webgpu";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class Experience {
  constructor(canvasSelector) {
    this.canvas = document.querySelector(canvasSelector);
    this.scene = new THREE.Scene();
    this.sizes = { width: window.innerWidth, height: window.innerHeight };

    this.initLights();
    this.initCamera();
    this.onUpdateCallbacks = [];

    window.addEventListener("resize", () => this.onResize());
  }

  async init() {
    this.renderer = new THREE.WebGPURenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    await this.renderer.init();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Start loop
    this.tick();
  }

  initLights() {
    this.scene.add(new THREE.AmbientLight("white", 2));
    const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
    directionalLight.position.set(1, 1, 0);
    this.scene.add(directionalLight);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      100,
    );
    this.camera.position.set(0, 0, 10);
  }

  onResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // Register modern update tick methods from other files
  addUpdateCallback(callback) {
    this.onUpdateCallbacks.push(callback);
  }

  tick() {
    // this.controls.update();

    const now = performance.now();
    this.onUpdateCallbacks.forEach((cb) => cb(now));

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
