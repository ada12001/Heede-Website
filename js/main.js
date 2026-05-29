(function () {
  "use strict";

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add("is-open"); });
        document.body.style.overflow = "hidden";
      } else {
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
        setTimeout(function () { if (toggle.getAttribute("aria-expanded") === "false") menu.hidden = true; }, 320);
      }
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false);
    });
  }

  /* ---------- fleet browser tabs ---------- */
  var fleet = document.querySelector("[data-fleet]");
  if (fleet) {
    var tabs = Array.prototype.slice.call(fleet.querySelectorAll(".fleet-tab"));
    var panels = Array.prototype.slice.call(fleet.querySelectorAll(".fleet-panel"));
    var activate = function (series) {
      tabs.forEach(function (t) {
        var on = t.dataset.series === series;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      panels.forEach(function (p) {
        var on = p.dataset.panel === series;
        p.hidden = !on;
        p.classList.toggle("is-active", on);
      });
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(tab.dataset.series); });
      tab.addEventListener("keydown", function (e) {
        var idx = null;
        if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
        if (idx !== null) {
          e.preventDefault();
          tabs[idx].focus();
          activate(tabs[idx].dataset.series);
        }
      });
    });
  }

  /* ---------- data sheet chips (placeholder links) ---------- */
  document.querySelectorAll("[data-datasheet]").forEach(function (chip) {
    chip.addEventListener("click", function (e) {
      e.preventDefault();
      var model = chip.getAttribute("data-datasheet");
      var status = document.querySelector("[data-fleet]");
      // graceful: open original site search; real PDFs would be wired here
      window.open("https://heedesoutheast.com/cranes/", "_blank", "noopener");
      void model;
    });
  });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- hero parallax ---------- */
  var parallax = document.querySelector("[data-parallax]");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (parallax && !prefersReduced) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          parallax.style.transform = "translateY(" + (y * 0.18).toFixed(1) + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- team bio toggles (team page) ---------- */
  document.querySelectorAll("[data-bio-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest("[data-member]");
      if (!card) return;
      var open = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector(".bio-toggle-label").textContent = open ? "Hide bio" : "Read bio";
    });
  });

  /* ---------- contact form (client-side only) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var statusEl = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.className = "form-status";
      var required = form.querySelectorAll("[required]");
      var ok = true;
      required.forEach(function (input) {
        var valid = input.value.trim() !== "" && (input.type !== "email" || /.+@.+\..+/.test(input.value));
        input.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        statusEl.textContent = "Please complete the required fields with a valid email.";
        statusEl.classList.add("is-error");
        return;
      }
      var name = form.querySelector("#cf-name").value.trim().split(" ")[0];
      statusEl.textContent = "Thanks" + (name ? ", " + name : "") + " — your inquiry is queued. Our team will follow up shortly.";
      statusEl.classList.add("is-ok");
      form.reset();
    });
  }

  /* ---------- active nav highlight (homepage section spy) ---------- */
  var navLinks = document.querySelectorAll(".primary-nav a");
  var spyTargets = [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var hash = href.indexOf("#") > -1 ? href.slice(href.indexOf("#")) : null;
    if (hash && document.querySelector(hash)) {
      spyTargets.push({ link: link, el: document.querySelector(hash) });
    }
  });
  if (spyTargets.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("is-active"); });
          var match = spyTargets.find(function (t) { return t.el === entry.target; });
          if (match) match.link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spyTargets.forEach(function (t) { spy.observe(t.el); });
  }
})();
