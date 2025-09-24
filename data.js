const projects = [
  {
    title: "Animated Torus",
    url: "https://brush-strokes.vercel.app/animatedTorus.html",
    image: null,
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
    image: "screenshots/ohana_development.png",
    description:
      "Interactive storytelling microsite for a real estate brand. Uses 2d and 3d visuals, smooth scroll animations, and narrative-driven transitions.",
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
    title: "Custom UV Editor",
    url: "https://custom-uv-editor.vercel.app/",
    image: "screenshots/custom_uv_editor.png",
    description:
      "Advanced WebGL/Three.js demo for geometry and material workflows: custom UV projections, multi-channel UV mapping, video textures, synchronized cameras, instancing, mesh slicing, and CSG.",
    seniority: 5,
    relevance: 4,
    portfolioReady: true,
    tech: [
      "Three.js",
      "WebGL Buffers",
      "Geometry Manipulation",
      "Video Textures",
      "Instancing",
      "CSG",
      "UV Mapping",
    ],
    notes:
      "Strong technical demo. To maximize portfolio impact: add a user-friendly editor UI, show a practical application (e.g., product configurator), and highlight performance scalability.",
  },
  {
    title: "Worley Noise",
    url: "https://brush-strokes.vercel.app/worley3.html",
    image: null,
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
    title: "Crowd Walking",
    url: "https://hologram-effect-threejs.vercel.app/walking.html",
    image: null,
    description:
      "Simulation of multiple animated characters walking, exploring crowd dynamics and instancing efficiency.",
    seniority: 4,
    relevance: 4,
    portfolioReady: true,
    tech: ["Three.js", "Animation Mixer", "Instancing", "Crowd Simulation"],
    notes:
      "Add flocking/AI behavior or link it to architectural/entertainment contexts to elevate it as a case study.",
  },
  {
    title: "Clay Effect",
    url: "https://clay-effect.vercel.app/",
    image: "screenshots/clay_effect.png",
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
    title: "Sphere Depth",
    url: "https://brush-strokes.vercel.app/sphereDepth.html",
    image: "screenshots/sphere_depth.png",
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
    image: "screenshots/process_animation.png",
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
    title: "Fortune Teller",
    url: "https://fortune-teller-web.vercel.app/",
    image: "screenshots/fortune_teller.png",
    description:
      "A interactive WebGL fortune teller. Combines 3D interaction and visuals to deliver an engaging experience.",
    seniority: 3,
    relevance: 2,
    portfolioReady: true,
    tech: ["Three.js", "Interactive UI"],
    notes:
      "Already strong — add atmospheric audio, smoother transitions, and polish visuals for a portfolio centerpiece.",
  },
  {
    title: "WebGL Animation Components",
    url: "https://webgl-animation-components.vercel.app/",
    image: null,
    description:
      "Library of reusable animation components for WebGL and Three.js, built for rapid prototyping of interactive effects.",
    seniority: 3,
    relevance: 3,
    portfolioReady: false,
    tech: ["Three.js", "Component Design", "Reusable Animations"],
    notes:
      "Showcase these powering a polished site or interactive demo — otherwise, it feels like background utility work rather than a highlight.",
  },
];