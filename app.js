const image = "/dummy_600x400_ffffff_cccccc.png";
const projects = [
  {
    title: "Animated Torus",
    url: "https://brush-strokes.vercel.app/animatedTorus.html",
    image: "animatedTorus",
    description:
      "An animated torus that dynamically flips inside-out with controllable distortion, radius parameters, and influence meters.",
    seniority: 4,
    relevance: 4,
    portfolioReady: true,
    tech: [
      "Three.js",
      "GLSL shaders",
      "Geometry Distortion",
      "Interactive Controls",
    ],
    notes:
      "Strong shader/geometry showcase — polish with camera transitions, a UI overlay explaining parameters, or apply the flipping effect to different models for broader impact.",
  },
  {
    title: "Ohana Development",
    url: "https://ohana-development-0.vercel.app/",
    image: "ohana_development",
    description:
      "Interactive website for a real estate brand. Uses 2d and 3d visuals, and smooth scroll animations.",
    seniority: 4,
    relevance: 5,
    portfolioReady: true,
    tech: [
      "Three.js",
      "Scroll-based animation",
      "Camera pathing",
      "GLSL shaders",
    ],
    notes:
      "Already polished — adding scroll-based parallax or subtle 3D interactions would make it agency-grade.",
  },
  {
    title: "Worley Noise",
    url: "https://brush-strokes.vercel.app/worley3.html",
    image: "worley3",
    description:
      "Interactive procedural Worley noise shader with vertex displacement and extensive material controls. Users can tweak PBR-like parameters (color, roughness, metalness, transmission, clearcoat, specular, opacity, etc.) alongside noise settings to explore both surface appearance and geometry deformation.",
    seniority: 4,
    relevance: 5,
    portfolioReady: true,
    tech: [
      "GLSL shaders",
      "Noise functions",
      "Vertex displacement",
      "Custom PBR materials",
      "Interactive uniforms",
      "Three.js",
    ],
    notes:
      "Now this is more than a noise demo — it’s effectively a mini shader/material lab. To boost portfolio impact: package it as a 'Procedural Material Explorer' with presets (e.g., glass, clay, metal) and export options (textures or materials).",
  },
  {
    title: "Basic TSL Transitions and Scroll Animations",
    url: "./scroll-and-tsl-transitions.html",
    image: "scroll_tsl_transition",
    description:
      "Three.js post-processing demo using TSL nodes. Implements dynamic transitions between Sobel and DotScreen effects with noise-driven variations.",
    seniority: 4,
    relevance: 5,
    portfolioReady: true,
    tech: [
      "Three.js",
      "WebGPU",
      "TSL nodes",
      "Post-processing",
      "Procedural noise",
      "Shader transitions",
      "GSAP animations",
      "Interactive scroll",
    ],
    notes:
      "The project demonstrates both shader logic (TSL transitions, noise blending) and interactive scene control (scroll-based section switching, camera parallax, particle system). To enhance portfolio value, consider adding presets for different transition styles, and optionally expose uniforms for live tweaking in a GUI.",
  },
  {
    title: "Sphere Depth",
    url: "https://brush-strokes.vercel.app/sphereDepth.html",
    image: "sphere_depth",
    description:
      "Animated depth-shading experiment using postprocessing and custom depth shaders.",
    seniority: 4,
    relevance: 3,
    portfolioReady: false,
    tech: ["Three.js", "Postprocessing", "Depth Shaders", "GLSL"],
    notes:
      "Make it more relevant by adding interactivity (user-controlled light/camera) or applying the depth technique in a practical use case like fog effects or stylized rendering.",
  },
  {
    title: "Process Animation",
    url: "https://process-animation.vercel.app/",
    image: "process_animation",
    description:
      "Fragment shader animations representing AI states such as idle, standby, listening, and processing.",
    seniority: 3,
    relevance: 3,
    portfolioReady: false,
    tech: ["GLSL shaders", "Fragment Shaders", "UI Feedback"],
    notes:
      "Increase impact by tying animations directly to real user input (e.g., mic state, API responses) or presenting as part of an interactive UI system.",
  },
  {
    title: "Tron Track Visualization",
    url: "https://tron-racer-git-all-trails-soct.vercel.app/",
    image: "tron_racer",
    description:
      "A visualization for a tron racer game with different trails using fragment shaders ",
    seniority: 3,
    relevance: 3,
    portfolioReady: true,
    tech: ["GLSL shaders", "Fragment Shaders", "UI Feedback"],
    notes: "",
  },
  {
    title: "TSL SSGI Scene",
    url: "./testingssgi.html",
    image: "ssgi",
    description:
      "Advanced Three.js WebGPU demo showcasing TSL-based post-processing pipelines. Implements screen-space global illumination (SSGI) with interactive controls. Users can manipulate lights, objects, and scene parameters while observing real-time GI, AO, and composite outputs via inspector GUI.",
    seniority: 5,
    relevance: 5,
    portfolioReady: true,
    tech: [
      "Three.js",
      "WebGPU",
      "TSL nodes",
      "SSGI (Screen-space Global Illumination)",
      "TRAA (Temporal Anti-Aliasing)",
      "Shader post-processing",
      "Interactive inspector GUI",
      "Dynamic scene lighting",
    ],
    notes:
      "This project demonstrates advanced real-time rendering techniques and interactive scene manipulation. For portfolio impact: highlight the SSGI and TRAA effects, show inspector-based tweaking, and optionally include preset camera views or lighting scenarios for storytelling purposes.",
  },
  {
    title: "Clay Effect",
    url: "https://clay-effect.vercel.app/",
    image: "clay_effect",
    description:
      "Stylized clay shader applied to architectural geometry. AO shading.",
    seniority: 4,
    relevance: 3,
    portfolioReady: true,
    tech: [
      "Three.js",
      "GLSL shaders",
      "Custom Material",
      "AO-inspired shading",
    ],
    notes:
      "Enhance relevance by applying it to characters or animating the architecture to showcase the shader in motion.",
  },
  {
    title: "Crowd Walking",
    url: "https://hologram-effect-threejs.vercel.app/walking.html",
    image: "walking",
    description:
      "Simulation of multiple animated characters walking, exploring crowd dynamics and instancing efficiency.",
    seniority: 4,
    relevance: 4,
    portfolioReady: true,
    tech: ["Three.js", "Animation Mixer", "Instancing", "Crowd Simulation"],
    notes:
      "Add flocking/AI behavior or link it to architectural/entertainment contexts to elevate it as a case study.",
  },
];
const complimentaryProjects = [
  {
    title: "Particle System (C++/OpenGL + Dear ImGui)",
    description:
      "Built a GPU-driven particle system with real-time parameter controls via Dear ImGui.",
    tech: ["C++", "OpenGL", "Dear ImGui", "GPU Buffers"],
    relevanceScore: 4,
    seniorityScore: 4,
    notes:
      "Strong technical project showing low-level GPU control. Could improve by porting to WebGL or WebGPU for direct portfolio relevance.",
  },
  {
    title: "OpenGL Model Loader",
    description:
      "Implemented a pipeline to load and render 3D models using vertex and index buffers with UI controls via ImGui.",
    tech: ["C++", "OpenGL", "Dear ImGui"],
    relevanceScore: 3,
    seniorityScore: 4,
    notes:
      "Solid graphics fundamentals. Making a WebGL-based loader or integrating with Three.js would make it more portfolio-relevant.",
  },
  {
    title: "Aerodynamic Simulation (Blender Geometry Nodes)",
    description:
      "Simulated aerodynamic flows around 3D geometry using Blender’s procedural nodes system (model credit: Vecarz on Sketchfab).",
    tech: ["Blender Geometry Nodes"],
    relevanceScore: 3,
    seniorityScore: 3,
    notes:
      "Shows creative procedural skills. To increase relevance, export to WebGL (e.g., baking animation and rendering in Three.js).",
  },
  {
    title: "Spline Study (Animated Cubes)",
    description:
      "Explored spline.com to animate a multi-level cube structure with dynamic scaling and reshaping.",
    tech: ["Spline", "Perlin Noise", "3D Animation"],
    relevanceScore: 3,
    seniorityScore: 3,
    notes:
      "Nice math-heavy experiment. Porting to GLSL or WebGL shader form would make it more demonstrable in a browser portfolio.",
  },
  {
    title: "Mouse Trails & Background Interactions (p5.js)",
    description:
      "Interactive mouse trails with curve-based drawing and reactive background effects.",
    tech: ["p5.js", "WebGL Mode", "JavaScript"],
    relevanceScore: 2,
    seniorityScore: 2,
    notes:
      "Good entry-level creative coding project. Enhance with more advanced shader or physics effects for higher seniority signaling.",
  },
  {
    title: "Photogrammetry & Depth Estimation (Python)",
    description:
      "Reconstructed 3D scenes from images using OpenCV and Open3D, with monocular depth estimation models.",
    tech: ["Python", "OpenCV", "Open3D", "PyTorch/TensorFlow"],
    relevanceScore: 5,
    seniorityScore: 5,
    notes:
      "Very strong project — shows advanced applied graphics + ML. Could integrate with WebGL by visualizing reconstructions in-browser.",
  },
  {
    title: "Paint Application (C++/SFML)",
    description:
      "Developed a basic 2D paint app with brush tools, colors, and canvas manipulation.",
    tech: ["C++", "SFML"],
    relevanceScore: 2,
    seniorityScore: 2,
    notes:
      "Simple but demonstrates UI + input handling. Consider rebuilding in WebGL or Fabric.js to align better with web portfolio.",
  },
  {
    title: "Block Breaker (Unity)",
    description:
      "Classic block-breaker game with paddle, ball physics, and power-ups.",
    tech: ["Unity", "C#"],
    relevanceScore: 2,
    seniorityScore: 2,
    notes:
      "Fun project but less relevant to WebGL/web graphics. Could remake in Three.js or R3F to show transferable skills.",
  },
  {
    title: "Shooter Game (Java)",
    description:
      "2D top-down shooter with player movement, shooting mechanics, and enemy AI.",
    tech: ["Java", "Java2D/LibGDX"],
    relevanceScore: 1,
    seniorityScore: 2,
    notes:
      "Shows gameplay and systems thinking, but Java is less relevant. A WebGL/TypeScript version would be stronger.",
  },
  {
    title: "Blender Animation History",
    description:
      "Explored Blender across multiple styles: photorealistic, toon shading, architecture, natural scenes, surreal concepts, motion graphics, and classic animations.",
    tech: ["Blender (Cycles, Eevee, Geometry Nodes, Grease Pencil)"],
    relevanceScore: 3,
    seniorityScore: 3,
    notes:
      "Diverse background in 3D production. To increase portfolio impact, bake animations into GLTF/GLB and present in a WebGL viewer.",
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
      : `<img src="/thumbnails/${project.image}.png" alt="${project.title}" />`;

  const techList = project.tech
    ? `<ul class="tech">${project.tech
        .map((t) => `<li>${t}</li>`)
        .join("")}</ul>`
    : "";

  card.innerHTML = `
    ${preview}
    <div class="card-content">
      <h2>${project.title}</h2>
      <p class="description">${project.description}</p>
      ${techList}
    </div>
  `;

  container.appendChild(card);
});

const complimentaryContainer = document.getElementById("complimentaryGrid");

function renderComplimentary(list, containerEl) {
  list.forEach((project) => {
    const card = document.createElement("div");
    card.className = "card complimentary-card";

    const preview = project.image
      ? `<img src="/thumbnails/${project.image}.png" alt="${project.title}" />`
      : "";

    const techList = project.tech
      ? `<ul class="tech small">${project.tech
          .map((t) => `<li>${t}</li>`)
          .join("")}</ul>`
      : "";

    card.innerHTML = `
      ${preview}
      <div class="card-content">
        <span class="badge">Experiment</span>
        <h3>${project.title}</h3>
        <p class="description small">${project.description}</p>
        ${techList}
      </div>
    `;

    containerEl.appendChild(card);
  });
}

renderComplimentary(complimentaryProjects, complimentaryContainer);
