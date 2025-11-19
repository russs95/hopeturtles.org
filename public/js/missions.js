const missionFilter = document.getElementById('missionFilter');
const missionCards = document.querySelectorAll('[data-mission-card]');
const mapContainers = document.querySelectorAll('[data-mission-map]');

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

const hasLeaflet = typeof window !== 'undefined' && typeof window.L !== 'undefined';

const createTileLayer = (token) => {
  if (!hasLeaflet) {
    return null;
  }
  if (token) {
    return L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${token}`,
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

const initMissionMaps = () => {
  if (!hasLeaflet || !mapContainers.length) {
    return;
  }
  mapContainers.forEach((container) => {
    const canvas = container.querySelector('.map-canvas');
    const lat = parseCoordinate(container.dataset.lat);
    const lng = parseCoordinate(container.dataset.lng);
    const zoom = Number.parseFloat(container.dataset.zoom) || 7.2;
    const token = container.dataset.mapToken;

    if (!canvas || lat === null || lng === null) {
      return;
    }

    const map = L.map(canvas, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      keyboard: false,
      tap: false,
      touchZoom: false
    });

    const tileLayer = createTileLayer(token);
    if (tileLayer) {
      tileLayer.addTo(map);
    }
    map.attributionControl?.setPrefix('');
    map.setView([lat, lng], zoom);
    L.marker([lat, lng], { keyboard: false }).addTo(map);
    window.setTimeout(() => {
      map.invalidateSize();
    }, 50);
  });
};

const filterCards = (status) => {
  missionCards.forEach((card) => {
    const match = !status || card.dataset.status === status;
    card.hidden = !match;
    card.setAttribute('aria-hidden', match ? 'false' : 'true');
  });
};

if (missionFilter) {
  missionFilter.addEventListener('change', (event) => {
    filterCards(event.target.value);
  });
}

initMissionMaps();
