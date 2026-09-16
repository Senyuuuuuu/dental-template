/**
 * DENTIVA — Premium Dental Clinic JavaScript
 * GSAP ScrollTrigger Animations, Mouse Parallax, Counter Stats & Modal Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroParallax();
  initHeroCounters();
  initStatsCounter();
  initGSAPScrollAnimations();
  initMobileMenu();
  initAppointmentModal();
  initSmoothScroll();
  initBeforeAfterSlider();
  initFAQAccordion();
  initMessengerConcierge();
});

/* --------------------------------------------------------------------------
   1. Dynamic Curved SVG Leader Lines & 3D Mouse Parallax
   -------------------------------------------------------------------------- */
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const implant = document.getElementById('implantAnchor') || document.getElementById('implantWrapper') || document.getElementById('implantImg') || document.getElementById('heroBgVideo');
  const calloutLeft = document.getElementById('calloutRootCanal');
  const calloutRight = document.getElementById('calloutInvisalign');
  const canvas = document.getElementById('calloutSvgCanvas');
  const pathL = document.getElementById('leaderPathL');
  const dotL = document.getElementById('leaderDotL');
  const pathR = document.getElementById('leaderPathR');
  const dotR = document.getElementById('leaderDotR');

  if (!hero || !implant) return;

  /**
   * Recalculate curved SVG paths connecting labels to the implant
   */
  function updateLeaderLines() {
    if (!canvas || !calloutLeft || !calloutRight || !pathL || !pathR) return;

    const canvasRect = canvas.getBoundingClientRect();
    const leftRect = calloutLeft.getBoundingClientRect();
    const rightRect = calloutRight.getBoundingClientRect();
    const implantRect = implant.getBoundingClientRect();

    if (canvasRect.width === 0 || implantRect.width === 0) return;

    // 1. Left Line: Root Canal Treatment -> Abutment Collar (~50% W, ~44% H)
    const startX1 = leftRect.right - canvasRect.left;
    const startY1 = (leftRect.top + leftRect.height / 2) - canvasRect.top;
    const targetX1 = (implantRect.left + implantRect.width * 0.49) - canvasRect.left;
    const targetY1 = (implantRect.top + implantRect.height * 0.44) - canvasRect.top;

    const ctrlX1_A = startX1 + (targetX1 - startX1) * 0.55;
    const ctrlY1_A = startY1 + 4;
    const ctrlX1_B = targetX1 - (targetX1 - startX1) * 0.25;
    const ctrlY1_B = targetY1 - 2;

    const d1 = `M ${startX1.toFixed(1)} ${startY1.toFixed(1)} C ${ctrlX1_A.toFixed(1)} ${ctrlY1_A.toFixed(1)}, ${ctrlX1_B.toFixed(1)} ${ctrlY1_B.toFixed(1)}, ${targetX1.toFixed(1)} ${targetY1.toFixed(1)}`;
    pathL.setAttribute('d', d1);
    if (dotL) {
      dotL.setAttribute('cx', targetX1.toFixed(1));
      dotL.setAttribute('cy', targetY1.toFixed(1));
    }

    // 2. Right Line: Invisalign -> Titanium Screw Thread (~50% W, ~62% H)
    const startX2 = rightRect.left - canvasRect.left;
    const startY2 = (rightRect.top + rightRect.height / 2) - canvasRect.top;
    const targetX2 = (implantRect.left + implantRect.width * 0.51) - canvasRect.left;
    const targetY2 = (implantRect.top + implantRect.height * 0.62) - canvasRect.top;

    const ctrlX2_A = startX2 - (startX2 - targetX2) * 0.55;
    const ctrlY2_A = startY2 - 4;
    const ctrlX2_B = targetX2 + (startX2 - targetX2) * 0.25;
    const ctrlY2_B = targetY2 + 2;

    const d2 = `M ${startX2.toFixed(1)} ${startY2.toFixed(1)} C ${ctrlX2_A.toFixed(1)} ${ctrlY2_A.toFixed(1)}, ${ctrlX2_B.toFixed(1)} ${ctrlY2_B.toFixed(1)}, ${targetX2.toFixed(1)} ${targetY2.toFixed(1)}`;
    pathR.setAttribute('d', d2);
    if (dotR) {
      dotR.setAttribute('cx', targetX2.toFixed(1));
      dotR.setAttribute('cy', targetY2.toFixed(1));
    }
  }

  // Bind responsive update listeners
  window.addEventListener('resize', updateLeaderLines);
  window.addEventListener('load', updateLeaderLines);
  updateLeaderLines();
  if (implant.tagName === 'VIDEO') {
    implant.addEventListener('loadeddata', updateLeaderLines);
  } else if (implant.tagName === 'IMG' && !implant.complete) {
    implant.addEventListener('load', updateLeaderLines);
  }

  // Track target vs current values for buttery interpolation
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized from -1 to 1
    mouseX = (e.clientX - centerX) / (rect.width / 2);
    mouseY = (e.clientY - centerY) / (rect.height / 2);
  });

  hero.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  function animateParallax() {
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    if (window.innerWidth > 980) {
      const rotY = currentX * 7;
      const rotX = -currentY * 7;
      const transX = currentX * 12;
      const transY = currentY * 8;

      implant.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0)`;

      if (calloutLeft) {
        calloutLeft.style.transform = `translateY(-50%) translate3d(${(transX * 0.4).toFixed(1)}px, ${(transY * 0.4).toFixed(1)}px, 0)`;
      }
      if (calloutRight) {
        calloutRight.style.transform = `translateY(-50%) translate3d(${(transX * 0.4).toFixed(1)}px, ${(transY * 0.4).toFixed(1)}px, 0)`;
      }

      updateLeaderLines();
    }

    requestAnimationFrame(animateParallax);
  }

  animateParallax();
}

/* --------------------------------------------------------------------------
   2. Number Counter Animation for Statistics Ribbon & Hero Metrics
   -------------------------------------------------------------------------- */
function initHeroCounters() {
  const heroCounters = document.querySelectorAll(
    '#hero .stat-big-val[data-target], #hero .metric-num[data-target], #hero .m-stat-val[data-target]'
  );
  if (!heroCounters.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        heroCounters.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target)) return;
          const rawText = el.textContent.trim();
          let suffix = '';
          if (rawText.endsWith('+') || el.dataset.suffix === '+') suffix = '+';
          else if (rawText.endsWith('%') || el.dataset.suffix === '%') suffix = '%';
          animateCount(el, 0, target, 1600, suffix);
        });
      }
    });
  }, { threshold: 0.15 });

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    observer.observe(heroSection);
  }
}

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target)) return;
          const rawText = el.textContent.trim();
          let suffix = '';
          if (rawText.endsWith('+') || el.dataset.suffix === '+') suffix = '+';
          else if (rawText.endsWith('%') || el.dataset.suffix === '%') suffix = '%';
          else if (rawText.endsWith('k') || rawText.endsWith('K')) suffix = 'k';
          animateCount(el, 0, target, 1600, suffix);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsRibbon = document.getElementById('stats');
  if (statsRibbon) {
    observer.observe(statsRibbon);
  }
}

function animateCount(el, start, end, duration, suffix = '') {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(easeProgress * (end - start) + start);
    el.textContent = currentVal + suffix;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = end + suffix;
    }
  }

  window.requestAnimationFrame(step);
}

/* --------------------------------------------------------------------------
   3. GSAP & ScrollTrigger Viewport Animations
   -------------------------------------------------------------------------- */
function initGSAPScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  // A. Dynamic Global Top Scroll Progress Bar
  let progressBar = document.getElementById('scrollProgressBar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scrollProgressBar';
    progressBar.className = 'scroll-progress-bar';
    document.body.prepend(progressBar);
  }

  gsap.to(progressBar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.15
    }
  });

  // B. Hero Kinetic Entrance & Scroll Parallax (Scoped to #hero)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Smooth Kinetic 3D entrance
    heroTL
      .from('#hero .pill-badge', { opacity: 0, y: -16, scale: 0.92, duration: 0.65, delay: 0.1 })
      .from('#hero .heading-line-1, #hero .heading-line-2, #hero .heading-subline-mobile', {
        opacity: 0,
        y: 44,
        rotateX: 12,
        transformOrigin: 'top center',
        duration: 0.85,
        stagger: 0.14,
        ease: 'power4.out'
      }, '-=0.45')
      .from('#hero .hero-description', { opacity: 0, y: 22, duration: 0.65 }, '-=0.4')
      .from('#hero .hero-cta-group', { opacity: 0, y: 20, scale: 0.96, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.4')
      .from('#hero .implant-img', { opacity: 0, scale: 0.84, y: 36, duration: 1.05, ease: 'power3.out' }, '-=0.65')
      .from('#hero .implant-callout', { opacity: 0, scale: 0.88, y: 15, stagger: 0.18, duration: 0.65, ease: 'back.out(1.5)' }, '-=0.5')
      .from('#hero .heading-subline-1, #hero .heading-subline-2', {
        opacity: 0,
        y: 38,
        rotateX: 10,
        stagger: 0.14,
        duration: 0.8,
        ease: 'power4.out'
      }, '-=0.7')
      .from('#hero .hero-right-metrics, #hero .hero-mobile-stats-card', { opacity: 0, y: 24, duration: 0.65 }, '-=0.4')
      .from('#hero .hero-bottom-stat', { opacity: 0, y: 18, duration: 0.55 }, '-=0.35');

    // Scrubbed text scroll parallax: Headline drifts slightly upward giving layered depth
    gsap.to('#hero .hero-heading', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8
      },
      yPercent: -18,
      opacity: 0.82,
      ease: 'none'
    });

    const heroHeadingCont = document.querySelector('.hero-heading-continuation');
    if (heroHeadingCont) {
      gsap.to(heroHeadingCont, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1
        },
        yPercent: -26,
        opacity: 0.78,
        ease: 'none'
      });
    }

    // Smooth scrubbed parallax on 3D implant and watermark as user scrolls down hero
    const implantWrapper = document.getElementById('implantWrapper');
    if (implantWrapper) {
      gsap.to(implantWrapper, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        },
        y: 75,
        ease: 'none'
      });
    }

    const heroWatermark = document.querySelector('.hero-watermark');
    if (heroWatermark) {
      gsap.to(heroWatermark, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        },
        y: 85,
        opacity: 0.14,
        ease: 'none'
      });
    }

    const annotationsOverlay = document.getElementById('annotationsOverlay');
    if (annotationsOverlay) {
      gsap.to(annotationsOverlay, {
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '60% top',
          scrub: 0.8
        },
        opacity: 0.25,
        y: -20,
        ease: 'none'
      });
    }
  }

  // C. Subpage Hero Banners (services.html, before-after.html, reviews.html, faq.html, contact.html)
  const subpageHero = document.querySelector('.subpage-hero');
  if (subpageHero) {
    const subTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    subTL
      .from('.subpage-breadcrumbs', { opacity: 0, y: -12, duration: 0.5, delay: 0.1 })
      .from('.subpage-title', { opacity: 0, y: 28, duration: 0.75 }, '-=0.3')
      .from('.subpage-desc', { opacity: 0, y: 18, duration: 0.65 }, '-=0.4');
  }

  // D. Statistics Ribbon Scroll Animation
  const statsRibbon = document.querySelector('.stats-ribbon');
  if (statsRibbon) {
    gsap.from('.stat-block', {
      scrollTrigger: {
        trigger: '.stats-ribbon',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.stat-divider', {
      scrollTrigger: {
        trigger: '.stats-ribbon',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      scaleY: 0,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out'
    });
  }

  // E. Interactive Before & After Transformation Section
  const baSection = document.querySelector('.before-after-section');
  if (baSection) {
    gsap.from('.before-after-section .ba-header-row', {
      scrollTrigger: {
        trigger: '.before-after-section',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.before-after-section .ba-controls-nav', {
      scrollTrigger: {
        trigger: '.before-after-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });

    gsap.from('.ba-comparison-frame', {
      scrollTrigger: {
        trigger: '.ba-display-container',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      x: -40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });

    gsap.from('.ba-info-card', {
      scrollTrigger: {
        trigger: '.ba-display-container',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      x: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });

    gsap.from('.ba-metric-pill', {
      scrollTrigger: {
        trigger: '.ba-info-card',
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      scale: 0.92,
      y: 16,
      opacity: 0,
      stagger: 0.08,
      duration: 0.5,
      ease: 'back.out(1.4)'
    });

    // Interactive slider teaser animation when entering viewport
    const comparisonFrame = document.getElementById('baComparisonFrame');
    if (comparisonFrame) {
      ScrollTrigger.create({
        trigger: '#baComparisonFrame',
        start: 'top 75%',
        once: true,
        onEnter: () => {
          const divider = document.getElementById('baHandleDivider');
          const beforeLayer = document.getElementById('baBeforeLayer');
          if (divider && beforeLayer) {
            const state = { pos: 50 };
            gsap.to(state, {
              pos: 36,
              duration: 0.65,
              ease: 'power2.out',
              onUpdate: () => {
                divider.style.left = `${state.pos}%`;
                beforeLayer.style.width = `${state.pos}%`;
              },
              onComplete: () => {
                gsap.to(state, {
                  pos: 50,
                  duration: 0.85,
                  ease: 'elastic.out(1.1, 0.45)',
                  onUpdate: () => {
                    divider.style.left = `${state.pos}%`;
                    beforeLayer.style.width = `${state.pos}%`;
                  }
                });
              }
            });
          }
        }
      });
    }
  }

  // F. Dark Services Section & Cards
  const darkServices = document.querySelector('.dark-services-container');
  if (darkServices) {
    gsap.from('.dark-services-container', {
      scrollTrigger: {
        trigger: '.dark-services-container',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });

    gsap.from('.dark-header-row', {
      scrollTrigger: {
        trigger: '.dark-services-container',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.dark-services-container .service-card', {
      scrollTrigger: {
        trigger: '.dark-services-container .service-cards-grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      scale: 0.96,
      stagger: 0.15,
      duration: 0.85,
      ease: 'power3.out'
    });
  }

  // G. Verified Patient Reviews Section
  const reviewsSection = document.querySelector('.reviews-section');
  if (reviewsSection) {
    gsap.from('.trust-score-header', {
      scrollTrigger: {
        trigger: '.reviews-section',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      scale: 0.94,
      y: 24,
      opacity: 0,
      duration: 0.75,
      ease: 'back.out(1.2)'
    });

    gsap.from('.reviews-section .review-card-item', {
      scrollTrigger: {
        trigger: '.reviews-cards-grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  // H. Discount / CarePass Section
  const discountSection = document.querySelector('.discount-section');
  if (discountSection) {
    gsap.from('.discount-copy-col', {
      scrollTrigger: {
        trigger: '.discount-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      x: -35,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out'
    });

    gsap.from('.discount-perks .perk-item', {
      scrollTrigger: {
        trigger: '.discount-perks',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      x: -20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out'
    });

    gsap.from('.pale-promo-card', {
      scrollTrigger: {
        trigger: '.discount-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      x: 35,
      scale: 0.94,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out'
    });

    gsap.from('.promo-smiley-wrapper', {
      scrollTrigger: {
        trigger: '.pale-promo-card',
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      rotate: -20,
      scale: 0.8,
      duration: 0.85,
      ease: 'back.out(1.8)'
    });
  }

  // I. FAQ Accordion Section - Guaranteed 100% visibility at all times
  const faqSection = document.querySelector('.faq-section');
  if (faqSection) {
    // Proactively ensure all FAQ elements are fully visible immediately
    document.querySelectorAll('.faq-section, .faq-item-card, .faq-accordion-container, .faq-section *').forEach(el => {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    });

    // Subtle translation only; opacity remains strictly at 1
    gsap.fromTo('.faq-section > div:first-child', 
      { y: 15 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.faq-section',
          start: 'top 95%',
          toggleActions: 'play none none none',
          once: true
        },
        clearProps: 'transform'
      }
    );

    const faqItems = document.querySelectorAll('.faq-item-card');
    if (faqItems.length > 0) {
      gsap.fromTo(faqItems,
        { y: 12 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.45,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: faqSection,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true
          },
          clearProps: 'transform'
        }
      );
    }
  }

  // J. Subpage Clinical & Clinic Cards (services.html, before-after.html, contact.html)
  const genericCards = document.querySelectorAll('section article:not(.service-card):not(.review-card-item)');
  if (genericCards.length > 0) {
    gsap.from(genericCards, {
      scrollTrigger: {
        trigger: genericCards[0].parentElement,
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  // K. Site Footer Stagger Entrance
  const siteFooter = document.querySelector('.site-footer');
  if (siteFooter) {
    gsap.from('.site-footer .footer-top-row > div', {
      scrollTrigger: {
        trigger: '.site-footer',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 35,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: 'power3.out'
    });
  }

  // L. Universal Section Headings & Badges Kinetic Scroll Entrance
  const sectionHeadings = document.querySelectorAll(
    '.before-after-section h2, .dark-title, .discount-heading, .subpage-title, .section-title-lg'
  );
  sectionHeadings.forEach((heading) => {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      y: 34,
      opacity: 0,
      duration: 0.85,
      ease: 'power3.out'
    });
  });

  const sectionPills = document.querySelectorAll(
    'section .pill-badge:not(.faq-section .pill-badge), .section-pill-tag'
  );
  sectionPills.forEach((pill) => {
    gsap.from(pill, {
      scrollTrigger: {
        trigger: pill,
        start: 'top 92%',
        toggleActions: 'play none none none'
      },
      scale: 0.88,
      opacity: 0,
      duration: 0.55,
      ease: 'back.out(1.5)'
    });
  });
}

/* --------------------------------------------------------------------------
   4. Mobile Menu Handling (Apple-Smooth & Hero-Vibe Integration)
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (window.lenis) {
      if (isOpen) window.lenis.stop();
      else window.lenis.start();
    }
  });

  // Close when clicking any menu link
  const links = mobileMenu.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      if (window.lenis) window.lenis.start();
    });
  });

  // Close when clicking outside of the mobile menu
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      if (window.lenis) window.lenis.start();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      if (window.lenis) window.lenis.start();
    }
  });
}

/* --------------------------------------------------------------------------
   5. Appointment Modal Logic
   -------------------------------------------------------------------------- */
function initAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  const openBtn = document.getElementById('bookAppointmentBtn');
  const enrollBtn = document.getElementById('enrollPlanBtn');
  const closeBtn = document.getElementById('modalCloseBtn');
  const bookingForm = document.getElementById('bookingForm');
  const successBox = document.getElementById('bookingSuccess');

  if (!modal) return;

  function openModal(serviceKey) {
    if (serviceKey) {
      const select = document.getElementById('treatmentSelect');
      if (select) {
        if (serviceKey === 'whitening') select.value = 'cleaning';
        else if (serviceKey === 'veneers' || serviceKey === 'implant') select.value = 'implant';
        else if (serviceKey === 'filling') select.value = 'filling';
        else if (serviceKey === 'checkup') select.value = 'checkup';
      }
    }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
    
    // Reset form after close animation
    setTimeout(() => {
      if (bookingForm && successBox) {
        bookingForm.style.display = 'flex';
        successBox.style.display = 'none';
        bookingForm.reset();
      }
    }, 350);
  }

  if (openBtn) openBtn.addEventListener('click', () => openModal());
  if (enrollBtn) enrollBtn.addEventListener('click', () => openModal());
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Global methods for inline handlers
  window.openAppointmentModal = openModal;
  window.closeAppointmentModal = closeModal;
  window.handleBookingSubmit = function () {
    if (bookingForm && successBox) {
      bookingForm.style.display = 'none';
      successBox.style.display = 'block';
    }
  };
}

/* --------------------------------------------------------------------------
   6. Lenis Smooth Momentum Scrolling, Anchor Offsets & Back-to-Top
   -------------------------------------------------------------------------- */
let lenisInstance = null;

function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('header[id], section[id], footer[id]');
  const navbar = document.getElementById('navbar');
  const subpageNav = document.querySelector('.subpage-nav-wrapper');

  // Check user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Lenis for luxurious buttery smooth scrolling across entire page
  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    try {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      });

      window.lenis = lenisInstance;

      // Integrate Lenis with GSAP ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        lenisInstance.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenisInstance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    } catch (e) {
      console.warn('Lenis smooth scroll initialization skipped:', e);
    }
  }

  // Butter-smooth anchor scrolling with dynamic header offset
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 90;

        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, {
            offset: -headerOffset,
            duration: 1.15
          });
        } else {
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }

        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          const menuToggle = document.getElementById('menuToggle');
          if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
          }
          if (lenisInstance) lenisInstance.start();
        }
      }
    });
  });

  // Handle URL hash on page load (e.g. services.html#veneers or index.html#faq)
  if (window.location.hash) {
    const hashTarget = document.querySelector(window.location.hash);
    if (hashTarget) {
      setTimeout(() => {
        if (lenisInstance) {
          lenisInstance.scrollTo(hashTarget, { offset: -90, duration: 0.9 });
        } else {
          const elementPosition = hashTarget.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 90;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 350);
    }
  }

  // Inject Back-to-Top button if not present
  let backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) {
    backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    backToTopBtn.setAttribute('title', 'Scroll to top');
    backToTopBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    `;
    document.body.appendChild(backToTopBtn);

    backToTopBtn.addEventListener('click', () => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  let isScrolled = false;
  let ticking = false;

  function updateNavbarScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.getElementById('siteHeader') || document.querySelector('.subpage-nav-wrapper') || document.querySelector('.site-header-wrapper');
    const nav = document.getElementById('navbar') || document.querySelector('.navbar');

    // Apple smoothness navbar pop out
    if (!isScrolled && scrollY > 16) {
      isScrolled = true;
      if (header) header.classList.add('scrolled');
      if (nav) nav.classList.add('scrolled');
    } else if (isScrolled && scrollY <= 8) {
      isScrolled = false;
      if (header) header.classList.remove('scrolled');
      if (nav) nav.classList.remove('scrolled');
    }

    // Back to Top Button Visibility
    if (scrollY > 380) {
      if (backToTopBtn) backToTopBtn.classList.add('visible');
    } else {
      if (backToTopBtn) backToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNavbarScroll();

        // C. Section spy for nav links (runs on scroll)
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        let current = '';

        sections.forEach((section) => {
          const sectionHeight = section.offsetHeight;
          const sectionTop = section.offsetTop - 120;
          if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach((link) => {
          if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
              link.classList.add('active');
            }
          }
        });

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Run on initial load so state is immediately accurate
  updateNavbarScroll();

  // Safety watchdog: ensure FAQ section and items are always fully visible
  function ensureFAQVisible() {
    document.querySelectorAll('.faq-section, .faq-item-card, .faq-accordion-container').forEach(el => {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    });
  }
  ensureFAQVisible();
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
    ensureFAQVisible();
    setTimeout(ensureFAQVisible, 300);
  });
}

/* --------------------------------------------------------------------------
   7. Interactive Before & After Teeth Slider & Treatment Tabs
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const frame = document.getElementById('baComparisonFrame');
  const beforeLayer = document.getElementById('baBeforeLayer');
  const divider = document.getElementById('baHandleDivider');
  const tabBtns = document.querySelectorAll('.ba-tab-btn');

  const beforeImg = document.getElementById('baBeforeImg');
  const afterImg = document.getElementById('baAfterImg');
  const title = document.getElementById('baTitle');
  const desc = document.getElementById('baDesc');
  const caseNumber = document.getElementById('baCaseNumber');
  const metric1 = document.getElementById('baMetric1');
  const metric2 = document.getElementById('baMetric2');
  const metric3 = document.getElementById('baMetric3');
  const metric4 = document.getElementById('baMetric4');

  if (!frame || !beforeLayer || !divider) return;

  let isDragging = false;

  function updateSlider(clientX) {
    const rect = frame.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;
    percentage = Math.max(4, Math.min(96, percentage));

    beforeLayer.style.width = `${percentage}%`;
    divider.style.left = `${percentage}%`;
  }

  // Pointer Events for responsive touch & mouse drag
  frame.addEventListener('pointerdown', (e) => {
    isDragging = true;
    updateSlider(e.clientX);
    try { frame.setPointerCapture(e.pointerId); } catch(err) {}
  });

  frame.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  const stopDrag = (e) => {
    if (isDragging) {
      isDragging = false;
      try { frame.releasePointerCapture(e.pointerId); } catch(err) {}
    }
  };

  frame.addEventListener('pointerup', stopDrag);
  frame.addEventListener('pointercancel', stopDrag);

  // Treatment Data Dictionary
  const treatmentsData = {
    whitening: {
      beforeSrc: 'assets/before_whitening.jpg',
      afterSrc: 'assets/after_whitening.jpg',
      caseNum: 'Case #8412 • Single Session',
      title: 'Laser Cold-Light Whitening',
      desc: 'Elimination of years of stubborn tea, coffee, and nicotine discoloration utilizing our 38% hydrogen peroxide medical-grade gel combined with photothermal green laser activation. Zero enamel stripping, maximum biocompatibility.',
      m1Val: '8 Shades', m1Lbl: 'VITA Bleach Shade Shift',
      m2Val: '45 Mins', m2Lbl: 'In-Chair Treatment Time',
      m3Val: '0% Pain', m3Lbl: 'Sensitivity Neutralized',
      m4Val: '3+ Years', m4Lbl: 'Clinical Longevity'
    },
    veneers: {
      beforeSrc: 'assets/before_veneers.jpg',
      afterSrc: 'assets/after_veneers.jpg',
      caseNum: 'Case #9104 • Diastema Closure',
      title: 'Handcrafted Ceramic Porcelain Veneers',
      desc: 'Full anterior smile rehabilitation closing the midline diastema (gap) with ultra-thin (0.3mm) feldspathic porcelain veneers. Individually shaded, layered, and bonded with high-bond resin for lifelike light transmission.',
      m1Val: '0.3 mm', m1Lbl: 'Minimal Prep Thickness',
      m2Val: '2 Visits', m2Lbl: 'Digital Design to Bond',
      m3Val: '100% Match', m3Lbl: 'Custom Translucency Shade',
      m4Val: '15+ Years', m4Lbl: 'Clinical Proven Durability'
    }
  };

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.getAttribute('data-treatment');
      const data = treatmentsData[key];
      if (!data) return;

      if (beforeImg) beforeImg.src = data.beforeSrc;
      if (afterImg) afterImg.src = data.afterSrc;
      if (caseNumber) {
        const span = caseNumber.querySelector('.badge-text') || caseNumber;
        span.textContent = data.caseNum;
      }
      if (title) title.textContent = data.title;
      if (desc) desc.textContent = data.desc;

      if (metric1) metric1.textContent = data.m1Val;
      if (metric2) metric2.textContent = data.m2Val;
      if (metric3) metric3.textContent = data.m3Val;
      if (metric4) metric4.textContent = data.m4Val;

      // Reset slider to 50%
      beforeLayer.style.width = '50%';
      divider.style.left = '50%';
    });
  });
}

/* --------------------------------------------------------------------------
   8. FAQ Accordion Logic
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const triggers = document.querySelectorAll('.faq-question-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const parentCard = trigger.closest('.faq-item-card');
      const isOpen = parentCard.classList.contains('open');

      // Close other accordions in the same container
      const siblingCards = parentCard.parentElement.querySelectorAll('.faq-item-card');
      siblingCards.forEach((c) => {
        c.classList.remove('open');
        const trig = c.querySelector('.faq-question-trigger');
        if (trig) trig.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        parentCard.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   9. Floating Concierge Meta Messenger Widget & Interactive Bot (Dual-Mode)
   -------------------------------------------------------------------------- */
function initMessengerConcierge() {
  const launcherBtn = document.getElementById('messengerLauncherBtn');
  const chatModal = document.getElementById('messengerChatModal');
  const closeBtn = document.getElementById('messengerCloseBtn');
  const tabBubbleChat = document.getElementById('tabBubbleChat');
  const tabDirectMessenger = document.getElementById('tabDirectMessenger');
  const bubbleChatView = document.getElementById('bubbleChatView');
  const directMessengerCard = document.getElementById('directMessengerCard');
  const chatForm = document.getElementById('messengerChatForm');
  const inputField = document.getElementById('chatInputField');
  const messagesContainer = document.getElementById('chatMessagesContainer');
  const quickOptions = document.getElementById('chatQuickOptions');

  if (!launcherBtn || !chatModal) return;

  function toggleChat() {
    chatModal.classList.toggle('active');
    if (chatModal.classList.contains('active')) {
      if (bubbleChatView && !bubbleChatView.classList.contains('hidden')) {
        inputField?.focus();
      }
    }
  }

  function closeChat() {
    chatModal.classList.remove('active');
  }

  launcherBtn.addEventListener('click', toggleChat);
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  // Tab switching between In-Bubble Chat and Direct Meta Messenger
  if (tabBubbleChat && tabDirectMessenger) {
    tabBubbleChat.addEventListener('click', () => {
      tabBubbleChat.classList.add('active');
      tabDirectMessenger.classList.remove('active');
      tabBubbleChat.setAttribute('aria-selected', 'true');
      tabDirectMessenger.setAttribute('aria-selected', 'false');
      if (bubbleChatView) bubbleChatView.classList.remove('hidden');
      if (directMessengerCard) directMessengerCard.classList.remove('active');
      inputField?.focus();
    });

    tabDirectMessenger.addEventListener('click', () => {
      tabDirectMessenger.classList.add('active');
      tabBubbleChat.classList.remove('active');
      tabDirectMessenger.setAttribute('aria-selected', 'true');
      tabBubbleChat.setAttribute('aria-selected', 'false');
      if (bubbleChatView) bubbleChatView.classList.add('hidden');
      if (directMessengerCard) directMessengerCard.classList.add('active');
    });
  }

  // Quick Action Buttons
  if (quickOptions) {
    quickOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.chat-option-btn');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      handleChatAction(action, btn.querySelector('span')?.textContent || '');
    });
  }

  function appendUserBubble(text) {
    if (!messagesContainer) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble-user';
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendBotBubble(htmlText) {
    if (!messagesContainer) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble-bot';
    bubble.innerHTML = htmlText;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function handleChatAction(action, label) {
    appendUserBubble(label);

    setTimeout(() => {
      if (action === 'book') {
        appendBotBubble("I'm opening our instant booking concierge for you now! Please pick your preferred date and clinic location.");
        setTimeout(() => {
          if (window.openAppointmentModal) window.openAppointmentModal();
          closeChat();
        }, 600);
      } else if (action === 'whitening') {
        appendBotBubble("Our in-clinic cold-light laser whitening is currently <strong>£385</strong> (inclusive of 8-shade lift guarantee, pre-treatment polish, and custom take-home trays). Would you like to reserve a time?");
      } else if (action === 'implant') {
        appendBotBubble("Dentiva specializes in 3D CBCT guided titanium implants with custom zirconia crowns from <strong>£1,450</strong> with 0% APR monthly financing. 99.4% clinical integration rate.");
      } else if (action === 'messenger-direct') {
        appendBotBubble("Switching you to direct Meta Messenger mode! You can chat directly with our front desk on Messenger.");
        setTimeout(() => {
          if (tabDirectMessenger) tabDirectMessenger.click();
        }, 500);
      }
    }, 450);
  }

  window.sendConciergeMessage = function() {
    if (!inputField || !inputField.value.trim()) return;
    const userText = inputField.value.trim();
    inputField.value = '';

    appendUserBubble(userText);

    // Concierge AI response simulation
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = "Mabuhay! Thank you for reaching out. A patient coordinator at our BGC Flagship or Makati Suite is ready to assist. Would you like to <a href='booking.html' style='color: var(--accent-blue); text-decoration: underline; font-weight: 600;'>book an appointment online</a>, chat on <a href='https://m.me/dentivaphilippines' target='_blank' style='color: var(--messenger-blue); font-weight: 600;'>Facebook Messenger (@dentivaphilippines)</a>, or message our Viber/WhatsApp concierge at <strong>0917 888 3368</strong>?";
      
      if (lower.includes('price') || lower.includes('cost') || lower.includes('fee')) {
        reply = "Our comprehensive 3D digital checkup & panoramic X-ray is ₱1,500. Single titanium implants start at ₱65,000, Laser Whitening is ₱9,500, and Ultrasonic Cleanings are ₱1,800. We accept 0% installment plans via BDO, BPI, GCash, Maya, and major Philippine dental HMOs!";
      } else if (lower.includes('implant') || lower.includes('tooth') || lower.includes('teeth')) {
        reply = "Our BGC surgical suite specializes in 3D CBCT guided titanium implants with custom monolithic zirconia crowns. Would you like to reserve a 3D assessment?";
      } else if (lower.includes('emergency') || lower.includes('pain') || lower.includes('hurt')) {
        reply = "🚨 <strong>Same-Day Dental Emergency:</strong> We prioritize severe toothache, broken teeth, and dental trauma at our BGC and Makati clinics. Please call our hotline directly at <strong>(02) 8888 3368</strong> or <strong>0917 888 3368</strong>.";
      }
      appendBotBubble(reply);
    }, 550);
  };
}
