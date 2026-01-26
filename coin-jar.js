import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { RapierDebugRenderer } from "./DebugRenderer";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader";

await RAPIER.init();

/* -------------------------------------------------- */
/* Constants                                          */
/* -------------------------------------------------- */
const MAX_COINS = 850;
const FREEZE_TIME = 20_000; // ms
let FREEZE_HEIGHT = 0.1;

/* -------------------------------------------------- */
/* Scene setup                                        */
/* -------------------------------------------------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const aspect = window.innerWidth / window.innerHeight;

const frustumHeight = 2 * Math.tan(THREE.MathUtils.degToRad(30) / 2) * 20;
const frustumWidth = frustumHeight * aspect;

const camera = new THREE.OrthographicCamera(
  -frustumWidth / 2,
  frustumWidth / 2,
  frustumHeight / 2,
  -frustumHeight / 2,
  0.1,
  1000,
);

const cy = 4.5;
camera.position.set(20, cy, 0);
camera.lookAt(0, cy, 0);
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const orbit = new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);
const rgbeLoader = new HDRLoader();

rgbeLoader.load("/textures/base.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  // scene.background = texture;
});

/* -------------------------------------------------- */
/* Rapier world (tuned)                               */
/* -------------------------------------------------- */
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

world.integrationParameters.allowedLinearError = 0.01;
world.integrationParameters.allowedAngularError = 0.01;
world.integrationParameters.numSolverIterations = 4;
world.integrationParameters.numInternalPgsIterations = 2;

const group = new THREE.Group();
group.scale.multiplyScalar(0.6);
group.position.x = 4;
scene.add(group);

{
  const body = world
    .createRigidBody(RAPIER.RigidBodyDesc.fixed())
    .translation(0, 10, 0);
  world.createCollider(RAPIER.ColliderDesc.cuboid(3, 0.3, 3), body);

  // const mesh = new THREE.Mesh(
  //   new THREE.BoxGeometry(20, 0.2, 20),
  //   new THREE.MeshStandardMaterial({ color: 0x333333 }),
  // );
  // mesh.position.y = -0.1;
  // group.add(mesh);
}

/* -------------------------------------------------- */
/* Debug renderer                                     */
/* -------------------------------------------------- */
let showDebug = true;
const rapierDebugRender = new RapierDebugRenderer(group, world, showDebug);
document.getElementById("debugToggle").addEventListener("change", (e) => {
  showDebug = e.target.checked;
  rapierDebugRender.toggleVisible(showDebug);
});
const coinCount = document.getElementById("coinCount");

const gltfloader = new GLTFLoader();

// Load texture
const loader = new THREE.TextureLoader();
loader.load("/images/Jar back.png", (texture) => {
  // Create geometry
  const geometry = new THREE.PlaneGeometry(1, 1); // width, height (adjust as needed)

  // Create material with the texture, no lighting
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true, // if PNG has alpha
    side: 2,
  });

  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);

  // Set position
  mesh.position.set(-5, 4.0, 0.0); // x, y, z
  // Optional: scale to match texture aspect ratio
  const aspect = texture.image.width / texture.image.height;
  mesh.scale.set(aspect, 1, 1);
  mesh.scale.multiplyScalar(8.5);
  mesh.rotation.y = Math.PI / 2;
  // Add to scene
  group.add(mesh);
});
loader.load("/images/Jar front.png", (texture) => {
  // Create geometry
  const geometry = new THREE.PlaneGeometry(1, 1); // width, height (adjust as needed)

  // Create material with the texture, no lighting
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true, // if PNG has alpha
    side: 2,
  });

  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);

  // Set position
  mesh.position.set(5, 4.0, 0.0); // x, y, z
  // Optional: scale to match texture aspect ratio
  const aspect = texture.image.width / texture.image.height;
  mesh.scale.set(aspect, 1, 1);
  mesh.scale.multiplyScalar(8.5);
  mesh.rotation.y = Math.PI / 2;
  // Add to scene
  group.add(mesh);
});

function createPot() {
  const url = "/models/pot2.glb";

  gltfloader.load(url, (gltf) => {
    const potMesh = gltf.scene;
    potMesh.position.y = 4;
    potMesh.scale.multiplyScalar(2);
    // scene.add(potMesh);

    potMesh.updateWorldMatrix(true, true);

    const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());

    potMesh.traverse((child) => {
      if (!child.isMesh) return;

      const geom = child.geometry.clone();
      geom.applyMatrix4(child.matrixWorld);

      const positions = geom.attributes.position.array;
      const indices = geom.index
        ? geom.index.array
        : [...Array(positions.length / 3).keys()];

      const colliderDesc = RAPIER.ColliderDesc.trimesh(
        positions,
        indices,
      ).setFriction(0.0);

      world.createCollider(colliderDesc, body);
    });
  });
}

createPot();

/* -------------------------------------------------- */
/* Instanced coins                                    */
/* -------------------------------------------------- */
let coinMesh = null;

gltfloader.load("/models/coin_compressed2.glb", (gltf) => {
  let sourceMesh = null;

  gltf.scene.traverse((o) => {
    if (o.isMesh && !sourceMesh) sourceMesh = o;
  });

  if (!sourceMesh) return;

  const geometry = sourceMesh.geometry.clone();
  const material = sourceMesh.material.clone();

  coinMesh = new THREE.InstancedMesh(geometry, material, MAX_COINS);
  coinMesh.frustumCulled = false;
  // coinMesh.castShadow = false;
  // coinMesh.receiveShadow = false;
  // spawnCoin(0);

  group.add(coinMesh);
});
/* -------------------------------------------------- */
/* Coin storage                                       */
/* -------------------------------------------------- */
const coins = [];
let coinIndex = 0;

/* Reusable temp objects */
const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const scaleFactor = 1.3;
const tempScale = new THREE.Vector3(scaleFactor, scaleFactor, scaleFactor);

/* -------------------------------------------------- */
/* Spawn coin                                         */
/* -------------------------------------------------- */

function spawnCoin(y) {
  if (coinIndex >= MAX_COINS) return;
  coinMesh.count = coinIndex + 1; // increase only when spawning
  coinCount.innerHTML = coinMesh.count;
  const axis = tempPos
    .set(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      (Math.random() * 2 - 1) / (scaleFactor * scaleFactor),
    )
    .normalize();

  const quat = tempQuat.setFromAxisAngle(axis, Math.random() * Math.PI * 2);

  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(
        ((Math.random() - 0.5) * 1) * (scaleFactor * scaleFactor),
        y + scaleFactor * Math.random() - 3,
        ((Math.random() - 0.5) * 1) * (scaleFactor * scaleFactor),
      )
      .setRotation(quat)
      .setLinearDamping(0.7)
      .setAngularDamping(0.2),
  );

  world.createCollider(
    RAPIER.ColliderDesc.cylinder(0.045 * scaleFactor, 0.45 * scaleFactor)
      .setDensity(1.0)
      .setFriction(0.6)
      .setRestitution(0.05),
    body,
  );

  body.setAngvel(
    {
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
    },
    true,
  );
  body.enableCcd(true);

  coins.push({
    body,
    index: coinIndex++,
    spawnTime: performance.now(),
    frozen: false,
    dirty: true,
  });
}
function freezeCoin(c) {
  if (c.frozen) return;

  const { x, y, z } = c.body.translation();
  const { x: rx, y: ry, z: rz, w } = c.body.rotation();

  // Remove the dynamic body
  world.removeRigidBody(c.body);

  // Create a fixed (static) body
  const staticBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());

  // Attach collider with translation & rotation baked in
  world.createCollider(
    RAPIER.ColliderDesc.cylinder(0.041 * scaleFactor, 0.41 * scaleFactor)
      .setTranslation(x, y, z)
      .setRotation({ x: rx, y: ry, z: rz, w }),
    staticBody,
  );

  c.body = staticBody;
  c.frozen = true;
}

/* -------------------------------------------------- */
/* Animation loop                                     */
/* -------------------------------------------------- */
let spawnTimer = 0;

let lastTime = performance.now();
let accumulator = 0;

const FIXED_DT = 1 / 60; // 60 Hz physics
const MAX_DT = 0.1; // prevent spiral of death

let spawnAccumulator = 0;
const SPAWN_INTERVAL = 0.083; // ~5 frames @60fps

document.addEventListener("visibilitychange", () => {
  lastTime = performance.now();
});

window.addEventListener("resize", () => {
  const aspect = window.innerWidth / window.innerHeight;

  camera.left = (-frustumHeight * aspect) / 2;
  camera.right = (frustumHeight * aspect) / 2;
  camera.top = frustumHeight / 2;
  camera.bottom = -frustumHeight / 2;

  // camera.updateProjectionMatrix();
});

function animate() {
  if (!coinMesh) {
    requestAnimationFrame(animate);
    return;
  }
  requestAnimationFrame(animate);

  const now = performance.now();

  spawnTimer++;

  let dt = (now - lastTime) / 1000;
  lastTime = now;

  dt = Math.min(dt, MAX_DT);
  accumulator += dt;

  // Fixed-step physics
  while (accumulator >= FIXED_DT) {
    accumulator -= FIXED_DT;
    world.step();

    // Spawn coins (time-based, not frame-based)
    spawnAccumulator += FIXED_DT;
    if (spawnAccumulator >= SPAWN_INTERVAL) {
      spawnAccumulator = 0;
      spawnCoin(15);
      FREEZE_HEIGHT = coinMesh.count / 300;
    }
  }

  // Physics → freeze logic
  for (const c of coins) {
    if (c.frozen) continue;

    const p = c.body.translation();
    const v = c.body.linvel();
    const elapsed = now - c.spawnTime;

    const slow =
      Math.abs(v.x) < 0.1 && Math.abs(v.y) < 0.1 && Math.abs(v.z) < 0.1;

    const settled = (p.y < FREEZE_HEIGHT && slow) || c.body.isSleeping();

    if (elapsed > FREEZE_TIME || settled) {
      freezeCoin(c);
    } else {
      c.dirty = true;
    }
  }

  // Update instance matrices ONLY when needed
  for (const c of coins) {
    if (!c.dirty) continue;
    if (c.frozen) continue;
    const p = c.body.translation();
    const r = c.body.rotation();

    tempMatrix.compose(
      tempPos.set(p.x, p.y, p.z),
      tempQuat.set(r.x, r.y, r.z, r.w),
      tempScale,
    );

    coinMesh.setMatrixAt(c.index, tempMatrix);
    c.dirty = false;
  }

  coinMesh.instanceMatrix.needsUpdate = true;

  rapierDebugRender.update();
  renderer.render(scene, camera);
}

animate();
