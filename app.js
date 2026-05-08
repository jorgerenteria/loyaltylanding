/* ============================================================
   app.js — comportamiento mínimo de la landing
   - Cargado con `defer` (no bloquea parser)
   - Manejo de errores en todas las funciones
   - Sin librerías externas
   ============================================================ */
(() => {
  'use strict';

  /**
   * Inicializa el menú móvil (hamburger).
   */
  const initMobileNav = () => {
    try {
      const btn = document.getElementById('mobileBtn');
      const links = document.getElementById('navLinks');
      if (!btn || !links) return;

      btn.addEventListener('click', () => {
        try {
          const isOpen = links.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', String(isOpen));
          btn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        } catch (err) {
          console.error('[mobileNav] toggle error:', err);
        }
      });

      // Cerrar al hacer click en un enlace interno
      links.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', () => {
          try {
            links.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
          } catch (err) {
            console.error('[mobileNav] close-on-link error:', err);
          }
        });
      });
    } catch (err) {
      console.error('[mobileNav] init failed:', err);
    }
  };

  /**
   * Inicializa el acordeón de FAQ.
   * Un solo item abierto a la vez.
   */
  const initFaq = () => {
    try {
      const questions = document.querySelectorAll('.faq-question');
      if (!questions.length) return;

      questions.forEach((btn) => {
        btn.addEventListener('click', () => {
          try {
            const item = btn.parentElement;
            if (!item) return;

            const wasOpen = item.classList.contains('is-open');

            // Cerrar todos
            document.querySelectorAll('.faq-item').forEach((i) => {
              i.classList.remove('is-open');
              const q = i.querySelector('.faq-question');
              if (q) q.setAttribute('aria-expanded', 'false');
            });

            if (!wasOpen) {
              item.classList.add('is-open');
              btn.setAttribute('aria-expanded', 'true');
            }
          } catch (err) {
            console.error('[faq] toggle error:', err);
          }
        });
      });
    } catch (err) {
      console.error('[faq] init failed:', err);
    }
  };

  /**
   * Anima elementos `.reveal` cuando entran en viewport.
   * Fallback: si no hay IntersectionObserver, los muestra todos.
   */
  const initReveal = () => {
    try {
      const targets = document.querySelectorAll('.reveal');
      if (!targets.length) return;

      if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      targets.forEach((el) => observer.observe(el));
    } catch (err) {
      console.error('[reveal] init failed:', err);
    }
  };

  /**
   * Aplica clase al nav cuando el usuario hace scroll fuera del top.
   * Usa IntersectionObserver sobre un sentinel — evita listener de scroll
   * (mejor INP, no fuerza layout en cada frame).
   */
  const initNavScroll = () => {
    try {
      const nav = document.querySelector('.site-nav');
      const sentinel = document.querySelector('.nav-sentinel');
      if (!nav || !sentinel || !('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver(([entry]) => {
        try {
          nav.classList.toggle('is-scrolled', !entry.isIntersecting);
        } catch (err) {
          console.error('[navScroll] toggle error:', err);
        }
      }, { threshold: 0 });

      observer.observe(sentinel);
    } catch (err) {
      console.error('[navScroll] init failed:', err);
    }
  };

  /**
   * Trackeo de CTAs hacia GA4 vía GTM dataLayer.
   * Un solo listener delegado en `document` — se dispara con cualquier click
   * cuyo target (o ancestro) tenga `[data-cta-location]`.
   *
   * Empuja un evento `cta_click` con:
   *   - cta_location:    valor del atributo (ej. "hero_primary")
   *   - cta_text:        texto visible del enlace
   *   - cta_destination: href de destino
   *
   * El push es síncrono y ocurre antes de la navegación. GA4 usa `sendBeacon`
   * por defecto, así que el evento sobrevive a la navegación cross-origin.
   */
  const initCtaTracking = () => {
    try {
      // Garantiza que dataLayer exista aun si GTM falla en cargar.
      window.dataLayer = window.dataLayer || [];

      document.addEventListener('click', (event) => {
        try {
          const target = event.target.closest('[data-cta-location]');
          if (!target) return;

          const location = target.getAttribute('data-cta-location') || 'unknown';
          const text = (target.textContent || '').trim().replace(/\s+/g, ' ');
          const destination = target.getAttribute('href') || '';

          window.dataLayer.push({
            event: 'cta_click',
            cta_location: location,
            cta_text: text,
            cta_destination: destination,
          });
        } catch (err) {
          console.error('[ctaTracking] click error:', err);
        }
      });
    } catch (err) {
      console.error('[ctaTracking] init failed:', err);
    }
  };

  /**
   * Bootstrap.
   */
  const init = () => {
    try {
      initMobileNav();
      initFaq();
      initReveal();
      initNavScroll();
      initCtaTracking();
    } catch (err) {
      console.error('[app] init failed:', err);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
