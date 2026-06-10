import * as THREE from "three/webgpu";
import {
  float,
  fwidth,
  mix,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec4,
} from "three/tsl";

/**
 * Factory function to construct WebGPU materials using Three Shading Language (TSL)
 */
export function createGalleryMaterial(thumbTexture) {
  // 1. Dynamic TSL Uniforms controlled from CPU
  const transitionNode = uniform(0);
  const hoverNode = uniform(0);

  // 2. Initialize full image placeholder
  const placeholderTex = new THREE.Texture();
  placeholderTex.colorSpace = THREE.SRGBColorSpace;
  const fuNode = texture(placeholderTex);

  const uvNode = uv();
  const updatedUV = uvNode.sub(0.5).mul(vec2(3, 1.1)).add(0.5);

  // --- ANTI-ALIASED MASK FOR THUMBNAIL ---
  const tx = fwidth(updatedUV.x);
  const ty = fwidth(updatedUV.y);

  const edgeLeft = smoothstep(float(0.0), tx, updatedUV.x);
  const edgeRight = smoothstep(float(0.0), tx, float(1.0).sub(updatedUV.x));
  const edgeBottom = smoothstep(float(0.0), ty, updatedUV.y);
  const edgeTop = smoothstep(float(0.0), ty, float(1.0).sub(updatedUV.y));

  const smoothInside = edgeLeft.mul(edgeRight).mul(edgeBottom).mul(edgeTop);

  // Sample and crop thumbnail
  const thumb = texture(thumbTexture, updatedUV);
  const thumbCropped = mix(vec4(0, 0, 0, 0), thumb, smoothInside);

  // --- TRANSITION SCALING LOGIC ---
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

  // Final mixed output texture
  const tex = mix(thumbCropped, fullCropped, transitionNode.greaterThan(0));

  // Soft hover glow addition
  const hoverGlow = hoverNode.mul(0.15);
  const finalTex = tex.add(vec4(hoverGlow, hoverGlow, hoverGlow, 0));

  const material = new THREE.MeshBasicNodeMaterial({
    side: THREE.DoubleSide,
    transparent: true,
  });
  material.colorNode = finalTex;

  return {
    material,
    nodes: {
      transitionNode,
      fuNode,
      hoverNode,
    },
  };
}
