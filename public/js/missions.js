const missionFilter = document.getElementById('missionFilter');
const missionList = document.querySelector('.mission-list');
const mapCanvas = document.getElementById('mapCanvas');
const DEFAULT_CENTER = [0, 0];
const DEFAULT_ZOOM = 5.5;
let map;
let markers = [];

const mapboxToken = mapCanvas?.parentElement?.dataset.mapToken;

const parseCoordinate = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getTileLayer = () => {
  if (mapboxToken) {
    return L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      {
        attribution: '© Mapbox © OpenStreetMap',
        tileSize: 512,
        zoomOffset: -1
      }
    );
  }
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });
};

const initMap = () => {
  if (!mapCanvas) return;
  map = L.map('mapCanvas').setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  getTileLayer().addTo(map);
};

const clearMarkers = () => {
  markers.forEach((marker) => marker.remove());
  markers = [];
};

const renderMarkers = (missions = []) => {
  if (!map) return;
  clearMarkers();
  let viewHasBeenSet = false;
  missions
    .map((mission) => {
      const lat = parseCoordinate(mission.target_lat);
      const lng = parseCoordinate(mission.target_lng);
      return lat === null || lng === null
        ? null
        : {
            ...mission,
            target_lat: lat,
            target_lng: lng
          };
    })
    .filter(Boolean)
    .forEach((mission) => {
      const marker = L.marker([mission.target_lat, mission.target_lng]).addTo(map);
      marker.bindPopup(
        `<strong>${mission.name}</strong><br/>Status: ${mission.status}<br/>Lat: ${mission.target_lat}<br/>Lng: ${mission.target_lng}`
      );
      markers.push(marker);
      if (!viewHasBeenSet) {
        map.setView([mission.target_lat, mission.target_lng], DEFAULT_ZOOM);
        viewHasBeenSet = true;
      }
    });
  if (!viewHasBeenSet) {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  }
};

const fetchMissions = async (status = '') => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`/api/missions${query}`);
  const json = await response.json();
  if (json.success) {
    renderMarkers(json.data);
  }
};

const filterCards = (status) => {
  if (!missionList) return;
  missionList.querySelectorAll('.card').forEach((card) => {
    const match = !status || card.dataset.status === status;
    card.style.display = match ? 'block' : 'none';
  });
};

if (missionFilter) {
  missionFilter.addEventListener('change', (event) => {
    const status = event.target.value;
    filterCards(status);
    fetchMissions(status).catch(() => {});
  });
}

initMap();
fetchMissions().catch(() => {});
