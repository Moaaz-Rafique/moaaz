import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { RapierDebugRenderer } from "./DebugRenderer";

await RAPIER.init();

/* -------------------------------------------------- */
/* Constants                                          */
/* -------------------------------------------------- */
const MAX_COINS = 10_000;
const FREEZE_TIME = 20_000; // ms
const FREEZE_HEIGHT = 1.0;

/* -------------------------------------------------- */
/* Scene setup                                        */
/* -------------------------------------------------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(6, 8, 10);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

/* -------------------------------------------------- */
/* Rapier world (tuned)                               */
/* -------------------------------------------------- */
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

world.integrationParameters.allowedLinearError = 0.01;
world.integrationParameters.allowedAngularError = 0.01;
world.integrationParameters.numSolverIterations = 4;
world.integrationParameters.numInternalPgsIterations = 1;

/* -------------------------------------------------- */
/* Debug renderer                                     */
/* -------------------------------------------------- */
let showDebug = true;
const rapierDebugRender = new RapierDebugRenderer(scene, world, showDebug);
document.getElementById("debugToggle").addEventListener("change", (e) => {
  showDebug = e.target.checked;
  rapierDebugRender.toggleVisible(showDebug);
});
/* -------------------------------------------------- */
/* Ground                                             */
/* -------------------------------------------------- */
{
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  world.createCollider(RAPIER.ColliderDesc.cuboid(20, 0.1, 20), body);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(40, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  mesh.position.y = -0.1;
  scene.add(mesh);
}

/* -------------------------------------------------- */
/* Pot (compound collider)                            */
/* -------------------------------------------------- */
function createPot() {
  const potBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());

  const height = 5;
  const radius = 5;
  const wallThickness = 0.15;
  const wallCount = 36;

  // Bottom
  world.createCollider(
    RAPIER.ColliderDesc.cylinder(0.1, radius)
      .setTranslation(0, 0.1, 0)
      .setFriction(1.0),
    potBody
  );

  // Walls
  for (let i = 0; i < wallCount; i++) {
    const angle = (i / wallCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    world.createCollider(
      RAPIER.ColliderDesc.cuboid(wallThickness, height / 2, 0.5)
        .setTranslation(x, height / 2, z)
        .setRotation({
          x: 0,
          y: -Math.sin(angle / 2),
          z: 0,
          w: Math.cos(angle / 2),
        })
        .setFriction(1.0),
      potBody
    );
  }

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x996633,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1,
    })
  );
  mesh.position.y = height / 2;
  scene.add(mesh);
}

createPot();

/* -------------------------------------------------- */
/* Instanced coins                                    */
/* -------------------------------------------------- */
const coinGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 24);
const coinMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc33 });

const coinMesh = new THREE.InstancedMesh(coinGeometry, coinMaterial, MAX_COINS);
coinMesh.castShadow = false;
coinMesh.receiveShadow = false;
scene.add(coinMesh);

/* -------------------------------------------------- */
/* Coin storage                                       */
/* -------------------------------------------------- */
const coins = [];
let coinIndex = 0;

/* Reusable temp objects */
const tempMatrix = new THREE.Matrix4();
const tempPos = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tempScale = new THREE.Vector3(1, 1, 1);

/* -------------------------------------------------- */
/* Spawn coin                                         */
/* -------------------------------------------------- */

function spawnCoin(y) {
  if (coinIndex >= MAX_COINS) return;
  coinMesh.count = coinIndex + 1; // increase only when spawning

  const axis = tempPos
    .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
    .normalize();

  const quat = tempQuat.setFromAxisAngle(axis, Math.random() * Math.PI * 2);

  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation((Math.random() - 0.5) * 3, y, (Math.random() - 0.5) * 3)
      .setRotation(quat)
      //   .setLinearDamping(0.7)
      .setAngularDamping(0.9)
  );

  world.createCollider(
    RAPIER.ColliderDesc.cylinder(0.04, 0.4)
      .setDensity(1.0)
      .setFriction(0.6)
      .setRestitution(0.05),
    body
  );

  body.setAngvel(
    {
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
    },
    true
  );

  coins.push({
    body,
    index: coinIndex++,
    spawnTime: performance.now(),
    frozen: false,
    dirty: true,
  });
}
function freezeCoinAsStatic(c) {
  if (c.frozen) return;

  const { x, y, z } = c.body.translation();
  const { x: rx, y: ry, z: rz, w } = c.body.rotation();

  // Remove the dynamic body
  world.removeRigidBody(c.body);

  // Create a fixed (static) body
  const staticBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());

  // Attach collider with translation & rotation baked in
  world.createCollider(
    RAPIER.ColliderDesc.cylinder(0.04, 0.4)
      .setTranslation(x, y, z)
      .setRotation({ x: rx, y: ry, z: rz, w }),
    staticBody
  );

  c.body = staticBody;
  c.frozen = true;
}

/* -------------------------------------------------- */
/* Freeze helper                                      */
/* -------------------------------------------------- */
function freezeCoin(c) {
  //   c.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
  //   c.body.setAngvel({ x: 0, y: 0, z: 0 }, false);
  //   c.body.lockTranslations(true, true);
  //   c.body.lockRotations(true, true);
  //   c.body.sleep();
  //   if (!c.frozen) world.removeRigidBody(c.body);
  //   c.body = null;
  freezeCoinAsStatic(c);
  //   c.frozen = true;
  //   c.dirty = true;
}

/* -------------------------------------------------- */
/* Animation loop                                     */
/* -------------------------------------------------- */
let spawnTimer = 0;

function animate() {
  requestAnimationFrame(animate);
  world.step();

  const now = performance.now();

  // Spawn coins
  spawnTimer++;
  if (spawnTimer % 2 === 0) spawnCoin(10);

  // Physics → freeze logic
  for (const c of coins) {
    if (c.frozen) continue;

    const p = c.body.translation();
    const v = c.body.linvel();
    const elapsed = now - c.spawnTime;

    const slow =
      Math.abs(v.x) < 0.05 && Math.abs(v.y) < 0.05 && Math.abs(v.z) < 0.05;

    const settled = p.y < FREEZE_HEIGHT && slow && c.body.isSleeping();

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
      tempScale
    );

    coinMesh.setMatrixAt(c.index, tempMatrix);
    c.dirty = false;
  }

  coinMesh.instanceMatrix.needsUpdate = true;

  rapierDebugRender.update();
  renderer.render(scene, camera);
}

animate();
