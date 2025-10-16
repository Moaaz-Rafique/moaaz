// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { CRTFilter, DotFilter, GlitchFilter, GodrayFilter } from "pixi-filters";
import {
  Application,
  Assets,
  ColorMatrixFilter,
  Container,
  Sprite,
} from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "black", resizeTo: window });

  document.body.appendChild(app.canvas);

  const container = new Container();

  app.stage.addChild(container);

  const texture = await Assets.load("/thumbnails/model_animation.png");

  const image = new Sprite(texture);

  container.addChild(image);

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  // === Add a filter ===

  // 1️⃣ Godray light beam filter
  const godray = new GodrayFilter({
    parallel: false,
    gain: 0.4,
    lacunarity: 2.0,
    angle: 45,
  });

  const colorMatrix = new ColorMatrixFilter();
  colorMatrix.contrast(1.3);
  colorMatrix.brightness(1.1, true);
  colorMatrix.tint(0xffaacc, false);

  const crt = new CRTFilter({
    curvature: 2,
    lineWidth: 2,
    noise: 0.05,
    vignetting: 0.2,
    vignettingAlpha: 0.5,
  });

  const glitch = new GlitchFilter();

  container.filters = [godray, colorMatrix, crt, glitch];
})();
