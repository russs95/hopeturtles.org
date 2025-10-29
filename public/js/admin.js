const adminForms = document.querySelectorAll('.admin-form');
const deleteButtons = document.querySelectorAll('.admin-table .delete');
const missionDialog = document.getElementById('createMissionDialog');
const missionTrigger = document.querySelector('[data-open-mission-form]');
const missionCloseButtons = missionDialog
  ? missionDialog.querySelectorAll('[data-close-mission-form]')
  : [];
const hasNativeDialog = Boolean(missionDialog && typeof missionDialog.showModal === 'function');

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

const showMissionDialog = () => {
  if (!missionDialog) return;
  if (hasNativeDialog) {
    missionDialog.showModal();
  } else {
    missionDialog.removeAttribute('hidden');
    missionDialog.setAttribute('data-open', 'true');
  }
};

const hideMissionDialog = () => {
  if (!missionDialog) return;
  if (hasNativeDialog) {
    missionDialog.close();
  } else {
    missionDialog.setAttribute('data-open', 'false');
    missionDialog.setAttribute('hidden', '');
  }
};

if (missionDialog && !hasNativeDialog) {
  missionDialog.setAttribute('hidden', '');
}

if (missionTrigger) {
  missionTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    showMissionDialog();
  });
}

missionCloseButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    hideMissionDialog();
  });
});

if (missionDialog && hasNativeDialog) {
  missionDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    hideMissionDialog();
  });
}

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
            hideMissionDialog();
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
