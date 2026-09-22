/* ============================================================
   HAMMER CREW — JAVASCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     SCROLL ANIMATIONS — IntersectionObserver
     ---------------------------------------------------------- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-up, .fade-in').forEach((el) => {
    observer.observe(el);
  });

  /* ----------------------------------------------------------
     HERO ENTRANCE (runs immediately on load)
     ---------------------------------------------------------- */
  const heroLogo  = document.querySelector('.hero__logo-wrap');
  const heroTitle = document.querySelector('.hero__title-row');
  const heroTag   = document.querySelector('.hero__tagline');

  // Small delay so the page paints first
  setTimeout(() => {
    if (heroLogo)  { heroLogo.style.opacity  = '1'; heroLogo.style.transform  = 'scale(1) rotate(0deg)'; }
    if (heroTitle) { heroTitle.style.opacity = '1'; heroTitle.style.transform = 'translateY(0)'; }
  }, 100);

  setTimeout(() => {
    if (heroTag) { heroTag.style.opacity = '1'; }
  }, 400);

});

  /* ----------------------------------------------------------
     KICK LIVE STATUS — MUSTAFA TEST ONLY
     ---------------------------------------------------------- */
  const mustafaKickStatus = document.getElementById('mustafa-kick-status');

  async function updateMustafaKickStatus() {
    if (!mustafaKickStatus) return;

    try {
      const response = await fetch('/api/kick-status?slug=mustafa_go', {
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      mustafaKickStatus.hidden = !data.is_live;
    } catch (error) {
      // If the API is unavailable, don't show a false LIVE state.
      mustafaKickStatus.hidden = true;
      console.warn('Kick live status check failed:', error);
    }
  }

  updateMustafaKickStatus();
  setInterval(updateMustafaKickStatus, 15 * 1000);

