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
          backgroundColor: '#017919'
        },
        {
          label: 'Turtles',
          data: turtleData,
          backgroundColor: '#23b053'
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
          borderColor: '#5ba26b',
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

const registerBottleDialog = document.getElementById('registerBottleDialog');
const registerBottleForm = registerBottleDialog?.querySelector('[data-register-bottle-form]') ?? null;
const registerBottleFeedback = registerBottleDialog?.querySelector('[data-register-bottle-feedback]') ?? null;
const openRegisterBottleButton = document.querySelector('[data-open-register-bottle]');
const closeRegisterBottleButtons = registerBottleDialog
  ? registerBottleDialog.querySelectorAll('[data-close-register-bottle]')
  : [];
const bottlesTableWrapper = document.querySelector('[data-my-bottles-table]');
const bottlesTableBody = document.querySelector('[data-my-bottles-body]');
const bottlesEmptyState = document.querySelector('[data-my-bottles-empty]');
const bottlesFeedback = document.querySelector('[data-my-bottles-feedback]');
const bottleDeliveryDialog = document.getElementById('bottleDeliveryDetailsDialog');
const bottleDeliverySerialValue =
  bottleDeliveryDialog?.querySelector('[data-bottle-delivery-serial-value]') ?? null;
const bottleDeliveryHubSection =
  bottleDeliveryDialog?.querySelector('[data-bottle-delivery-hub]') ?? null;
const bottleDeliveryHubName =
  bottleDeliveryDialog?.querySelector('[data-bottle-delivery-hub-name]') ?? null;
const bottleDeliveryHubAddress =
  bottleDeliveryDialog?.querySelector('[data-bottle-delivery-hub-address]') ?? null;
const closeBottleDeliveryButtons = bottleDeliveryDialog
  ? bottleDeliveryDialog.querySelectorAll('[data-close-bottle-delivery]')
  : [];

const escapeHtml = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).replace(/[&<>'"]/gu, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
};

const escapeAttribute = (value) => escapeHtml(value).replace(/`/gu, '&#96;');

const slugifyStatus = (value) =>
  value ? value.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '') : '';

const formatBottleStatusLabel = (value) => {
  if (!value) {
    return '—';
  }
  return value
    .split(/\s+/gu)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatBottleWeight = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return '—';
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return '—';
  }
  return `${numeric.toLocaleString()} g`;
};

const formatBottleContents = (value) => {
  if (!value) {
    return '—';
  }
  return escapeHtml(value).replace(/\r?\n/gu, '<br />');
};

const formatMultilineText = (value) => {
  if (!value) {
    return '';
  }
  return escapeHtml(value).replace(/\r?\n/gu, '<br />');
};

const toggleBottlesTableState = () => {
  if (!bottlesTableWrapper || !bottlesEmptyState || !bottlesTableBody) {
    return;
  }
  const hasRows = bottlesTableBody.children.length > 0;
  bottlesTableWrapper.hidden = !hasRows;
  bottlesEmptyState.hidden = hasRows;
};

const showBottleDeliveryModal = (bottle) => {
  if (!bottleDeliveryDialog || !bottle) {
    return;
  }

  const serialNumber = bottle.serial_number ? String(bottle.serial_number) : '';
  if (bottleDeliverySerialValue) {
    bottleDeliverySerialValue.textContent = serialNumber || '—';
  }

  const hubName = bottle.hub_name ? String(bottle.hub_name) : '';
  const hubAddress = bottle.hub_mailing_address ? String(bottle.hub_mailing_address) : '';
  const hasHubInfo = Boolean(hubName || hubAddress);

  if (bottleDeliveryHubSection) {
    bottleDeliveryHubSection.hidden = !hasHubInfo;
  }

  if (hasHubInfo) {
    if (bottleDeliveryHubName) {
      bottleDeliveryHubName.textContent = hubName;
    }
    if (bottleDeliveryHubAddress) {
      bottleDeliveryHubAddress.innerHTML = formatMultilineText(hubAddress);
    }
  } else {
    if (bottleDeliveryHubName) {
      bottleDeliveryHubName.textContent = '';
    }
    if (bottleDeliveryHubAddress) {
      bottleDeliveryHubAddress.innerHTML = '';
    }
  }

  bottleDeliveryDialog.showModal();
};

const showBottlesFeedback = (message, isError = false) => {
  if (!bottlesFeedback) {
    return;
  }

  if (!message) {
    bottlesFeedback.textContent = '';
    bottlesFeedback.hidden = true;
    bottlesFeedback.classList.remove('is-error', 'is-success');
    return;
  }

  bottlesFeedback.textContent = message;
  bottlesFeedback.hidden = false;
  bottlesFeedback.classList.toggle('is-error', Boolean(isError));
  bottlesFeedback.classList.toggle('is-success', !isError);
};

const resetRegisterBottleForm = () => {
  if (!registerBottleForm) {
    return;
  }
  registerBottleForm.reset();
  if (registerBottleFeedback) {
    registerBottleFeedback.textContent = '';
    registerBottleFeedback.classList.remove('is-error', 'is-success');
  }
};

const createBottleRow = (bottle) => {
  const row = document.createElement('tr');
  row.dataset.bottleId = bottle.bottle_id;
  row.setAttribute('data-bottle-row', '');

  const basicPhotoUrl = bottle.basic_photo_url;
  const serialLabel = bottle.serial_number ? `#${escapeHtml(bottle.serial_number)}` : '—';
  const photoAlt = bottle.serial_number
    ? `Bottle #${bottle.serial_number}`
    : `Bottle ${bottle.bottle_id}`;
  const missionLabel = bottle.mission_name ? escapeHtml(bottle.mission_name) : '—';
  const statusSlug = slugifyStatus(bottle.status);
  const statusLabel = formatBottleStatusLabel(bottle.status);
  const weightLabel = formatBottleWeight(bottle.weight_grams);
  const isVerified = String(bottle.verified) === '1' || bottle.verified === 1 || bottle.verified === true;
  const verifiedValue = isVerified ? 'true' : 'false';
  const verifiedLabel = isVerified ? 'Verified' : 'Pending';
  const hubName = bottle.hub_name ? String(bottle.hub_name) : '';
  const hubAddress = bottle.hub_mailing_address ? String(bottle.hub_mailing_address) : '';

  const photoMarkup = basicPhotoUrl
    ? `<img src="${escapeAttribute(basicPhotoUrl)}" alt="${escapeAttribute(photoAlt)}" loading="lazy" />`
    : '<span class="bottle-photo__placeholder">No photo</span>';

  row.innerHTML = `
    <td data-label="bottle_basic_pic">
      <div class="bottle-cell">
        <div class="bottle-photo ${basicPhotoUrl ? '' : 'bottle-photo--placeholder'}">
          ${photoMarkup}
        </div>
        <div class="bottle-meta">
          <span class="bottle-serial">Serial <span>${serialLabel}</span></span>
          <span class="muted">ID ${escapeHtml(bottle.bottle_id)}</span>
        </div>
      </div>
    </td>
    <td data-label="mission">${missionLabel}</td>
    <td data-label="contents"><div class="bottle-contents">${formatBottleContents(bottle.contents)}</div></td>
    <td data-label="weight">${escapeHtml(weightLabel)}</td>
    <td data-label="status">
      <span class="status-pill bottle-status-pill" data-status="${escapeAttribute(statusSlug)}">
        ${escapeHtml(statusLabel)}
      </span>
    </td>
    <td data-label="verified">
      <span class="status-pill verified-pill" data-verified="${verifiedValue}">
        ${escapeHtml(verifiedLabel)}
      </span>
    </td>
    <td data-label="delivery details" class="numeric-cell">
      <button type="button" class="button ghost small" data-open-delivery-details>
        Delivery details
      </button>
    </td>
  `;

  row.dataset.serialNumber = bottle.serial_number ? String(bottle.serial_number) : '';
  row.dataset.hubName = hubName;
  row.dataset.hubAddress = hubAddress;

  return row;
};

const addBottleRow = (bottle) => {
  if (!bottlesTableBody) {
    return;
  }
  const row = createBottleRow(bottle);
  bottlesTableBody.prepend(row);
  toggleBottlesTableState();
};

const handleRegisterBottleSubmit = async (event) => {
  event.preventDefault();
  if (!registerBottleForm) {
    return;
  }

  const submitButton = registerBottleForm.querySelector('button[type="submit"]');
  if (registerBottleFeedback) {
    registerBottleFeedback.textContent = '';
    registerBottleFeedback.classList.remove('is-error', 'is-success');
  }

  const formData = new FormData(registerBottleForm);
  const payload = {};

  const missionId = formData.get('mission_id');
  if (missionId && String(missionId).trim() !== '') {
    const parsedMission = Number(missionId);
    if (!Number.isNaN(parsedMission)) {
      payload.mission_id = parsedMission;
    }
  }

  const brand = formData.get('brand');
  if (brand && String(brand).trim()) {
    payload.brand = String(brand).trim();
  }

  const volume = formData.get('volume_ml');
  if (volume && String(volume).trim() !== '') {
    const parsedVolume = Number(volume);
    if (!Number.isNaN(parsedVolume) && parsedVolume >= 0) {
      payload.volume_ml = parsedVolume;
    }
  }

  const hubId = formData.get('hub_id');
  if (hubId && String(hubId).trim() !== '') {
    const parsedHub = Number(hubId);
    if (!Number.isNaN(parsedHub)) {
      payload.hub_id = parsedHub;
    }
  }

  const turtleId = formData.get('turtle_id');
  if (turtleId && String(turtleId).trim() !== '') {
    const parsedTurtle = Number(turtleId);
    if (!Number.isNaN(parsedTurtle)) {
      payload.turtle_id = parsedTurtle;
    }
  }

  const weight = formData.get('weight_grams');
  if (weight && String(weight).trim() !== '') {
    const parsedWeight = Number(weight);
    if (!Number.isNaN(parsedWeight)) {
      payload.weight_grams = parsedWeight;
    }
  }

  const contents = formData.get('contents');
  if (contents && String(contents).trim()) {
    payload.contents = String(contents).trim();
  }

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch('/api/my-bottles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to register bottle.');
    }

    let createdBottle = null;
    if (json.data) {
      addBottleRow(json.data);
      showBottlesFeedback('Bottle registered successfully.', false);
      window.setTimeout(() => {
        showBottlesFeedback('', false);
      }, 5000);
      createdBottle = json.data;
    }

    if (registerBottleDialog) {
      registerBottleDialog.close();
    }
    resetRegisterBottleForm();
    if (createdBottle) {
      showBottleDeliveryModal(createdBottle);
    }
  } catch (error) {
    if (registerBottleFeedback) {
      registerBottleFeedback.textContent = error.message || 'Unable to register bottle.';
      registerBottleFeedback.classList.add('is-error');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
};

if (registerBottleForm) {
  registerBottleForm.addEventListener('submit', handleRegisterBottleSubmit);
}

if (registerBottleDialog) {
  registerBottleDialog.addEventListener('close', () => {
    resetRegisterBottleForm();
  });

  registerBottleDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    registerBottleDialog.close();
  });
}

if (openRegisterBottleButton && registerBottleDialog) {
  openRegisterBottleButton.addEventListener('click', () => {
    resetRegisterBottleForm();
    registerBottleDialog.showModal();
    const firstInput =
      registerBottleForm?.querySelector('input[name="brand"]') ??
      registerBottleForm?.querySelector('select, input, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  });
}

if (closeRegisterBottleButtons && registerBottleDialog) {
  closeRegisterBottleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      registerBottleDialog.close();
    });
  });
}

if (closeBottleDeliveryButtons && bottleDeliveryDialog) {
  closeBottleDeliveryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      bottleDeliveryDialog.close();
    });
  });
}

if (bottleDeliveryDialog) {
  bottleDeliveryDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    bottleDeliveryDialog.close();
  });
}

if (bottlesTableBody) {
  bottlesTableBody.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-delivery-details]');
    if (!trigger) {
      return;
    }
    const row = trigger.closest('tr[data-bottle-row]');
    if (!row) {
      return;
    }
    const bottle = {
      serial_number: row.dataset.serialNumber || '',
      hub_name: row.dataset.hubName || '',
      hub_mailing_address: row.dataset.hubAddress || ''
    };
    showBottleDeliveryModal(bottle);
  });
}

toggleBottlesTableState();
