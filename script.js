/**
 * AsbestPro Danmark — script.js
 * Vanilla JS · No dependencies · Performance-first
 */

'use strict';

/* ============================================================
   STICKY HEADER
   ============================================================ */
(function initStickyHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;
  const SCROLL_THRESHOLD = 60;

  function updateHeader() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load
  updateHeader();
})();


/* ============================================================
   HAMBURGER MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('site-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    nav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on nav link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ============================================================
   HERO BACKGROUND PARALLAX / LOADED CLASS
   ============================================================ */
(function initHeroBackground() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;

  // Trigger zoom animation after a tick
  requestAnimationFrame(() => {
    setTimeout(() => heroBg.classList.add('loaded'), 100);
  });

  // Subtle parallax on scroll
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1) translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
})();


/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   ANIMATED COUNTERS (Stats section)
   ============================================================ */
(function initCounters() {
  const statNums = document.querySelectorAll('.stat-num');
  if (!statNums.length) return;

  // Extract numeric value from text content
  function getTargetValue(el) {
    const text = el.textContent;
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  function animateCounter(el, target, duration = 1600) {
    const suffix = el.querySelector('span');
    const suffixText = suffix ? suffix.textContent : '';
    const isDecimal = target % 1 !== 0;
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal
        ? (eased * target).toFixed(1)
        : Math.floor(eased * target);

      el.innerHTML = current + '<span>' + suffixText + '</span>';
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        statNums.forEach(el => {
          const target = getTargetValue(el);
          animateCounter(el, target);
        });
        observer.unobserve(statsSection);
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(statsSection);
})();


/* ============================================================
   FAQ ACCORDION
   ============================================================ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(other => {
        const otherAnswer = other.querySelector('.faq-answer');
        const otherBtn = other.querySelector('.faq-question');
        other.classList.remove('open');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ============================================================
   SMOOTH SCROLL (for anchor links)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const headerH = document.getElementById('site-header')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   LEAD FORM — Validation & Submit
   ============================================================ */
(function initLeadForm() {
  const form = document.getElementById('lead-form');
  const successEl = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');
  if (!form || !successEl || !submitBtn) return;

  function showError(input, msg) {
    input.style.borderColor = '#e74c3c';
    input.style.boxShadow = '0 0 0 3px rgba(231,76,60,.1)';
    // Show inline message if not already present
    let errEl = input.nextElementSibling;
    if (!errEl || !errEl.classList.contains('field-error')) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      errEl.style.cssText = 'color:#e74c3c;font-size:.78rem;margin-top:4px;display:block';
      input.parentNode.appendChild(errEl);
    }
    errEl.textContent = msg;
  }

  function clearError(input) {
    input.style.borderColor = '';
    input.style.boxShadow = '';
    const errEl = input.nextElementSibling;
    if (errEl && errEl.classList.contains('field-error')) errEl.remove();
  }

  function validateForm() {
    let valid = true;

    const navn = document.getElementById('navn');
    const tlf = document.getElementById('tlf');
    const email = document.getElementById('email');

    if (!navn.value.trim() || navn.value.trim().length < 2) {
      showError(navn, 'Indtast venligst dit navn');
      valid = false;
    } else clearError(navn);

    const tlfClean = tlf.value.replace(/\s/g, '');
    if (!tlfClean || !/^[0-9+]{8,}$/.test(tlfClean)) {
      showError(tlf, 'Indtast et gyldigt telefonnummer');
      valid = false;
    } else clearError(tlf);

    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, 'Indtast en gyldig e-mailadresse');
      valid = false;
    } else clearError(email);

    return valid;
  }

  // Live validation on blur
  ['navn', 'tlf', 'email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateForm());
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;animation:spin 1s linear infinite" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Sender...
    `;

    // Simulate async send (replace with real fetch in production)
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Show success
    form.style.display = 'none';
    successEl.style.display = 'flex';

    // Scroll to form card
    const card = document.querySelector('.contact-form-card');
    if (card) {
      const top = card.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  // Spinner keyframes (injected one-time)
  const style = document.createElement('style');
  style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
})();


/* ============================================================
   SERVICE CARD — keyboard accessibility
   ============================================================ */
(function initServiceCards() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const link = card.querySelector('.service-link');
        if (link) link.click();
      }
    });
  });
})();


/* ============================================================
   PHONE LINK — tracking hook (placeholder for analytics)
   ============================================================ */
(function initPhoneTracking() {
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      // Replace with: gtag('event', 'phone_click', {...}) or Facebook Pixel
      console.info('[AsbestPro] Phone CTA clicked');
    });
  });
})();


/* ============================================================
   FORM CTA tracking hook
   ============================================================ */
(function initFormTracking() {
  const btn = document.getElementById('hero-cta-offer');
  if (btn) {
    btn.addEventListener('click', () => {
      console.info('[AsbestPro] Hero form CTA clicked');
    });
  }
})();


console.info('%cAsbestPro Danmark', 'color:#FF6B35;font-size:1.2rem;font-weight:bold');
console.info('Performance-first · No external JS dependencies · Vanilla ES2020');
