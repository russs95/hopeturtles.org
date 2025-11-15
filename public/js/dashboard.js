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

const dashboardAlertContainer = document.querySelector('[data-dashboard-alerts]');
const dashboardAlertEmptyState = dashboardAlertContainer
  ? dashboardAlertContainer.querySelector('[data-dashboard-alerts-empty]')
  : null;

const updateDashboardAlertState = () => {
  if (!dashboardAlertContainer) {
    return;
  }
  const alerts = dashboardAlertContainer.querySelectorAll('[data-dashboard-alert]');
  const hasAlerts = alerts.length > 0;
  if (dashboardAlertEmptyState) {
    dashboardAlertEmptyState.hidden = hasAlerts;
  }
  dashboardAlertContainer.classList.toggle('is-empty', !hasAlerts);
};

if (dashboardAlertContainer) {
  dashboardAlertContainer.addEventListener('click', (event) => {
    const dismissButton = event.target.closest('[data-dashboard-alert-dismiss]');
    if (!dismissButton) {
      return;
    }
    event.preventDefault();
    const alertRow = dismissButton.closest('[data-dashboard-alert]');
    if (alertRow) {
      alertRow.remove();
      updateDashboardAlertState();
    }
  });
  updateDashboardAlertState();
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
const bottleDeliveryForm =
  bottleDeliveryDialog?.querySelector('[data-bottle-delivery-form]') ?? null;
const bottleDeliveryFeedback =
  bottleDeliveryDialog?.querySelector('[data-bottle-delivery-feedback]') ?? null;
const bottleDeliverySubmitButton =
  bottleDeliveryDialog?.querySelector('[data-bottle-delivery-submit]') ?? null;
const deleteBottleButton =
  bottleDeliveryDialog?.querySelector('[data-delete-bottle]') ?? null;

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

const getBottleDataFromRow = (row) => {
  if (!row) {
    return null;
  }

  const bottleIdRaw = row.dataset.bottleId;
  const parsedId = bottleIdRaw ? Number(bottleIdRaw) : null;
  const bottleId = Number.isFinite(parsedId) ? parsedId : null;

  return {
    bottle_id: bottleId,
    serial_number: row.dataset.serialNumber || '',
    hub_name: row.dataset.hubName || '',
    hub_mailing_address: row.dataset.hubAddress || ''
  };
};

const removeBottleRowById = (bottleId) => {
  if (!bottlesTableBody || !bottleId) {
    return null;
  }

  const rows = Array.from(bottlesTableBody.querySelectorAll('tr[data-bottle-row]'));
  const targetRow = rows.find((node) => node.dataset.bottleId === String(bottleId));
  if (targetRow) {
    targetRow.remove();
  }
  return targetRow || null;
};

const openBottleDialogFromRow = (row) => {
  const bottle = getBottleDataFromRow(row);
  if (!bottle || !bottle.bottle_id) {
    return;
  }

  showBottleDeliveryModal(bottle);
};

const resetBottleDeliveryForm = () => {
  if (!bottleDeliveryForm) {
    return;
  }
  bottleDeliveryForm.reset();
  bottleDeliveryForm.dataset.bottleId = '';
  if (bottleDeliveryFeedback) {
    bottleDeliveryFeedback.textContent = '';
    bottleDeliveryFeedback.hidden = true;
    bottleDeliveryFeedback.classList.remove('is-error', 'is-success');
  }
  if (deleteBottleButton) {
    deleteBottleButton.disabled = true;
  }
};

const updateBottleRow = (bottle) => {
  if (!bottlesTableBody || !bottle) {
    return;
  }

  const bottleId = bottle.bottle_id ? String(bottle.bottle_id) : '';
  const existingRow = bottleId
    ? bottlesTableBody.querySelector(`tr[data-bottle-row][data-bottle-id="${bottleId}"]`)
    : null;
  const newRow = createBottleRow(bottle);
  if (existingRow) {
    existingRow.replaceWith(newRow);
  } else {
    bottlesTableBody.prepend(newRow);
  }
};

const showBottleDeliveryModal = (bottle) => {
  if (!bottleDeliveryDialog || !bottle) {
    return;
  }

  resetBottleDeliveryForm();

  if (bottleDeliveryForm) {
    bottleDeliveryForm.dataset.bottleId = bottle.bottle_id ? String(bottle.bottle_id) : '';
  }

  if (deleteBottleButton) {
    deleteBottleButton.disabled = !bottle?.bottle_id;
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

const handleBottleDeliverySubmit = async (event) => {
  event.preventDefault();

  if (!bottleDeliveryForm) {
    return;
  }

  const bottleId = bottleDeliveryForm.dataset.bottleId;
  if (!bottleId) {
    if (bottleDeliveryFeedback) {
      bottleDeliveryFeedback.textContent = 'Something went wrong. Please try again.';
      bottleDeliveryFeedback.hidden = false;
      bottleDeliveryFeedback.classList.add('is-error');
      bottleDeliveryFeedback.classList.remove('is-success');
    }
    return;
  }

  const formData = new FormData(bottleDeliveryForm);
  if (bottleDeliveryFeedback) {
    bottleDeliveryFeedback.textContent = '';
    bottleDeliveryFeedback.hidden = true;
    bottleDeliveryFeedback.classList.remove('is-error', 'is-success');
  }

  if (bottleDeliverySubmitButton) {
    bottleDeliverySubmitButton.disabled = true;
  }

  try {
    const response = await fetch(`/api/my-bottles/${encodeURIComponent(bottleId)}/delivery`, {
      method: 'POST',
      body: formData
    });
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to save delivery details.');
    }

    if (json.data) {
      updateBottleRow(json.data);
      toggleBottlesTableState();
    }

    showBottlesFeedback('Delivery details saved. Thank you!', false);
    bottleDeliveryDialog.close();
  } catch (error) {
    const message = error?.message || 'Unable to save delivery details.';
    if (bottleDeliveryFeedback) {
      bottleDeliveryFeedback.textContent = message;
      bottleDeliveryFeedback.hidden = false;
      bottleDeliveryFeedback.classList.add('is-error');
      bottleDeliveryFeedback.classList.remove('is-success');
    } else {
      showBottlesFeedback(message, true);
    }
  } finally {
    if (bottleDeliverySubmitButton) {
      bottleDeliverySubmitButton.disabled = false;
    }
  }
};

const handleDeleteBottle = async () => {
  if (!bottleDeliveryForm) {
    return;
  }

  const bottleId = bottleDeliveryForm.dataset.bottleId;
  if (!bottleId) {
    return;
  }

  const confirmDelete = window.confirm(
    'Are you sure you want to delete this aid bottle? This action cannot be undone.'
  );
  if (!confirmDelete) {
    return;
  }

  if (bottleDeliveryFeedback) {
    bottleDeliveryFeedback.textContent = '';
    bottleDeliveryFeedback.hidden = true;
    bottleDeliveryFeedback.classList.remove('is-error', 'is-success');
  }

  if (deleteBottleButton) {
    deleteBottleButton.disabled = true;
  }

  try {
    const response = await fetch(`/api/my-bottles/${encodeURIComponent(bottleId)}`, {
      method: 'DELETE'
    });
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to delete bottle.');
    }

    removeBottleRowById(bottleId);
    toggleBottlesTableState();
    if (bottleDeliveryDialog) {
      bottleDeliveryDialog.close();
    }
    showBottlesFeedback('Bottle deleted.', false);
  } catch (error) {
    const message = error?.message || 'Unable to delete bottle.';
    if (bottleDeliveryFeedback) {
      bottleDeliveryFeedback.textContent = message;
      bottleDeliveryFeedback.hidden = false;
      bottleDeliveryFeedback.classList.add('is-error');
      bottleDeliveryFeedback.classList.remove('is-success');
    } else {
      showBottlesFeedback(message, true);
    }
  } finally {
    if (deleteBottleButton) {
      deleteBottleButton.disabled = false;
    }
  }
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
  const bottleId = bottle.bottle_id ? String(bottle.bottle_id) : '';
  row.dataset.bottleId = bottleId;
  row.setAttribute('data-bottle-row', '');
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  const accessibleLabel = bottle.serial_number
    ? `Open delivery details for aid bottle #${bottle.serial_number}`
    : 'Open delivery details for this aid bottle';
  row.setAttribute('aria-label', accessibleLabel);

  const basicPhotoUrl = bottle.basic_photo_url;
  const serialLabel = bottle.serial_number ? `#${escapeHtml(bottle.serial_number)}` : '—';
  const photoAlt = bottle.serial_number ? `Aid bottle #${bottle.serial_number}` : 'Aid bottle photo';
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
    <td data-label="Aid Bottle">
      <div class="bottle-cell">
        <div class="bottle-photo ${basicPhotoUrl ? '' : 'bottle-photo--placeholder'}">
          ${photoMarkup}
          <span class="bottle-photo__serial">${serialLabel}</span>
        </div>
      </div>
    </td>
    <td data-label="Mission">${missionLabel}</td>
    <td data-label="Contents"><div class="bottle-contents">${formatBottleContents(bottle.contents)}</div></td>
    <td data-label="Weight">${escapeHtml(weightLabel)}</td>
    <td data-label="Verified">
      <span class="status-pill verified-pill" data-verified="${verifiedValue}">
        ${escapeHtml(verifiedLabel)}
      </span>
    </td>
    <td data-label="Status">
      <span
        class="status-pill bottle-status-pill"
        data-status="${escapeAttribute(statusSlug)}"
        data-open-delivery-details
      >
        ${escapeHtml(statusLabel)}
      </span>
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
  bottleDeliveryDialog.addEventListener('close', () => {
    resetBottleDeliveryForm();
  });

  bottleDeliveryDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    bottleDeliveryDialog.close();
  });
}

if (bottleDeliveryForm) {
  bottleDeliveryForm.addEventListener('submit', handleBottleDeliverySubmit);
}

if (deleteBottleButton) {
  deleteBottleButton.addEventListener('click', handleDeleteBottle);
}

if (bottlesTableBody) {
  bottlesTableBody.addEventListener('click', (event) => {
    const row = event.target.closest('tr[data-bottle-row]');
    if (!row) {
      return;
    }
    openBottleDialogFromRow(row);
  });

  bottlesTableBody.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const row = event.target.closest('tr[data-bottle-row]');
    if (!row) {
      return;
    }
    event.preventDefault();
    openBottleDialogFromRow(row);
  });
}

toggleBottlesTableState();
