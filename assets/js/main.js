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
  const contactTypeParam = new URLSearchParams(location.search).get("type");
  if (contactTypeParam === "management") {
    const managementRadio = document.getElementById("type-management");
    if (managementRadio) managementRadio.checked = true;
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
