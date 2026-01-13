import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { RapierDebugRenderer } from "./DebugRenderer";

await RAPIER.init();

/* -------------------------------------------------- */
/* Scene setup                                        */
/* -------------------------------------------------- */
const FREEZE_TIME = 100_000; // ms

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
/* Rapier world                                       */
/* -------------------------------------------------- */
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

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
  world.createCollider(RAPIER.ColliderDesc.cuboid(10, 0.1, 10), body);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 20),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  mesh.position.y = -0.1;
  scene.add(mesh);
}

/* -------------------------------------------------- */
/* Pot (compound collider)                            */
/* -------------------------------------------------- */
function createPot() {
  const potBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0)
  );

  const height = 5;
  const radius = 5;
  const wallThickness = 0.15;
  const wallCount = 36;

  /* ---------------- Bottom ---------------- */
  world.createCollider(
    RAPIER.ColliderDesc.cylinder(0.1, radius)
      .setTranslation(0, 0.1, 0)
      .setFriction(1.0),
    potBody
  );

  /* ---------------- Walls ---------------- */
  for (let i = 0; i < wallCount; i++) {
    const angle = (i / wallCount) * Math.PI * 2;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    world.createCollider(
      RAPIER.ColliderDesc.cuboid(
        wallThickness, // half-width
        height / 2, // half-height
        0.5 // half-depth
      )
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

  /* ---------------- Visual ---------------- */
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
/* Coins                                              */
/* -------------------------------------------------- */
const coins = [];

function spawnCoin(y) {
  const radius = 0.4;
  const thickness = 0.08;

  /* -------- Random rotation -------- */
  const axis = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ).normalize();

  const angle = Math.random() * Math.PI * 2;
  const quat = new THREE.Quaternion().setFromAxisAngle(axis, angle);

  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(
        (Math.random() - 0.5) * 0.5,
        y,
        (Math.random() - 0.5) * 0.5
      )
      .setRotation({
        x: quat.x,
        y: quat.y,
        z: quat.z,
        w: quat.w,
      })
  );

  /* -------- Collider -------- */
  world.createCollider(
    RAPIER.ColliderDesc.cylinder(thickness / 2, radius)
      .setDensity(1.0)
      .setFriction(0.8)
      .setRestitution(0.1),
    body
  );

  /* -------- Random spin -------- */
  body.setAngvel(
    {
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
    },
    true // wake up body
  );

  /* -------- Optional: slight linear impulse -------- */
  body.setLinvel(
    {
      x: (Math.random() - 0.5) * 0.5,
      y: 0,
      z: (Math.random() - 0.5) * 0.5,
    },
    true
  );

  /* -------- Visual -------- */
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, thickness, 24),
    new THREE.MeshStandardMaterial({ color: 0xffcc33 })
  );

  scene.add(mesh);
  coins.push({
    body,
    mesh,
    spawnTime: performance.now(),
    frozen: false,
  });
}

// Spawn coins gradually
let spawnTimer = 0;

/* -------------------------------------------------- */
/* Animation loop                                     */
/* -------------------------------------------------- */
function animate() {
  requestAnimationFrame(animate);

  world.step();

  // Spawn coins
  spawnTimer++;
  if (spawnTimer % 2 === 0 && coins.length < 1200) {
    spawnCoin(6);
  }

  for (const c of coins) {
    if (c.frozen) {
      c.body.sleep();
      continue;
    }

    const now = performance.now();
    const elapsed = now - c.spawnTime;

    // Either time-based OR already sleeping
    if (elapsed > FREEZE_TIME || c.body.isSleeping()) {
      // Stop all motion
      c.body.setLinvel({ x: 0, y: 0, z: 0 }, false);
      c.body.setAngvel({ x: 0, y: 0, z: 0 }, false);

      // Lock movement but keep collisions
      c.body.lockTranslations(true, true);
      c.body.lockRotations(true, true);
      c.body.sleep();

      c.frozen = true;
    }
  }

  // Sync meshes
  for (const c of coins) {
    const p = c.body.translation();
    const r = c.body.rotation();
    c.mesh.position.set(p.x, p.y, p.z);
    c.mesh.quaternion.set(r.x, r.y, r.z, r.w);
  }
  rapierDebugRender.update();

  renderer.render(scene, camera);
}

animate();
