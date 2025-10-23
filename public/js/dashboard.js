const statusChartEl = document.getElementById('statusChart');
const telemetryChartEl = document.getElementById('telemetryChart');
let statusChart;
let telemetryChart;

const buildStatusChart = (ctx, stats) => {
  const labels = stats.missionsByStatus.map((row) => row.status);
  const missionData = stats.missionsByStatus.map((row) => row.total);
  const turtleLabels = stats.turtlesByStatus.map((row) => row.status);
  const turtleData = stats.turtlesByStatus.map((row) => row.total);

  statusChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Missions',
          data: missionData,
          backgroundColor: '#0077b6'
        },
        {
          label: 'Turtles',
          data: turtleData,
          backgroundColor: '#00b4d8'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const buildTelemetryChart = (ctx, stats) => {
  const labels = stats.telemetryRate.map((row) => row.bucket);
  const values = stats.telemetryRate.map((row) => row.readings);
  telemetryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Telemetry readings/hour',
          data: values,
          borderColor: '#90e0ef',
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

const refreshStats = async () => {
  const response = await fetch('/api/stats');
  const json = await response.json();
  if (!json.success) return;
  if (!statusChart) {
    buildStatusChart(statusChartEl, json.data);
  } else {
    statusChart.data.labels = json.data.missionsByStatus.map((row) => row.status);
    statusChart.data.datasets[0].data = json.data.missionsByStatus.map((row) => row.total);
    statusChart.data.datasets[1].data = json.data.turtlesByStatus.map((row) => row.total);
    statusChart.update();
  }

  if (!telemetryChart) {
    buildTelemetryChart(telemetryChartEl, json.data);
  } else {
    telemetryChart.data.labels = json.data.telemetryRate.map((row) => row.bucket);
    telemetryChart.data.datasets[0].data = json.data.telemetryRate.map((row) => row.readings);
    telemetryChart.update();
  }
};

if (statusChartEl && telemetryChartEl) {
  refreshStats().catch(() => {});
  setInterval(refreshStats, 30000);
}
