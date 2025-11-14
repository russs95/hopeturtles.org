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

const launchTurtleDialog = document.getElementById('launchTurtleDialog');
const launchTurtleForm = launchTurtleDialog
  ? launchTurtleDialog.querySelector('[data-launch-turtle-form]')
  : null;
const launchTurtleButtons = document.querySelectorAll('[data-launch-turtle]');
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
    boatId: button.dataset.turtleBoat || '',
    photoUrl: button.dataset.turtlePhotoUrl || ''
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

launchTurtleButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    openLaunchTurtleDialog();
  });
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
      const json = await response.json();
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

    if (formFeedback) {
      formFeedback.textContent = 'Saving…';
    }

    try {
      const response = await fetch(manageTurtleForm.dataset.endpoint, {
        method: manageTurtleForm.dataset.method || 'PUT',
        body: formData
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
      const json = await response.json();
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
