/* ============================================================
   HAMMER CREW — JAVASCRIPT & KICK API INTEGRATION
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
     HERO ENTRANCE
     ---------------------------------------------------------- */
  const heroLogo  = document.querySelector('.hero__logo-wrap');
  const heroTitle = document.querySelector('.hero__title-row');
  const heroTag   = document.querySelector('.hero__tagline');

  setTimeout(() => {
    if (heroLogo)  { heroLogo.style.opacity  = '1'; heroLogo.style.transform  = 'scale(1) rotate(0deg)'; }
    if (heroTitle) { heroTitle.style.opacity = '1'; heroTitle.style.transform = 'translateY(0)'; }
  }, 100);

  setTimeout(() => {
    if (heroTag) { heroTag.style.opacity = '1'; }
  }, 400);

  /* ----------------------------------------------------------
     KICK API LIVE TRACKER (فحص البث المباشر)
     ---------------------------------------------------------- */
  async function checkChannelLive(channelSlug) {
    const targetUrl = `https://kick.com/api/v1/channels/${channelSlug}`;
    const endpoints = [
      targetUrl,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (response.ok) {
          const data = await response.json();
          if (data && data.livestream !== undefined) {
            return data.livestream !== null && data.livestream !== false;
          }
        }
      } catch (err) {
        // Fallback to next endpoint
      }
    }
    return false;
  }

  async function updateKickLiveStatus() {
    const memberCards = document.querySelectorAll('.member-card[data-kick]');

    memberCards.forEach(async (card) => {
      const channelSlug = card.getAttribute('data-kick');
      if (!channelSlug) return;

      const isLive = await checkChannelLive(channelSlug);

      if (isLive) {
        card.classList.add('is-live');
      } else {
        card.classList.remove('is-live');
      }
    });
  }

  // تشغيل الفحص المباشر فور فتح الموقع
  updateKickLiveStatus();

  // إعادة الفحص تلقائياً كل 60 ثانية
  setInterval(updateKickLiveStatus, 60000);

});
