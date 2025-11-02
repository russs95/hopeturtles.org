const manageTurtleDialog = document.getElementById('manageTurtleDialog');
const manageTurtleForm = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-manage-turtle-form]')
  : null;
const manageTurtleCloseButtons = manageTurtleDialog
  ? manageTurtleDialog.querySelectorAll('[data-close-manage-turtle]')
  : [];
const secretButton = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-request-managed-secret]')
  : null;
const secretCard = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-secret-card]')
  : null;
const secretValue = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-managed-turtle-secret]')
  : null;
const secretCopyButton = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-copy-managed-secret]')
  : null;
const secretFeedback = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-managed-secret-feedback]')
  : null;
const formFeedback = manageTurtleDialog
  ? manageTurtleDialog.querySelector('[data-managed-turtle-feedback]')
  : null;

const supportsNativeDialog = (dialog) => Boolean(dialog && typeof dialog.showModal === 'function');

const showDialog = (dialog) => {
  if (!dialog) return;
  if (supportsNativeDialog(dialog)) {
    dialog.showModal();
  } else {
    dialog.removeAttribute('hidden');
    dialog.setAttribute('data-open', 'true');
  }
};

const hideDialog = (dialog) => {
  if (!dialog) return;
  if (supportsNativeDialog(dialog)) {
    dialog.close();
  } else {
    dialog.setAttribute('data-open', 'false');
    dialog.setAttribute('hidden', '');
  }
};

let currentTurtleId = null;

const resetSecretState = () => {
  if (!secretButton) return;
  secretButton.disabled = false;
  secretButton.textContent = 'View secret key';
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

const populateManageForm = (turtle) => {
  if (!manageTurtleForm) {
    return;
  }

  if (typeof manageTurtleForm.reset === 'function') {
    manageTurtleForm.reset();
  }

  const { name, status, missionId, hubId, boatId } = turtle;
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
};

const openManageTurtleDialog = (button) => {
  if (!manageTurtleDialog || !manageTurtleForm) {
    return;
  }

  currentTurtleId = button.dataset.turtleId || null;
  if (!currentTurtleId) {
    return;
  }

  const turtleData = {
    name: button.dataset.turtleName || '',
    status: button.dataset.turtleStatus || '',
    missionId: button.dataset.turtleMission || '',
    hubId: button.dataset.turtleHub || '',
    boatId: button.dataset.turtleBoat || ''
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
  currentTurtleId = null;
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

const editButtons = document.querySelectorAll('[data-my-turtle-edit]');
editButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    openManageTurtleDialog(button);
  });
});

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

if (secretCopyButton) {
  secretCopyButton.addEventListener('click', async (event) => {
    event.preventDefault();
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
  });
}

const requestSecret = async () => {
  if (!secretButton || !currentTurtleId) {
    return;
  }

  secretButton.disabled = true;
  const originalText = secretButton.textContent;
  secretButton.textContent = 'Loading…';

  try {
    const response = await fetch(`/api/turtles/${encodeURIComponent(currentTurtleId)}/secret`, {
      method: 'POST'
    });
    const json = await response.json();
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
    secretButton.textContent = 'Refresh secret key';
  } catch (error) {
    if (secretFeedback) {
      secretFeedback.textContent = 'Unable to retrieve the secret right now.';
    }
    secretButton.textContent = originalText;
  } finally {
    secretButton.disabled = false;
  }
};

if (secretButton) {
  secretButton.addEventListener('click', (event) => {
    event.preventDefault();
    requestSecret();
  });
}

if (manageTurtleForm) {
  manageTurtleForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentTurtleId) {
      return;
    }

    const formData = new FormData(manageTurtleForm);
    const payload = {
      name: formData.get('name') || null,
      status: formData.get('status') || null,
      mission_id: formData.get('mission_id') || null,
      hub_id: formData.get('hub_id') || null,
      boat_id: formData.get('boat_id') || null
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') {
        payload[key] = null;
      }
    });

    if (formFeedback) {
      formFeedback.textContent = 'Saving…';
    }

    try {
      const response = await fetch(manageTurtleForm.dataset.endpoint, {
        method: manageTurtleForm.dataset.method || 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
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
