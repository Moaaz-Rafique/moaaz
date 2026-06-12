export async function fetchOSMData(lat, lng, cache) {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache[cacheKey]) return cache[cacheKey];
  document.getElementById("osmStatus").classList.remove("hidden");
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: { "User-Agent": "LocationIntelligenceSystem/2.0" },
      },
    );
    const data = await response.json();
    const result = {
      type: data.type || "POI",
      name: data.name || "Established Point",
    };
    cache[cacheKey] = result;
    return result;
  } finally {
    document.getElementById("osmStatus").classList.add("hidden");
  }
}
