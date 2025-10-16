import * as PIXI from "pixi.js";
import { GodrayFilter } from "pixi-filters";

export default async function App() {
  // Create PIXI Application
  const app = new PIXI.Application();
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    background: "#1e1e1e",
  });

  // Add canvas to DOM
  document.body.appendChild(app.canvas);

  // Load texture
  const texture = await PIXI.Assets.load("/thumbnails/model_animation.png");

  // Create sprite
  const sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.x = app.screen.width / 2;
  sprite.y = app.screen.height / 2;
  sprite.scale.set(0.5);

  app.stage.addChild(sprite);

  // Apply filter from pixi-filters
  // const filter = new GodrayFilter({
  //   parallel: false,
  //   gain: 0.5,
  //   lacunarity: 2.0,
  //   angle: 45,
  // });

  // sprite.filters = [filter];

  // Animate
  app.ticker.add((delta) => {
    filter.time += 0.01 * delta;
    sprite.rotation += 0.01 * delta;
  });

  // Resize listener
  window.addEventListener("resize", () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    sprite.position.set(app.screen.width / 2, app.screen.height / 2);
  });
}
