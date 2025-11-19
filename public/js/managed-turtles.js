const manageTurtleDialog = document.getElementById('manageTurtleDialog');
const manageTurtleForm = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-manage-turtle-form]')
  : null;
const manageTurtleCloseButtons = manageTurtleDialog
  ? manageTurtleDialog.querySelectorAll('[data-close-manage-turtle]')
  : [];
const secretButton = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-secret-action]')
  : null;
const secretCard = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-secret-card]')
  : null;
const secretValue = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-managed-turtle-secret]')
  : null;
const secretFeedback = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-managed-secret-feedback]')
  : null;
const formFeedback = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-managed-turtle-feedback]')
  : null;
const deleteTurtleButton = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-delete-turtle]')
  : null;
const featurePhotoPreview = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-feature-photo-preview]')
  : null;
const featurePhotoImage = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-feature-photo-image]')
  : null;

const interactiveSelector =
  'button, a, input, select, textarea, label, [data-editable-select], [data-secret-action]';

const normalizeEventTarget = (target) => {
  if (!target) {
    return null;
  }
  if (target instanceof Element) {
    return target;
  }
  return target.parentElement || null;
};

const shouldIgnoreManageableClick = (target) => {
  const element = normalizeEventTarget(target);
  if (!element) {
    return false;
  }
  return Boolean(element.closest(interactiveSelector));
};

const getManageableRow = (element) => {
  if (!element) {
    return null;
  }
  if (element.matches && element.matches('[data-manageable-turtle]')) {
    return element;
  }
  return element.closest ? element.closest('[data-manageable-turtle]') : null;
};

const launchTurtleDialog = document.getElementById('launchTurtleDialog');
const launchTurtleForm = launchTurtleDialog
  ? launchTurtleDialog.querySelector('[data-launch-turtle-form]')
  : null;
const launchTurtleCloseButtons = launchTurtleDialog
  ? launchTurtleDialog.querySelectorAll('[data-close-launch-turtle]')
  : [];
const launchFeedback = launchTurtleDialog
  ? launchTurtleDialog.querySelector('[data-launch-turtle-feedback]')
  : null;
const launchSubmitButton = launchTurtleDialog
  ? launchTurtleDialog.querySelector('button[type="submit"]')
  : null;
const launchSuccessState = launchTurtleDialog
  ? launchTurtleDialog.querySelector('[data-launch-success]')
  : null;
const launchSuccessCloseButton = launchSuccessState
  ? launchSuccessState.querySelector('[data-launch-success-close]')
  : null;

const supportsNativeDialog = (dialog) => Boolean(dialog && typeof dialog.showModal === 'function');

const delegateClick = (selector, handler) => {
  if (!selector || typeof handler !== 'function') {
    return;
  }
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest(selector);
    if (!trigger) {
      return;
    }
    handler(event, trigger);
  });
};

const showDialog = (dialog) => {
  if (!dialog) return;
  if (supportsNativeDialog(dialog)) {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
    dialog.removeAttribute('hidden');
    dialog.setAttribute('data-open', 'true');
  }
};

const hideDialog = (dialog) => {
  if (!dialog) return;
  if (supportsNativeDialog(dialog)) {
    dialog.close();
  } else {
    dialog.removeAttribute('data-open');
    dialog.removeAttribute('open');
    dialog.setAttribute('hidden', '');
  }
};

const parseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Unexpected response from server.');
  }
};

const turtleBottlesDialog = document.getElementById('turtleBottlesDialog');
const turtleBottlesList = turtleBottlesDialog
  ? turtleBottlesDialog.querySelector('[data-turtle-bottles-list]')
  : null;
const turtleBottlesEmptyState = turtleBottlesDialog
  ? turtleBottlesDialog.querySelector('[data-turtle-bottles-empty]')
  : null;
const turtleBottlesFeedback = turtleBottlesDialog
  ? turtleBottlesDialog.querySelector('[data-turtle-bottles-feedback]')
  : null;
const turtleBottlesSummary = turtleBottlesDialog
  ? turtleBottlesDialog.querySelector('[data-turtle-bottles-summary]')
  : null;
const turtleBottlesCloseButton = turtleBottlesDialog
  ? turtleBottlesDialog.querySelector('[data-close-turtle-bottles]')
  : null;

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

const createTurtleBottleCard = (bottle) => {
  const card = document.createElement('li');
  card.className = 'turtle-bottle-card';
  const serialLabel = bottle.serial_number ? `#${escapeHtml(bottle.serial_number)}` : 'Unnumbered bottle';
  const photoUrl = bottle.basic_photo_url ? escapeHtml(bottle.basic_photo_url) : '';
  const weightLabel = formatBottleWeight(bottle.weight_grams);
  const statusLabel = formatBottleStatusLabel(bottle.status);
  const contentsMarkup = formatBottleContents(bottle.contents);
  const photoMarkup = photoUrl
    ? `<img src="${photoUrl}" alt="Bottle photo ${serialLabel}" loading="lazy" />`
    : '<span class="turtle-bottle-card__placeholder">No photo</span>';

  card.innerHTML = `
    <div class="turtle-bottle-card__photo ${photoUrl ? '' : 'turtle-bottle-card__photo--placeholder'}">
      ${photoMarkup}
    </div>
    <div class="turtle-bottle-card__body">
      <h3>${serialLabel}</h3>
      <p class="turtle-bottle-card__contents">${contentsMarkup}</p>
      <dl>
        <div>
          <dt>Weight</dt>
          <dd>${escapeHtml(weightLabel)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>${escapeHtml(statusLabel)}</dd>
        </div>
      </dl>
    </div>
  `;

  return card;
};

const setTurtleBottlesFeedback = (message, isError = false) => {
  if (!turtleBottlesFeedback) {
    return;
  }
  turtleBottlesFeedback.textContent = message || '';
  turtleBottlesFeedback.hidden = !message;
  turtleBottlesFeedback.classList.toggle('is-error', Boolean(isError));
  turtleBottlesFeedback.classList.toggle('is-success', Boolean(message && !isError));
};

const renderTurtleBottles = (bottles) => {
  if (!turtleBottlesList || !turtleBottlesEmptyState) {
    return;
  }
  turtleBottlesList.innerHTML = '';
  if (!bottles || bottles.length === 0) {
    turtleBottlesEmptyState.hidden = false;
    return;
  }
  turtleBottlesEmptyState.hidden = true;
  bottles.forEach((bottle) => {
    turtleBottlesList.appendChild(createTurtleBottleCard(bottle));
  });
};

let turtleBottlesCurrentId = null;

const closeTurtleBottlesDialog = () => {
  turtleBottlesCurrentId = null;
  setTurtleBottlesFeedback('');
  if (turtleBottlesList) {
    turtleBottlesList.innerHTML = '';
  }
  if (turtleBottlesEmptyState) {
    turtleBottlesEmptyState.hidden = true;
  }
  hideDialog(turtleBottlesDialog);
};

const openTurtleBottlesDialog = async (sourceElement) => {
  const row = getManageableRow(sourceElement);
  if (!row || !turtleBottlesDialog) {
    return;
  }
  const turtleIdRaw = row.dataset.turtleId;
  const turtleId = turtleIdRaw ? Number(turtleIdRaw) : null;
  if (!Number.isFinite(turtleId)) {
    return;
  }
  turtleBottlesCurrentId = turtleId;
  const turtleName = row.dataset.turtleName?.trim() || `Turtle #${row.dataset.turtleId}`;
  const hubName = row.dataset.turtleHubName?.trim();
  if (turtleBottlesSummary) {
    turtleBottlesSummary.textContent = hubName ? `${turtleName} · ${hubName}` : turtleName;
  }
  if (turtleBottlesList) {
    turtleBottlesList.innerHTML = '';
  }
  if (turtleBottlesEmptyState) {
    turtleBottlesEmptyState.hidden = true;
  }
  setTurtleBottlesFeedback('Loading connected bottles…', false);
  showDialog(turtleBottlesDialog);

  try {
    const response = await fetch(`/api/my-bottles/turtles/${encodeURIComponent(turtleId)}`);
    const json = await parseJsonResponse(response);
    if (!response.ok || !json.success) {
      throw new Error(json?.message || 'Unable to load bottles.');
    }
    if (turtleBottlesCurrentId !== turtleId) {
      return;
    }
    renderTurtleBottles(json.data?.bottles || []);
    setTurtleBottlesFeedback('');
  } catch (error) {
    if (turtleBottlesCurrentId !== turtleId) {
      return;
    }
    if (turtleBottlesList) {
      turtleBottlesList.innerHTML = '';
    }
    setTurtleBottlesFeedback(error.message || 'Unable to load bottles.', true);
  }
};

let currentTurtleId = null;
let launchWasSuccessful = false;

const resetSecretState = () => {
  if (!secretButton) return;
  secretButton.disabled = false;
  secretButton.textContent = 'View secret';
  secretButton.dataset.action = 'view';
  if (secretCard) {
    secretCard.hidden = true;
  }
  if (secretValue) {
    secretValue.textContent = '';
  }
  if (secretFeedback) {
    secretFeedback.textContent = '';
  }
};

const updateFeaturePhotoPreview = (url) => {
  if (!featurePhotoPreview || !featurePhotoImage) {
    return;
  }
  if (url) {
    featurePhotoImage.src = url;
    featurePhotoPreview.hidden = false;
  } else {
    featurePhotoImage.removeAttribute('src');
    featurePhotoPreview.hidden = true;
  }
};

const toggleLaunchSuccessState = (isVisible) => {
  if (launchTurtleForm) {
    launchTurtleForm.hidden = Boolean(isVisible);
  }
  if (launchSuccessState) {
    launchSuccessState.hidden = !isVisible;
  }
};

const isUsableFile = (file) => {
  if (typeof File === 'undefined') {
    return false;
  }
  return file instanceof File && file.size > 0;
};

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });

const getThumbnailMimeType = (file) => {
  if (file?.type && file.type.includes('png')) {
    return 'image/png';
  }
  if (file?.type && file.type.includes('webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
};

const getFileExtension = (file) => {
  if (!file) {
    return '';
  }
  if (file.name && file.name.includes('.')) {
    return file.name.slice(file.name.lastIndexOf('.'));
  }
  const mime = file.type || '';
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  return '.jpg';
};

const getFileBaseName = (file) => {
  if (!file || typeof file.name !== 'string' || !file.name.trim()) {
    return 'photo';
  }
  const trimmed = file.name.trim();
  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot === -1) {
    return trimmed;
  }
  return trimmed.slice(0, lastDot) || 'photo';
};

const buildThumbnailFileName = (file) => `${getFileBaseName(file)}-thumb${getFileExtension(file)}`;

const createImageThumbnailBlob = async (file, maxSize = 320) => {
  if (!isUsableFile(file)) {
    return null;
  }
  const dataUrl = await readFileAsDataURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxDimension = Math.max(image.width, image.height) || 1;
      const scale = Math.min(1, maxSize / maxDimension);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(null);
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      const mimeType = getThumbnailMimeType(file);
      const quality = mimeType === 'image/jpeg' ? 0.85 : undefined;
      canvas.toBlob(
        (blob) => {
          resolve(blob || null);
        },
        mimeType,
        quality
      );
    };
    image.onerror = () => reject(new Error('Unable to process photo.'));
    image.src = dataUrl;
  });
};

const preparePhotoThumbnail = async (
  formData,
  { sourceFieldName = 'profile_photo', thumbnailFieldName = 'profile_photo_thumbnail', maxSize = 320 } = {}
) => {
  if (!formData) {
    return;
  }
  const file = formData.get(sourceFieldName);
  if (!isUsableFile(file)) {
    formData.delete(thumbnailFieldName);
    return;
  }
  try {
    const blob = await createImageThumbnailBlob(file, maxSize);
    if (!blob) {
      formData.delete(thumbnailFieldName);
      return;
    }
    const fileName = buildThumbnailFileName(file);
    const type = blob.type || getThumbnailMimeType(file);
    const thumbnailFile = new File([blob], fileName, { type });
    formData.set(thumbnailFieldName, thumbnailFile);
  } catch (error) {
    formData.delete(thumbnailFieldName);
  }
};

const resetLaunchDialog = () => {
  if (launchTurtleForm && typeof launchTurtleForm.reset === 'function') {
    launchTurtleForm.reset();
  }
  const statusField = launchTurtleForm ? launchTurtleForm.querySelector('[name="status"]') : null;
  if (statusField) {
    statusField.value = 'idle';
  }
  if (launchSubmitButton) {
    launchSubmitButton.disabled = false;
    launchSubmitButton.textContent = 'Launch turtle';
  }
  if (launchFeedback) {
    launchFeedback.textContent = '';
  }
  toggleLaunchSuccessState(false);
  launchWasSuccessful = false;
};

toggleLaunchSuccessState(false);

const populateManageForm = (turtle) => {
  if (!manageTurtleForm) {
    return;
  }

  if (typeof manageTurtleForm.reset === 'function') {
    manageTurtleForm.reset();
  }

  const { name, status, missionId, hubId, boatId, photoUrl } = turtle;
  const nameField = manageTurtleForm.querySelector('[name="name"]');
  const statusField = manageTurtleForm.querySelector('[name="status"]');
  const missionField = manageTurtleForm.querySelector('[name="mission_id"]');
  const hubField = manageTurtleForm.querySelector('[name="hub_id"]');
  const boatField = manageTurtleForm.querySelector('[name="boat_id"]');

  if (nameField) {
    nameField.value = name || '';
  }
  if (statusField) {
    statusField.value = status || '';
  }
  if (missionField) {
    missionField.value = missionId || '';
  }
  if (hubField) {
    hubField.value = hubId || '';
  }
  if (boatField) {
    boatField.value = boatId || '';
  }
  updateFeaturePhotoPreview(photoUrl || '');
};

const openManageTurtleDialog = (sourceElement) => {
  if (!manageTurtleDialog || !manageTurtleForm) {
    return;
  }

  const row = getManageableRow(sourceElement);
  if (!row) {
    return;
  }

  const turtleIdRaw = row.dataset.turtleId;
  const parsedId = turtleIdRaw ? Number(turtleIdRaw) : null;
  if (!Number.isFinite(parsedId)) {
    return;
  }

  currentTurtleId = parsedId;

  const turtleData = {
    name: row.dataset.turtleName || '',
    status: row.dataset.turtleStatus || '',
    missionId: row.dataset.turtleMission || '',
    hubId: row.dataset.turtleHub || '',
    boatId: row.dataset.turtleBoat || '',
    photoUrl: row.dataset.turtlePhotoUrl || ''
  };

  manageTurtleForm.dataset.endpoint = `/api/turtles/${encodeURIComponent(currentTurtleId)}`;
  resetSecretState();
  populateManageForm(turtleData);

  if (formFeedback) {
    formFeedback.textContent = '';
  }

  showDialog(manageTurtleDialog);
};

const closeManageTurtleDialog = () => {
  hideDialog(manageTurtleDialog);
  resetSecretState();
  updateFeaturePhotoPreview('');
  currentTurtleId = null;
};

const manageableTurtles = document.querySelectorAll('[data-manageable-turtle]');
manageableTurtles.forEach((row) => {
  const activate = () => openManageTurtleDialog(row);
  row.addEventListener('click', (event) => {
    if (shouldIgnoreManageableClick(event.target)) {
      return;
    }
    event.preventDefault();
    activate();
  });
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
});

delegateClick('[data-trigger-manage-turtle]', (event, button) => {
  event.preventDefault();
  event.stopPropagation();
  openManageTurtleDialog(button);
});

delegateClick('[data-trigger-manage-bottles]', (event, button) => {
  event.preventDefault();
  event.stopPropagation();
  openTurtleBottlesDialog(button);
});

const openLaunchTurtleDialog = () => {
  if (!launchTurtleDialog) {
    return;
  }
  resetLaunchDialog();
  showDialog(launchTurtleDialog);
};

const closeLaunchTurtleDialog = () => {
  if (!launchTurtleDialog) {
    return;
  }
  hideDialog(launchTurtleDialog);
  const shouldReload = launchWasSuccessful;
  resetLaunchDialog();
  if (shouldReload) {
    window.location.reload();
  }
};

if (manageTurtleDialog) {
  if (supportsNativeDialog(manageTurtleDialog)) {
    manageTurtleDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeManageTurtleDialog();
    });
  }

  manageTurtleCloseButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      closeManageTurtleDialog();
    });
  });
}

if (turtleBottlesDialog) {
  if (supportsNativeDialog(turtleBottlesDialog)) {
    turtleBottlesDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTurtleBottlesDialog();
    });
  }
  if (turtleBottlesCloseButton) {
    turtleBottlesCloseButton.addEventListener('click', (event) => {
      event.preventDefault();
      closeTurtleBottlesDialog();
    });
  }
}

if (launchTurtleDialog) {
  if (supportsNativeDialog(launchTurtleDialog)) {
    launchTurtleDialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeLaunchTurtleDialog();
    });
  }

  launchTurtleCloseButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      closeLaunchTurtleDialog();
    });
  });
}

if (launchSuccessCloseButton) {
  launchSuccessCloseButton.addEventListener('click', (event) => {
    event.preventDefault();
    closeLaunchTurtleDialog();
  });
}

delegateClick('[data-launch-turtle]', (event) => {
  event.preventDefault();
  openLaunchTurtleDialog();
});

if (launchTurtleForm) {
  launchTurtleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(launchTurtleForm);
    const trimmedName = (formData.get('name') || '').trim();
    if (!trimmedName) {
      if (launchFeedback) {
        launchFeedback.textContent = 'Please give your turtle a name.';
      }
      return;
    }
    formData.set('name', trimmedName);
    const statusValue = (formData.get('status') || '').toString().trim().toLowerCase();
    formData.set('status', statusValue || 'idle');
    ['mission_id', 'hub_id', 'boat_id'].forEach((field) => {
      const value = formData.get(field);
      if (typeof value === 'string') {
        formData.set(field, value.trim());
      }
    });
    await preparePhotoThumbnail(formData);

    if (launchFeedback) {
      launchFeedback.textContent = 'Launching…';
    }
    if (launchSubmitButton) {
      launchSubmitButton.disabled = true;
      launchSubmitButton.textContent = 'Launching…';
    }

    try {
      const response = await fetch('/api/turtles/launch', {
        method: 'POST',
        body: formData
      });
      const json = await parseJsonResponse(response);
      if (!json.success) {
        throw new Error(json.message || 'Request failed');
      }

      launchWasSuccessful = true;
      if (launchFeedback) {
        launchFeedback.textContent = '';
      }
      if (launchTurtleForm && typeof launchTurtleForm.reset === 'function') {
        launchTurtleForm.reset();
        const statusField = launchTurtleForm.querySelector('[name="status"]');
        if (statusField) {
          statusField.value = 'idle';
        }
      }
      toggleLaunchSuccessState(true);
      if (launchSubmitButton) {
        launchSubmitButton.disabled = false;
        launchSubmitButton.textContent = 'Launch turtle';
      }
    } catch (error) {
      launchWasSuccessful = false;
      if (launchFeedback) {
        launchFeedback.textContent = error.message || 'Unable to launch turtle.';
      }
      if (launchSubmitButton) {
        launchSubmitButton.disabled = false;
        launchSubmitButton.textContent = 'Launch turtle';
      }
    }
  });
}

const copySecretToClipboard = async (secret) => {
  if (!secret) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(secret);
    return true;
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = secret;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (execError) {
      copied = false;
    }
    document.body.removeChild(textarea);
    return copied;
  }
};

const requestSecret = async () => {
  if (!secretButton || !currentTurtleId) {
    return;
  }

  secretButton.disabled = true;
  const originalText = secretButton.textContent;
  secretButton.textContent = 'Loading…';
  secretButton.dataset.action = 'loading';

  try {
    const response = await fetch(`/api/turtles/${encodeURIComponent(currentTurtleId)}/secret`, {
      method: 'POST'
    });
    const json = await parseJsonResponse(response);
    if (!json.success || !json.secret) {
      throw new Error(json.message || 'Unable to retrieve secret');
    }
    if (secretValue) {
      secretValue.textContent = json.secret;
    }
    if (secretCard) {
      secretCard.hidden = false;
    }
    if (secretFeedback) {
      secretFeedback.textContent = 'Secret ready to copy.';
    }
    secretButton.textContent = 'Copy secret';
    secretButton.dataset.action = 'copy';
  } catch (error) {
    if (secretFeedback) {
      secretFeedback.textContent = 'Unable to retrieve the secret right now.';
    }
    secretButton.textContent = originalText;
    secretButton.dataset.action = 'view';
    secretButton.disabled = false;
  } finally {
    secretButton.disabled = false;
  }
};

if (secretButton) {
  secretButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const action = secretButton.dataset.action || 'view';
    if (action === 'copy') {
      if (!secretValue) {
        return;
      }
      const secret = secretValue.textContent.trim();
      if (!secret) {
        return;
      }
      const copied = await copySecretToClipboard(secret);
      if (secretFeedback) {
        secretFeedback.textContent = copied
          ? 'Secret copied to clipboard.'
          : 'Copy failed. Please copy manually.';
      }
      return;
    }
    if (!secretButton.disabled) {
      requestSecret();
    }
  });
}

if (manageTurtleForm) {
  manageTurtleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentTurtleId) {
      return;
    }

    const formData = new FormData(manageTurtleForm);
    const stringFields = ['name', 'status', 'mission_id', 'hub_id', 'boat_id'];
    stringFields.forEach((field) => {
      const value = formData.get(field);
      if (typeof value === 'string') {
        formData.set(field, value.trim());
      }
    });
    if (typeof formData.get('name') === 'string' && !formData.get('name')) {
      formData.set('name', '');
    }
    await preparePhotoThumbnail(formData);

    if (formFeedback) {
      formFeedback.textContent = 'Saving…';
    }

    try {
      const response = await fetch(manageTurtleForm.dataset.endpoint, {
        method: manageTurtleForm.dataset.method || 'PUT',
        body: formData
      });
      const json = await parseJsonResponse(response);
      if (!json.success) {
        throw new Error(json.message || 'Request failed');
      }
      if (formFeedback) {
        formFeedback.textContent = 'Saved!';
      }
      window.setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (error) {
      if (formFeedback) {
        formFeedback.textContent = error.message || 'Unable to save changes.';
      }
    }
  });
}

if (deleteTurtleButton) {
  deleteTurtleButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!currentTurtleId) {
      return;
    }
    const confirmed = window.confirm(
      'Delete this Hope Turtle? This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }
    const originalText = deleteTurtleButton.textContent;
    deleteTurtleButton.disabled = true;
    deleteTurtleButton.textContent = 'Deleting…';
    if (formFeedback) {
      formFeedback.textContent = 'Removing turtle…';
    }
    try {
      const response = await fetch(`/api/turtles/${encodeURIComponent(currentTurtleId)}`, {
        method: 'DELETE'
      });
      const json = await parseJsonResponse(response);
      if (!json.success) {
        throw new Error(json.message || 'Unable to delete turtle.');
      }
      if (formFeedback) {
        formFeedback.textContent = 'Turtle deleted.';
      }
      window.setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (error) {
      if (formFeedback) {
        formFeedback.textContent = error.message || 'Unable to delete turtle.';
      }
      deleteTurtleButton.disabled = false;
      deleteTurtleButton.textContent = originalText;
    }
  });
}
