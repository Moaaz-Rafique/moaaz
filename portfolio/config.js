export async function getNetworkSpeedFactor() {
  const start = performance.now();

  await fetch("/portfolio/dist.png?cache=" + Date.now(), {
    cache: "no-store",
  });

  const duration = performance.now() - start;

  // rough mapping
  if (duration < 150) return 0.6; // fast internet
  if (duration < 400) return 1.0; // normal
  return 1.6; // slow
}
export const BASE_APPEAR_DELAY = 300;
const speedFactor = await getNetworkSpeedFactor();

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
