(() => {
  const aboutVideo = document.querySelector('.about-hero__video');
  if (!aboutVideo) {
    return;
  }

  const holdFinalFrame = () => {
    window.requestAnimationFrame(() => {
      try {
        aboutVideo.pause();
        const duration = Number.isFinite(aboutVideo.duration) ? aboutVideo.duration : null;
        if (duration) {
          aboutVideo.currentTime = duration;
        }
      } catch (error) {
        // Swallow errors from attempting to manipulate the media element in unsupported browsers.
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[about] Unable to hold video at final frame.', error);
        }
      }
    });
  };

  aboutVideo.loop = false;
  aboutVideo.removeAttribute('loop');

  aboutVideo.addEventListener('ended', holdFinalFrame);
})();
