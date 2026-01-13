import * as THREE from "three/webgpu";

import {
  Fn,
  If,
  Return,
  instancedArray,
  instanceIndex,
  uniform,
  select,
  attribute,
  uint,
  Loop,
  float,
  transformNormalToView,
  cross,
  triNoise3D,
  time,
} from "three/tsl";

import { Inspector } from "three/addons/inspector/Inspector.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { UltraHDRLoader } from "three/addons/loaders/UltraHDRLoader.js";
import WebGPU from "three/addons/capabilities/WebGPU.js";
import { sin } from "three/tsl";

let renderer, scene, camera, controls;

const clothWidth = 1;
const clothHeight = 1;
const clothNumSegmentsX = 5;
const clothNumSegmentsY = 5;

let vertexPositionBuffer;

let clothMesh, clothMaterial;

const verletVertices = [];
const verletVertexColumns = [];

// TODO: Fix example with WebGL backend

if (WebGPU.isAvailable() === false) {
  document.body.appendChild(WebGPU.getErrorMessage());

  throw new Error("No WebGPU support");
}

init();

async function init() {
  renderer = new THREE.WebGPURenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.inspector = new Inspector();
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.set(1.6, 0.1, 1.6);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 3;
  controls.target.set(0, 0, 0);
  controls.update();

  setupCloth();

  window.addEventListener("resize", onWindowResize);

  renderer.setAnimationLoop(render);
}

function setupVerletGeometry() {
  const addVerletVertex = (x, y, z, isFixed) => {
    const id = verletVertices.length;
    const vertex = {
      id,
      position: new THREE.Vector3(x, y, z),
      isFixed,
    };
    verletVertices.push(vertex);
    return vertex;
  };

  for (let x = 0; x <= clothNumSegmentsX; x++) {
    const column = [];
    for (let y = 0; y <= clothNumSegmentsY; y++) {
      const posX = x * (clothWidth / clothNumSegmentsX) - clothWidth * 0.5;
      const posZ = y * (clothHeight / clothNumSegmentsY);
      const vertex = addVerletVertex(posX, clothHeight * 0.5, posZ, true);
      column.push(vertex);
    }

    verletVertexColumns.push(column);
  }
}

function setupVerletVertexBuffers() {
  const vertexCount = verletVertices.length;

  const vertexPositionArray = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i++) {
    const vertex = verletVertices[i];
    vertexPositionArray[i * 3] = vertex.position.x;
    vertexPositionArray[i * 3 + 1] = vertex.position.y;
    vertexPositionArray[i * 3 + 2] = vertex.position.z;
  }

  vertexPositionBuffer = instancedArray(vertexPositionArray, "vec3").setPBO(
    true
  );
}

function setupClothMesh() {
  // This function generates a three Geometry and Mesh to render the cloth based on the verlet systems position data.
  // Therefore it creates a plane mesh, in which each vertex will be centered in the center of 4 verlet vertices.

  const vertexCount = clothNumSegmentsX * clothNumSegmentsY;
  const geometry = new THREE.BufferGeometry();

  // verletVertexIdArray will hold the 4 verlet vertex ids that contribute to each geometry vertex's position
  const verletVertexIdArray = new Uint32Array(vertexCount * 4);
  const indices = [];

  const getIndex = (x, y) => {
    return y * clothNumSegmentsX + x;
  };

  for (let x = 0; x < clothNumSegmentsX; x++) {
    for (let y = 0; y < clothNumSegmentsX; y++) {
      const index = getIndex(x, y);
      verletVertexIdArray[index * 4] = verletVertexColumns[x][y].id;
      verletVertexIdArray[index * 4 + 1] = verletVertexColumns[x + 1][y].id;
      verletVertexIdArray[index * 4 + 2] = verletVertexColumns[x][y + 1].id;
      verletVertexIdArray[index * 4 + 3] = verletVertexColumns[x + 1][y + 1].id;

      if (x > 0 && y > 0) {
        indices.push(
          getIndex(x, y),
          getIndex(x - 1, y),
          getIndex(x - 1, y - 1)
        );
        indices.push(
          getIndex(x, y),
          getIndex(x - 1, y - 1),
          getIndex(x, y - 1)
        );
      }
    }
  }

  const verletVertexIdBuffer = new THREE.BufferAttribute(
    verletVertexIdArray,
    4,
    false
  );
  const positionBuffer = new THREE.BufferAttribute(
    new Float32Array(vertexCount * 3),
    3,
    false
  );
  geometry.setAttribute("position", positionBuffer);
  geometry.setAttribute("vertexIds", verletVertexIdBuffer);
  geometry.setIndex(indices);

  clothMaterial = new THREE.MeshBasicMaterial({
    color: "white",
    side: 2,
    wireframe: true,
  });

  console.log(vertexPositionBuffer);
  

  clothMaterial.positionNode = Fn(({ material }) => {
    // gather the position of the 4 verlet vertices and calculate the center position and normal from that
    const vertexIds = attribute("vertexIds");
    const v0 = vertexPositionBuffer.element(vertexIds.x).toVar();
    // v0.z = vertexIds.x.div(clothNumSegmentsX);
    return v0;
  })();

  clothMesh = new THREE.Mesh(geometry, clothMaterial);
  clothMesh.frustumCulled = false;
  scene.add(clothMesh);
}

function setupCloth() {
  setupVerletGeometry();
  setupVerletVertexBuffers();
  setupClothMesh();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function render() {
  renderer.render(scene, camera);
}
