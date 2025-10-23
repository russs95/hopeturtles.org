const adminForms = document.querySelectorAll('.admin-form');
const deleteButtons = document.querySelectorAll('.admin-table .delete');

adminForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const endpoint = form.dataset.endpoint;
    const method = form.dataset.method || 'POST';
    const feedback = form.querySelector('.form-feedback');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
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
        setTimeout(() => window.location.reload(), 800);
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
