// Hero video fallback handler - handles video autoplay failures gracefully
(function () {
  var hero = document.querySelector('.hero');
  var video = document.querySelector('.hero-video');
  if (!hero || !video) return;

  try {
    var playPromise = video.play && video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(function () {
        hero.classList.add('no-video');
      });
    }
  } catch (e) {
    hero.classList.add('no-video');
  }

  video.addEventListener('error', function () {
    hero.classList.add('no-video');
  });

  // If metadata never loads (e.g., blocked, bad codec), fallback
  var metadataTimeout = setTimeout(function () {
    if (video.readyState < 1) hero.classList.add('no-video');
  }, 4000);
  video.addEventListener('loadedmetadata', function () {
    clearTimeout(metadataTimeout);
  });
})();

