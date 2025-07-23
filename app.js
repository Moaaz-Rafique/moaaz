const image = "/dummy_600x400_ffffff_cccccc.png";
const projects = [
  {
    title: "Trail Test",
    url: "https://brush-strokes.vercel.app/trailTest.html",
    image: "https://via.placeholder.com/300x200?text=Trail+Test",
    iframe: true,
  },
  {
    title: "Matcap",
    url: "https://brush-strokes.vercel.app/matcap.html",
    image: "https://via.placeholder.com/300x200?text=Matcap",
    iframe: true,
  },
  {
    title: "Sphere Depth",
    url: "https://brush-strokes.vercel.app/sphereDepth.html",
    image: "https://via.placeholder.com/300x200?text=Sphere+Depth",
    iframe: true,
  },
  {
    title: "Worley Noise",
    url: "https://brush-strokes.vercel.app/worley3.html",
    image: "https://via.placeholder.com/300x200?text=Worley+Noise",
    iframe: true,
  },
  {
    title: "Wall Generation",
    url: "https://brush-strokes.vercel.app/wallGeneration.html",
    image: "https://via.placeholder.com/300x200?text=Wall+Gen",
    iframe: true,
  },
  {
    title: "Hologram Effect",
    url: "https://hologram-effect-threejs.vercel.app/hologram.html",
    image: "https://via.placeholder.com/300x200?text=Hologram",
    iframe: true,
  },
  {
    title: "Hologram Sprite",
    url: "https://hologram-effect-threejs.vercel.app/sprite.html",
    image: "https://via.placeholder.com/300x200?text=Sprite",
    iframe: true,
  },
  {
    title: "Hologram Walking",
    url: "https://hologram-effect-threejs.vercel.app/walking.html",
    image: "https://via.placeholder.com/300x200?text=Walking",
    iframe: true,
  },
  {
    title: "Thermal Effect",
    url: "https://thermal-effect.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Thermal+Effect",
    iframe: true,
  },
  {
    title: "Clay Effect",
    url: "https://clay-effect.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Clay+Effect",
    iframe: true,
  },
  {
    title: "Chiac",
    url: "https://chiac.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Chiac",
    iframe: true,
  },
  {
    title: "Yin Yang Config",
    url: "https://yin-yang-config.vercel.app/zimtest.html",
    image: "https://via.placeholder.com/300x200?text=Yin+Yang",
    iframe: true,
  },
  {
    title: "Process Animation",
    url: "https://process-animation.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Process+Animation",
    iframe: true,
  },
  {
    title: "Ohana Development",
    url: "https://ohana-development-0.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Ohana",
    iframe: true,
  },
  {
    title: "WebGL Animation Components",
    url: "https://webgl-animation-components.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Animation+Components",
    iframe: true,
  },
  {
    title: "Fortune Teller",
    url: "https://fortune-teller-web.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Fortune+Teller",
    iframe: true,
  },
  {
    title: "Interactive Animations R3F",
    url: "https://interactive-animations-r3f.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Interactive+R3F",
    iframe: true,
  },
  {
    title: "Ring Configuration",
    url: "https://ring-configration.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Ring+Config",
    iframe: true,
  },
  {
    title: "UV Video",
    url: "https://custom-uv-editor.vercel.app/video.html",
    image: "https://via.placeholder.com/300x200?text=UV+Video",
    iframe: true,
  },
  {
    title: "Same Camera",
    url: "https://custom-uv-editor.vercel.app/same-camera.html",
    image: "https://via.placeholder.com/300x200?text=Same+Camera",
    iframe: true,
  },
  {
    title: "Multiple Projections",
    url: "https://custom-uv-editor.vercel.app/multiple-projections.html",
    image: "https://via.placeholder.com/300x200?text=Multi+Proj",
    iframe: true,
  },
  {
    title: "Multiple Proj Instancing",
    url: "https://custom-uv-editor.vercel.app/multiple-projections-instancing.html",
    image: "https://via.placeholder.com/300x200?text=Multi+Proj+Instancing",
    iframe: true,
  },
  {
    title: "Cut Mesh Using Plane",
    url: "https://custom-uv-editor.vercel.app/CutMeshUsingPlane.html",
    image: "https://via.placeholder.com/300x200?text=Cut+Mesh",
    iframe: true,
  },
  {
    title: "Model Animation",
    url: "https://custom-uv-editor.vercel.app/model-animation.html",
    image: "https://via.placeholder.com/300x200?text=Model+Anim",
    iframe: true,
  },
  {
    title: "3D Model with CSG",
    url: "https://custom-uv-editor.vercel.app/3d-model-with-csg.html",
    image: "https://via.placeholder.com/300x200?text=CSG+Model",
    iframe: true,
  },
  {
    title: "Product Configurator",
    url: "https://product-configurator-cyan.vercel.app/",
    image: "https://via.placeholder.com/300x200?text=Configurator",
    iframe: true,
  },
];

const container = document.getElementById("projectGrid");

projects.forEach((project) => {
  const card = document.createElement("a");
  card.className = "card";
  card.href = project.url;
  card.target = "_blank";
  card.rel = "noopener";

  const preview =
    project.iframe && false
      ? `<iframe src="${project.url}"></iframe>`
      : `<img 
          src=${image} 
          alt="${project.title}" />`;

  card.innerHTML = `
    ${preview}
    <h2>${project.title}</h2>
  `;

  container.appendChild(card);
});
