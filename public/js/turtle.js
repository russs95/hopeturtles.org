const container = document.querySelector('main[data-turtle-id]');
const tableBody = document.getElementById('telemetryTable');
const mapContainer = document.getElementById('turtleMap');
let map;
let pathLayer;

if (container && mapContainer) {
  const turtleId = container.dataset.turtleId;
  const lastLat = Number(container.dataset.lastLat || 0);
  const lastLng = Number(container.dataset.lastLng || 0);
  const mapboxToken = mapContainer.parentElement.dataset.mapToken;

  const createTileLayer = () => {
    if (mapboxToken) {
      return L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
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

  map = L.map('turtleMap').setView([lastLat || 0, lastLng || 0], lastLat ? 6 : 2);
  createTileLayer().addTo(map);

  const updateTable = (rows) => {
    if (!tableBody) return;
    tableBody.innerHTML = rows
      .map(
        (item) => `
        <tr>
          <td>${item.timestamp}</td>
          <td>${item.latitude}</td>
          <td>${item.longitude}</td>
          <td>${item.battery_voltage}</td>
          <td>${item.temp_c}</td>
          <td>${item.connection}</td>
        </tr>`
      )
      .join('');
  };

  const updateMap = (rows) => {
    if (!map) return;
    if (pathLayer) {
      pathLayer.remove();
    }
    const points = rows
      .filter((item) => item.latitude && item.longitude)
      .map((item) => [Number(item.latitude), Number(item.longitude)]);
    if (!points.length) return;
    pathLayer = L.polyline(points, { color: '#017919', weight: 3 }).addTo(map);
    map.fitBounds(pathLayer.getBounds(), { padding: [40, 40] });
  };

  const fetchTelemetry = async () => {
    const response = await fetch(`/api/telemetry/${turtleId}?limit=100`);
    const json = await response.json();
    if (json.success) {
      updateTable(json.data);
      updateMap(json.data.slice().reverse());
    }
  };

  fetchTelemetry().catch(() => {});
  setInterval(fetchTelemetry, 10000);
}
