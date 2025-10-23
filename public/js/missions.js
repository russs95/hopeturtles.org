const missionFilter = document.getElementById('missionFilter');
const missionList = document.querySelector('.mission-list');
const mapCanvas = document.getElementById('mapCanvas');
let map;
let markers = [];

const mapboxToken = mapCanvas?.parentElement?.dataset.mapToken;

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
  map = L.map('mapCanvas').setView([0, 0], 2);
  getTileLayer().addTo(map);
};

const clearMarkers = () => {
  markers.forEach((marker) => marker.remove());
  markers = [];
};

const renderMarkers = (missions = []) => {
  if (!map) return;
  clearMarkers();
  missions
    .filter((mission) => mission.target_lat && mission.target_lng)
    .forEach((mission) => {
      const marker = L.marker([mission.target_lat, mission.target_lng]).addTo(map);
      marker.bindPopup(
        `<strong>${mission.name}</strong><br/>Status: ${mission.status}<br/>Lat: ${mission.target_lat}<br/>Lng: ${mission.target_lng}`
      );
      markers.push(marker);
    });
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
