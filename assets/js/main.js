(() => {
  "use strict";

  /* Header: scrolled state */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (navToggle && mobileNav) {
    const closeNav = () => {
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-label", "メニューを開く");
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("is-open");
      header && header.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    navToggle.addEventListener("click", () => {
      const willOpen = !mobileNav.classList.contains("is-open");
      navToggle.classList.toggle("is-active", willOpen);
      navToggle.setAttribute("aria-label", willOpen ? "メニューを閉じる" : "メニューを開く");
      navToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
      mobileNav.classList.toggle("is-open", willOpen);
      header && header.classList.toggle("is-open", willOpen);
      document.body.style.overflow = willOpen ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
  }

  /* Contact form: preselect inquiry type from ?type= query param */
  const contactTypeMap = {
    management: "type-management",
    sale: "type-sale",
    recruit: "type-recruit",
    tenant: "type-tenant",
  };
  const contactTypeParam = new URLSearchParams(location.search).get("type");
  if (contactTypeParam && contactTypeMap[contactTypeParam]) {
    const radio = document.getElementById(contactTypeMap[contactTypeParam]);
    if (radio) radio.checked = true;
  }

  /* Contact form: note which listing an inquiry came from via ?property=,
     using only the public display name (never the internal building name
     or exact address) so the message body still exposes nothing more than
     what's already shown on the listing card. */
  const contactPropertyMap = {
    "fukuoka-iikura": "【お問い合わせ物件】福岡市早良区飯倉5丁目 一棟収益マンション",
    "kurume-nishimachi": "【お問い合わせ物件】久留米市西町 一棟収益アパート",
    "kasuga-yayoi": "春日市弥生5丁目の一棟収益アパートについて",
    "fukuoka-wajirohigashi": "福岡市東区和白東5丁目の一棟収益アパートについて",
    "fukuoka-odo": "福岡市西区小戸4丁目の一棟収益アパートについて",
    "munakata-ishimaru": "宗像市石丸2丁目の一棟収益アパートについて",
  };
  const contactPropertyParam = new URLSearchParams(location.search).get("property");
  if (contactPropertyParam && contactPropertyMap[contactPropertyParam]) {
    const messageEl = document.getElementById("contact-message");
    if (messageEl && !messageEl.value) {
      messageEl.value = contactPropertyMap[contactPropertyParam] + "\n\n";
    }
  }

  /* Contact form: single deliberate jump to the real form, once the page
     layout has actually settled — the hash was already stripped inline in
     <head> so the browser's own anchor jump never fires and fights with
     this one. Web font swaps can keep reflowing the page slightly even
     after "load" and after document.fonts.ready resolves, so instead of
     scrolling on a fixed signal, poll layout height until it stops
     changing across a few animation frames, then scroll exactly once. */
  if (window.__scrollToContactForm) {
    // #contact-form carries the sitewide .reveal fade-in (translateY until
    // it intersects the viewport). That transform shifts the element's own
    // rendered position after scrollIntoView has already measured/landed on
    // it, undoing the careful offset above. Skip the entrance animation only
    // for this direct-link flow so the landing position is final immediately.
    const contactFormEl = document.getElementById("contact-form");
    if (contactFormEl) contactFormEl.classList.add("is-visible");
    const scrollToContactForm = () => {
      const target = document.getElementById("contact-form");
      if (!target) return;
      // html has scroll-behavior: smooth sitewide, and scrollIntoView's
      // behavior: "auto" means "honor the element's CSS scroll-behavior" —
      // not "instant". Force instant here so the landing position is exact.
      const root = document.documentElement;
      const prevBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView({ behavior: "auto", block: "start" });
      root.style.scrollBehavior = prevBehavior;
    };
    const waitForStableLayout = (callback) => {
      const maxFrames = 90; // ~1.5s at 60fps safety cap
      let lastHeight = -1;
      let stableFrames = 0;
      let frame = 0;
      const check = () => {
        const height = document.documentElement.scrollHeight;
        if (height === lastHeight) {
          stableFrames++;
        } else {
          stableFrames = 0;
          lastHeight = height;
        }
        frame++;
        if (stableFrames >= 5 || frame >= maxFrames) {
          callback();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    };
    const runScroll = () => {
      const afterFonts =
        document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      afterFonts.then(() => waitForStableLayout(scrollToContactForm));
    };
    if (document.readyState === "complete") {
      runScroll();
    } else {
      window.addEventListener("load", runScroll, { once: true });
    }
  }

  /* Scroll reveal */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Count-up numbers */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const noGroup = el.hasAttribute("data-no-group");
    const format = (n) => {
      if (decimals) return n.toFixed(decimals);
      const rounded = Math.floor(n);
      return noGroup ? String(rounded) : rounded.toLocaleString();
    };
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : noGroup ? String(target) : target.toLocaleString();
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    counters.forEach((el) => { el.textContent = "0"; });
    const ioCount = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            ioCount.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => ioCount.observe(el));
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach((open) => {
        if (open !== item) {
          open.classList.remove("is-open");
          open.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      item.classList.toggle("is-open", !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });

  /* Property listing filter (bukken page) */
  const toolbar = document.querySelector(".bukken-toolbar");
  if (toolbar) {
    const buttons = toolbar.querySelectorAll("button");
    const cards = document.querySelectorAll(".bukken-grid [data-area]");
    const countEl = document.querySelector(".bukken-count strong");
    const emptyEl = document.querySelector(".bukken-empty");
    const applyFilter = (area) => {
      let visible = 0;
      cards.forEach((card) => {
        const match = area === "all" || card.dataset.area === area;
        card.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (countEl) countEl.textContent = visible;
      if (emptyEl) emptyEl.classList.toggle("is-visible", visible === 0);
    };
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        applyFilter(btn.dataset.area);
      });
    });
  }

  /* Back to top */
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    document.addEventListener(
      "scroll",
      () => toTop.classList.toggle("is-visible", window.scrollY > 700),
      { passive: true }
    );
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
})();
