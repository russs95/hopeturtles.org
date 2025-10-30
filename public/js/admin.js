const adminForms = document.querySelectorAll('.admin-form');
const deleteButtons = document.querySelectorAll('.admin-table .delete');
const missionDialog = document.getElementById('createMissionDialog');
const hubDialog = document.getElementById('createHubDialog');

const supportsNativeDialog = (dialog) => Boolean(dialog && typeof dialog.showModal === 'function');

const formatDateTimeForMysql = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  const [datePart, timePartRaw] = value.split('T');
  if (!datePart) {
    return value;
  }
  if (!timePartRaw) {
    return `${datePart} 00:00:00`;
  }
  const timePart = timePartRaw.length === 5 ? `${timePartRaw}:00` : timePartRaw;
  return `${datePart} ${timePart}`;
};

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

const setupDialog = (dialog, triggerSelector, closeSelector) => {
  if (!dialog) {
    return;
  }

  if (!supportsNativeDialog(dialog)) {
    dialog.setAttribute('hidden', '');
  }

  if (triggerSelector) {
    const triggers = document.querySelectorAll(triggerSelector);
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        showDialog(dialog);
      });
    });
  }

  if (closeSelector) {
    const closeButtons = dialog.querySelectorAll(closeSelector);
    closeButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        hideDialog(dialog);
      });
    });
  }

  if (supportsNativeDialog(dialog)) {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      hideDialog(dialog);
    });
  }
};

setupDialog(missionDialog, '[data-open-mission-form]', '[data-close-mission-form]');
setupDialog(hubDialog, '[data-open-hub-form]', '[data-close-hub-form]');

adminForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const endpoint = form.dataset.endpoint;
    const method = form.dataset.method || 'POST';
    const feedback = form.querySelector('.form-feedback');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    ['start_date', 'end_date'].forEach((field) => {
      if (payload[field]) {
        payload[field] = formatDateTimeForMysql(payload[field]);
      }
    });

    feedback.textContent = 'Saving…';
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (json.success) {
        feedback.textContent = 'Saved!';
        setTimeout(() => {
          const dialog = form.closest('dialog');
          if (dialog) {
            hideDialog(dialog);
          }
          window.location.reload();
        }, 600);
      } else {
        feedback.textContent = json.message || 'Failed to save.';
      }
    } catch (error) {
      feedback.textContent = 'Network error.';
    }
  });
});

deleteButtons.forEach((button) => {
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!confirm('Delete this record?')) return;
    const endpoint = button.dataset.endpoint;
    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      const json = await response.json();
      if (json.success) {
        window.location.reload();
      }
    } catch (error) {
      alert('Unable to delete this record right now.');
    }
  });
});
