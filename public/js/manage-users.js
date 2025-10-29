(function () {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    const container = document.querySelector('main.manage-users');
    if (!container) {
      return;
    }

    const canEdit = String(container.dataset.canEdit).toLowerCase() === 'true';
    if (!canEdit) {
      return;
    }

    let roleOptions = [];
    try {
      roleOptions = JSON.parse(container.dataset.roleOptions || '[]');
    } catch (error) {
      console.warn('Unable to parse role options for manage users view.', error);
    }

    const getRoleLabel = (value) => {
      const match = roleOptions.find((option) => option.value === value);
      return match ? match.label : value;
    };

    const ensureFeedbackHost = () => {
      let host = container.querySelector('.manage-users-feedback');
      if (!host) {
        host = document.createElement('div');
        host.className = 'manage-users-feedback';
        host.setAttribute('role', 'status');
        host.setAttribute('aria-live', 'polite');
        host.setAttribute('aria-atomic', 'true');
        const panel = container.querySelector('.panel');
        if (panel) {
          container.insertBefore(host, panel);
        } else {
          container.appendChild(host);
        }
      }
      return host;
    };

    const ensureLiveRegion = () => {
      let region = container.querySelector('.manage-users-live');
      if (!region) {
        region = document.createElement('div');
        region.className = 'sr-only manage-users-live';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        container.appendChild(region);
      }
      return region;
    };

    const feedbackHost = ensureFeedbackHost();
    const liveRegion = ensureLiveRegion();
    let hideTimeout;

    const showFeedback = (type, message) => {
      feedbackHost.textContent = message;
      feedbackHost.classList.remove(
        'manage-users-feedback--success',
        'manage-users-feedback--error',
        'manage-users-feedback--info',
        'is-visible'
      );
      feedbackHost.classList.add(`manage-users-feedback--${type}`, 'is-visible');
      liveRegion.textContent = message;
      if (hideTimeout) {
        window.clearTimeout(hideTimeout);
      }
      hideTimeout = window.setTimeout(() => {
        feedbackHost.classList.remove('is-visible');
      }, 4000);
    };

    const roleSelects = container.querySelectorAll('.role-select');
    roleSelects.forEach((select) => {
      select.addEventListener('change', async () => {
        const userId = select.dataset.userId;
        const previousRole = select.dataset.currentRole;
        const newRole = select.value;
        if (!userId || !newRole) {
          return;
        }

        if (newRole === previousRole) {
          return;
        }

        const row = select.closest('tr');
        const displayName = row?.querySelector('strong')?.textContent?.trim() || `User #${userId}`;

        select.disabled = true;
        showFeedback('info', `Updating ${displayName}…`);

        try {
          const response = await fetch(`/api/users/${encodeURIComponent(userId)}/role`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
          });

          if (!response.ok) {
            let message = 'Unable to update role.';
            try {
              const data = await response.json();
              if (data?.message) {
                message = data.message;
              }
            } catch (error) {
              console.warn('Failed to parse error response when updating role.', error);
            }
            throw new Error(message);
          }

          select.dataset.currentRole = newRole;
          showFeedback('success', `${displayName} is now ${getRoleLabel(newRole)}.`);
        } catch (error) {
          select.value = previousRole;
          showFeedback('error', error.message || 'Unable to update role.');
        } finally {
          select.disabled = false;
        }
      });
    });
  });
})();
