/**
 * CUT & PASTE INTERIOR STUDIO
 * Modular JavaScript Engine
 * Architecture: Clean modules with defensive existence checks
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initNavScrollSpy();
  initGalleryFilters();
  initLightbox();
  initForms();
  initVideoModal();
});

/* ─── 1. HEADER SCROLL EFFECT ─── */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.remove('is-transparent');
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
      header.classList.add('is-transparent');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

/* ─── 2. ACCESSIBLE MOBILE MENU DRAWER ─── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking any menu link
  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ─── 3. SCROLL REVEAL (INTERSECTION OBSERVER) ─── */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.fade-up');
  if (!revealElements.length) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches) {
    revealElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ─── 4. NAV SCROLL SPY (ACTIVE SECTION TRACKING) ─── */
function initNavScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => observer.observe(sec));
}

/* ─── 5. EDITORIAL GALLERY CATEGORY FILTER ─── */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-link');
  const galleryItems = document.querySelectorAll('.gallery-masonry-card');
  if (!filterBtns.length || !galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filterVal = btn.getAttribute('data-filter') || 'all';

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category') || '';
        if (filterVal === 'all' || itemCat === filterVal) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      if (window.StudioLightbox) {
        window.StudioLightbox.refresh();
      }
    });
  });
}

/* ─── 6. LIGHTBOX MODAL (KEYBOARD & TOUCH SWIPE) ─── */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-image');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const counterEl = document.getElementById('lightbox-counter');

  if (!modal || !imgEl) return;

  let visibleList = [];
  let currentIndex = 0;

  function parseVisibleItems() {
    visibleList = [];
    const items = document.querySelectorAll('.gallery-masonry-card:not([style*="none"])');
    items.forEach(item => {
      const img = item.querySelector('img');
      if (img) {
        visibleList.push({
          src: item.getAttribute('data-full') || img.src,
          alt: img.alt || 'Interior project image'
        });
      }
    });
  }

  function updateCounter() {
    if (counterEl) {
      counterEl.textContent = visibleList.length ? `${currentIndex + 1} / ${visibleList.length}` : '';
    }
  }

  function open(index) {
    parseVisibleItems();
    if (!visibleList.length) return;

    currentIndex = Math.max(0, Math.min(index, visibleList.length - 1));
    imgEl.src = visibleList[currentIndex].src;
    imgEl.alt = visibleList[currentIndex].alt;
    imgEl.style.opacity = '1';

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateCounter();

    if (closeBtn) closeBtn.focus();
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    imgEl.src = '';
  }

  function next() {
    if (!visibleList.length) return;
    currentIndex = (currentIndex + 1) % visibleList.length;
    fadeTransition();
  }

  function prev() {
    if (!visibleList.length) return;
    currentIndex = (currentIndex - 1 + visibleList.length) % visibleList.length;
    fadeTransition();
  }

  function fadeTransition() {
    imgEl.style.opacity = '0';
    setTimeout(() => {
      imgEl.src = visibleList[currentIndex].src;
      imgEl.alt = visibleList[currentIndex].alt;
      imgEl.style.opacity = '1';
      updateCounter();
    }, 150);
  }

  // Click triggers
  document.querySelectorAll('.gallery-masonry-card').forEach(card => {
    card.addEventListener('click', () => {
      parseVisibleItems();
      const visibleCards = Array.from(document.querySelectorAll('.gallery-masonry-card:not([style*="none"])'));
      const clickedIdx = visibleCards.indexOf(card);
      open(Math.max(0, clickedIdx));
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (nextBtn)  nextBtn.addEventListener('click', next);
  if (prevBtn)  prevBtn.addEventListener('click', prev);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  // Touch swipe support
  let touchStartX = 0;
  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 45) {
      diff < 0 ? next() : prev();
    }
  });

  imgEl.style.transition = 'opacity 0.15s ease';

  window.StudioLightbox = { refresh: parseVisibleItems };
}

/* ─── 7. VIDEO / CINEMATIC PLAYER CONTAINER ─── */
function initVideoModal() {
  const frame = document.getElementById('video-frame');
  if (!frame) return;

  frame.addEventListener('click', () => {
    const videoUrl = frame.getAttribute('data-video-url');
    if (!videoUrl || videoUrl.trim() === '') {
      // Safe no-op if no video URL is configured yet
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = videoUrl.includes('?') ? `${videoUrl}&autoplay=1` : `${videoUrl}?autoplay=1`;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;';
    
    frame.innerHTML = '';
    frame.appendChild(iframe);
  });
}

/* ─── 8. CONSULTATION INTAKE FORM (VALIDATION & FEEDBACK) ─── */
function initForms() {
  const form = document.getElementById('consultation-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const origText = submitBtn.textContent;
    const statusBox = form.querySelector('.form-status');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Frontend presentation confirmation
    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = origText;

      if (statusBox) {
        statusBox.classList.add('is-success');
        statusBox.textContent = 'Thank you. Your consultation request has been received. Our team will contact you shortly.';
        setTimeout(() => {
          statusBox.classList.remove('is-success');
          statusBox.textContent = '';
        }, 5000);
      }
    }, 1200);
  });
}
