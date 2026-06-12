import { fetchOSMData } from "./apiService.js";
import { calculateHaversine, parseCoords } from "./processor.js";
let mapInstance; // Declare variable here

document.addEventListener("DOMContentLoaded", () => {
  // 1. Now the container with id="map" definitely exists
  mapInstance = L.map("map").setView([33.6844, 73.0479], 12);

  // 2. Setup the tile layer
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  }).addTo(mapInstance);

  console.log("Map initialized successfully");
});
let globalStateData = null;
// let mapInstance = L.map("map").setView([33.6844, 73.0479], 12);
let mapLayers = [];
let osmCache = {};

L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
).addTo(mapInstance);

async function processDataPayload(data) {
  globalStateData = data;
  // Perform data enrichment
  for (let place of globalStateData.userLocationProfile.frequentPlaces) {
    const coord = parseCoords(place.placeLocation);
    if (coord) {
      const resolved = await fetchOSMData(coord.lat, coord.lng, osmCache);
      place.osmResolvedName = resolved.name;
    }
  }
  renderUI();
}

function renderUI() {
  // Logic for drawing map markers, charts, and lists goes here
  console.log("Rendering data...", globalStateData);
}

document.getElementById("fileInput").addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = (ev) => processDataPayload(JSON.parse(ev.target.result));
  reader.readAsText(e.target.files[0]);
});
