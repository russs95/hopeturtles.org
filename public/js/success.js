const successForm = document.getElementById('successForm');
const successFeedback = document.getElementById('successFeedback');

if (successForm) {
  successForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(successForm);
    successFeedback.textContent = 'Uploading…';
    try {
      const response = await fetch('/api/success', {
        method: 'POST',
        body: formData
      });
      const json = await response.json();
      if (json.success) {
        successFeedback.textContent = 'Success logged. Thank you!';
        successForm.reset();
      } else {
        successFeedback.textContent = json.message || 'Submission failed.';
      }
    } catch (error) {
      successFeedback.textContent = 'Network error while submitting.';
    }
  });
}
