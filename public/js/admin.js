const adminForms = document.querySelectorAll('.admin-form');
const deleteButtons = document.querySelectorAll('.admin-table .delete');
const missionDialog = document.getElementById('createMissionDialog');
const hubDialog = document.getElementById('createHubDialog');
const boatDialog = document.getElementById('createBoatDialog');

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
setupDialog(boatDialog, '[data-open-boat-form]', '[data-close-boat-form]');

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

const inlineSelects = document.querySelectorAll('[data-editable-select]');

const parseOptions = (element) =>
  (element.dataset.options || '')
    .split('|')
    .map((option) => option.trim())
    .filter(Boolean);

const formatStatusKey = (value) => (value ? value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'unset');

const updateInlineSelectDisplay = (element, newValue) => {
  const placeholder = element.dataset.placeholder || 'Set status';
  const badge = element.querySelector('.status-pill');
  const valueToShow = newValue || placeholder;

  if (badge) {
    badge.textContent = valueToShow;
    badge.dataset.status = formatStatusKey(newValue);
  } else {
    element.textContent = valueToShow;
  }
};

const setupEditableSelect = (element) => {
  const options = parseOptions(element);
  if (!options.length) {
    return;
  }

  const openEditor = () => {
    if (element.dataset.editing === 'true') {
      return;
    }

    const select = document.createElement('select');
    select.className = 'inline-select__control';
    const currentValue = element.dataset.value || '';
    const label = element.dataset.label || 'Update value';
    select.setAttribute('aria-label', label);

    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option;
      optionEl.textContent = option;
      if (option === currentValue) {
        optionEl.selected = true;
      }
      select.append(optionEl);
    });

    element.dataset.editing = 'true';
    element.classList.add('is-editing');
    element.append(select);

    const closeEditor = (restoreFocus = true) => {
      element.classList.remove('is-editing');
      element.dataset.editing = 'false';
      element.dataset.saving = 'false';
      if (select.parentElement === element) {
        select.remove();
      }
      if (restoreFocus) {
        element.focus();
      }
    };

    const commitChange = async (newValue) => {
      if (newValue === currentValue) {
        closeEditor();
        return;
      }

      element.dataset.saving = 'true';
      element.classList.add('is-saving');

      try {
        const response = await fetch(element.dataset.endpoint, {
          method: element.dataset.method || 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [element.dataset.field]: newValue })
        });
        const json = await response.json();
        if (!json.success) {
          throw new Error(json.message || 'Request failed');
        }
        element.dataset.value = newValue;
        updateInlineSelectDisplay(element, newValue);
      } catch (error) {
        console.error(error);
        alert('Unable to update this record right now.');
      } finally {
        element.classList.remove('is-saving');
        closeEditor();
      }
    };

    select.addEventListener('change', () => {
      commitChange(select.value).catch(() => {
        closeEditor();
      });
    });

    select.addEventListener('blur', () => {
      if (element.dataset.saving === 'true') {
        return;
      }
      closeEditor(false);
    });

    select.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeEditor();
      }
    });

    requestAnimationFrame(() => {
      select.focus();
    });
  };

  element.addEventListener('click', (event) => {
    event.preventDefault();
    openEditor();
  });

  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEditor();
    }
  });
};

inlineSelects.forEach(setupEditableSelect);

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
