import {
  LineSegments,
  BufferGeometry,
  LineBasicMaterial,
  BufferAttribute,
} from "three";

export class RapierDebugRenderer {
  mesh;
  world;
  enabled;

  constructor(scene, world, enabled) {
    this.world = world;
    this.mesh = new LineSegments(
      new BufferGeometry(),
      new LineBasicMaterial({ color: 0xffffff, vertexColors: true })
    );
    this.mesh.frustumCulled = false;
    this.enabled = enabled;
    scene.add(this.mesh);
  }

  toggleVisible(visible) {
    this.enabled = visible;
  }

  update() {
    if (this.enabled) {
      const { vertices, colors } = this.world.debugRender();
      this.mesh.geometry.setAttribute(
        "position",
        new BufferAttribute(vertices, 3)
      );
      this.mesh.geometry.setAttribute("color", new BufferAttribute(colors, 4));
      this.mesh.visible = true;
    } else {
      this.mesh.visible = false;
    }
  }
}
