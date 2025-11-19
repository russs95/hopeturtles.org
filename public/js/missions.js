const missionFilter = document.getElementById('missionFilter');
const missionCards = document.querySelectorAll('[data-mission-card]');
const mapContainers = document.querySelectorAll('[data-mission-map]');

const logMissionMap = (level, message, context = {}) => {
  if (typeof console === 'undefined') {
    return;
  }
  const payload = context && Object.keys(context).length > 0 ? context : '';
  const logger = console[level] || console.log;
  logger.call(console, `[missions] ${message}`, payload);
};

const logMissionMapInfo = (message, context) => logMissionMap('info', message, context);
const logMissionMapWarn = (message, context) => logMissionMap('warn', message, context);

// Some mission coordinates arrive with serialized quotes from the CMS/DB seed.
// We strip them but log when it happens so future regressions are easier to trace.
const sanitizeCoordinate = (value, context) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const hasEdgeQuotes = /^['"]/.test(trimmed) || /['"]$/.test(trimmed);
    if (hasEdgeQuotes) {
      logMissionMapWarn('Coordinate string included wrapping quotes. Stripping before parsing.', context);
    }
    return trimmed.replace(/^["']+|["']+$/g, '');
  }
  return value;
};

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
  if (!hasLeaflet) {
    logMissionMapWarn('Leaflet is not available. Mission maps will not render.');
    return;
  }
  if (!mapContainers.length) {
    logMissionMapInfo('No mission map containers found on this page.');
    return;
  }
  mapContainers.forEach((container) => {
    const canvas = container.querySelector('.map-canvas');
    const rawLat = container.dataset.lat;
    const rawLng = container.dataset.lng;
    const lat = parseCoordinate(sanitizeCoordinate(rawLat, { missionId, axis: 'lat', raw: rawLat }));
    const lng = parseCoordinate(sanitizeCoordinate(rawLng, { missionId, axis: 'lng', raw: rawLng }));
    const zoom = Number.parseFloat(container.dataset.zoom) || 7.2;
    const token = container.dataset.mapToken;
    const missionId = container.closest('[data-mission-card]')?.id || container.id || 'mission-map';

    if (!canvas) {
      logMissionMapWarn('Missing map canvas for mission card.', { missionId });
      return;
    }

    if (lat === null || lng === null) {
      logMissionMapWarn('Invalid mission coordinates. Skipping map.', {
        missionId,
        lat: container.dataset.lat,
        lng: container.dataset.lng
      });
      return;
    }

    logMissionMapInfo('Initializing mission map.', { missionId, lat, lng, zoom });

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
    } else {
      logMissionMapWarn('Tile layer could not be created for mission map.', { missionId });
    }
    map.attributionControl?.setPrefix('');
    map.setView([lat, lng], zoom);
    L.marker([lat, lng], { keyboard: false }).addTo(map);
    map.whenReady(() => {
      logMissionMapInfo('Mission map ready.', { missionId });
    });
    map.on('tileerror', () => {
      logMissionMapWarn('A tile failed to load for mission map.', { missionId });
    });
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
