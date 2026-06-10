import * as THREE from "three/webgpu";

/**
 * Calculates accurate 3D grid spatial layout parameters relative to screen sizing
 */
export function calculateGridLayout(camera, totalItems) {
  const distance = camera.position.z;
  const vFOV = THREE.MathUtils.degToRad(camera.fov);
  const visibleHeight = 2 * Math.tan(vFOV / 2) * distance;
  const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);

  const isMobile = window.innerWidth < window.innerHeight;
  const cols = isMobile ? 2 : 3;
  const totalRows = Math.ceil(totalItems / cols);

  const fullAspect = 600 / 400;
  const paddingFactor = 0.85;
  const gapFactor = 0.25;

  const spacingX = (visibleWidth * paddingFactor) / cols;
  const width = spacingX * (1 - gapFactor);
  const height = width / fullAspect;

  const spacingY = height * (1 + gapFactor);
  const gridHeight = (totalRows - 1) * spacingY + height;
  const viewHeight = visibleHeight * paddingFactor;

  const maxScrollY = Math.max(0, gridHeight - viewHeight);

  return {
    cols,
    width,
    height,
    spacingX,
    spacingY,
    viewHeight,
    maxScrollY,
  };
}
