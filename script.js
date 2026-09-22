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
     KICK LIVE STATUS
     Uses Kick's channel livestream status endpoint.
     No API secret is embedded in the website.
     ---------------------------------------------------------- */
  const kickCards = document.querySelectorAll('[data-kick-slug]');

  async function updateKickLiveStatus() {
    await Promise.all([...kickCards].map(async (card) => {
      const slug = card.dataset.kickSlug;
      const badge = card.querySelector('.member-card__live');
      if (!slug || !badge) return;

      try {
        const response = await fetch(
          `/api/kick-live?slug=${encodeURIComponent(slug)}`,
          { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
        );

        if (!response.ok) throw new Error(`LIVE status returned ${response.status}`);

        const data = await response.json();
        const live = data?.is_live === true;

        badge.classList.toggle('is-live', live);
        badge.setAttribute('aria-hidden', live ? 'false' : 'true');
      } catch (error) {
        // Keep the badge hidden if Kick cannot be reached.
        badge.classList.remove('is-live');
        badge.setAttribute('aria-hidden', 'true');
      }
    }));
  }

  updateKickLiveStatus();
  setInterval(updateKickLiveStatus, 60000);
