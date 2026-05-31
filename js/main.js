/* ============================================
   Pine Needle Embroidery & Print
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const updateActiveLink = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle clicked
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const photoItems = document.querySelectorAll('.photo-item');
  const images = Array.from(photoItems).map(item => item.querySelector('img').src);
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    lightboxImg.src = images[currentIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex];
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex];
  };

  photoItems.forEach(item => {
    item.addEventListener('click', () => {
      openLightbox(parseInt(item.dataset.index));
    });
  });

  // --- Apparel Category Click → Lightbox ---
  let categoryImages = [];
  const openCategoryLightbox = (imgs, startIndex = 0) => {
    categoryImages = imgs;
    currentIndex = startIndex;
    lightboxImg.src = categoryImages[currentIndex];
    lightbox.classList.add('active');
    lightbox.dataset.mode = 'category';
    document.body.style.overflow = 'hidden';
  };

  document.querySelectorAll('.apparel-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const imgs = (card.dataset.images || '').split('|').filter(Boolean);
      if (imgs.length) openCategoryLightbox(imgs);
    });
  });

  // Override prev/next when in category mode
  const origShowPrev = showPrev;
  const origShowNext = showNext;
  lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    if (lightbox.dataset.mode === 'category' && categoryImages.length) {
      currentIndex = (currentIndex - 1 + categoryImages.length) % categoryImages.length;
      lightboxImg.src = categoryImages[currentIndex];
    }
  });
  lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    if (lightbox.dataset.mode === 'category' && categoryImages.length) {
      currentIndex = (currentIndex + 1) % categoryImages.length;
      lightboxImg.src = categoryImages[currentIndex];
    }
  });

  // Reset mode when lightbox closes
  const closeLightboxOriginal = closeLightbox;
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
    lightbox.dataset.mode = '';
    categoryImages = [];
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrev);
  lightbox.querySelector('.lightbox-next').addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // --- Scroll Animations ---
  const animateElements = document.querySelectorAll(
    '.method-card, .apparel-card, .highlight-card, .contact-card, .faq-item, .story-photo, .story-bio, .video-card, .photo-item'
  );

  animateElements.forEach(el => el.classList.add('fade-in'));

  // Stagger reveals within each grid/row for a premium cascade
  const revealGroups = new Set();
  animateElements.forEach(el => revealGroups.add(el.parentElement));
  revealGroups.forEach(parent => {
    parent.querySelectorAll(':scope > .fade-in').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 6) * 80}ms`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animateElements.forEach(el => observer.observe(el));

  // --- File upload preview ---
  const fileInput = document.getElementById('files');
  const fileList = document.getElementById('fileList');
  if (fileInput && fileList) {
    fileInput.addEventListener('change', () => {
      fileList.innerHTML = '';
      Array.from(fileInput.files).forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        const sizeKB = (file.size / 1024).toFixed(1);
        const sizeStr = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
        item.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>${file.name}</span><small>${sizeStr}</small>`;
        fileList.appendChild(item);
      });
    });
  }

  // --- Form handling (Netlify Forms) ---
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = quoteForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      try {
        const formData = new FormData(quoteForm);
        // Netlify expects POST to the page itself with multipart/form-data when files are attached
        const response = await fetch('/', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          btn.textContent = 'Quote Request Sent!';
          btn.style.background = '#4a7a2e';
          quoteForm.reset();
          if (fileList) fileList.innerHTML = '';
        } else {
          throw new Error('Submission failed (status ' + response.status + ')');
        }
      } catch (err) {
        btn.textContent = 'Error — please try again or call us';
        btn.style.background = '#a83232';
        console.error('Form submission error:', err);
      }

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = '';
      }, 4000);
    });
  }
});
