import { Experience } from "./Experience.js";
import { Gallery } from "./Gallery.js";

async function initApp() {
  // Initialize Core System
  const experience = new Experience("canvas.webgl");
  await experience.init();

  // Initialize Gallery Module
  const gallery = new Gallery(experience);
  gallery.build();

  // Connect Gallery updating routine to the central main framework loop
  experience.addUpdateCallback((now) => gallery.update(now));

  // Toggle "Ready" states via UI elements if necessary
  // (e.g. tracking click behaviors on your designated #btn element)
  const btn = document.getElementById("btn");
  if (btn) {
    btn.addEventListener("click", () => {
      // Toggle ready state once requirements are met
      gallery.isReady = true;
    });
  }
}

// Fire application
initApp();
