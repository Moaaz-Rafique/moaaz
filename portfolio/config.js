export async function getAdaptiveDelay() {
  const conn = navigator.connection;

  let factor = 1.0;

  // 1. network type hint
  if (conn?.effectiveType === "slow-2g") factor *= 2.5;
  else if (conn?.effectiveType === "2g") factor *= 2.0;
  else if (conn?.effectiveType === "3g") factor *= 1.4;

  // 2. real-world load measurement
  const start = performance.now();
  await fetch("/portfolio/ping.jpg", { cache: "no-store" });
  const t = performance.now() - start;

  if (t > 500) factor *= 1.3;
  else if (t < 150) factor *= 0.8;

  return factor;
}
export const BASE_APPEAR_DELAY = 300;
const speedFactor = await getAdaptiveDelay();

export const APPEAR_DELAY = BASE_APPEAR_DELAY * speedFactor;

export const thumbnails = [
  {
    thumb: "./images/thumbnails/animatedTorus.png",
    full: "./images/animatedTorus.png",
  },
  {
    thumb: "./images/thumbnails/clay_effect.png",
    full: "./images/clay_effect.png",
  },
  {
    thumb: "./images/thumbnails/fortune_teller.png",
    full: "./images/fortune_teller.png",
  },
  {
    thumb: "./images/thumbnails/model_animation.png",
    full: "./images/model_animation.png",
  },
  {
    thumb: "./images/thumbnails/ohana_development.png",
    full: "./images/ohana_development.png",
  },
  {
    thumb: "./images/thumbnails/process_animation.png",
    full: "./images/process_animation.png",
  },
  {
    thumb: "./images/thumbnails/scroll_tsl_transition.png",
    full: "./images/scroll_tsl_transition.png",
  },
  {
    thumb: "./images/thumbnails/sphere_depth.png",
    full: "./images/sphere_depth.png",
  },
  { thumb: "./images/thumbnails/ssgi.png", full: "./images/ssgi.png" },
  {
    thumb: "./images/thumbnails/tron_racer.png",
    full: "./images/tron_racer.png",
  },
  { thumb: "./images/thumbnails/walking.png", full: "./images/walking.png" },
  { thumb: "./images/thumbnails/worley3.png", full: "./images/worley3.png" },
  {
    thumb: "./images/thumbnails/light_rays.jpg",
    full: "./images/light_rays.jpg",
  },
  {
    thumb: "./images/thumbnails/particle_cpp.jpg",
    full: "./images/particle_cpp.jpg",
  },
];
