/* Suite Shield Plumbing Systems — site interactions */
(function () {
  "use strict";

  /* ---- mobile nav ---- */
  var burger = document.querySelector(".burger");
  var navLinks = document.querySelector(".nav-links");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item");
      var ans = item.querySelector(".faq-a");
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  /* ---- gallery lightbox ---- */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      el.addEventListener("click", function () {
        var src = el.getAttribute("data-lightbox");
        var img = el.querySelector("img");
        lbImg.src = src || (img ? img.src : "");
        lb.classList.add("show");
        document.body.style.overflow = "hidden";
      });
    });
    function closeLb() {
      lb.classList.remove("show");
      document.body.style.overflow = "";
    }
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("lb-close")) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLb();
    });
  }

  /* ---- quote / contact form ----
     Submits to Formspree via AJAX so the page never reloads.
     If the Formspree endpoint isn't configured yet (still
     contains YOUR_FORMSPREE_ID), gracefully falls back to a
     mailto: link so the form keeps working in the meantime. */
  document.querySelectorAll("form[data-quote-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var card = form.closest(".form-card");
      var ok = card ? card.querySelector(".form-ok") : null;
      var err = card ? card.querySelector(".form-err") : null;
      var submitBtn = form.querySelector("button[type=submit]");
      var hideMsgs = function () {
        if (ok) ok.classList.remove("show");
        if (err) err.classList.remove("show");
      };
      var showOk = function () {
        hideMsgs();
        if (ok) { ok.classList.add("show"); ok.scrollIntoView({ behavior: "smooth", block: "center" }); }
        form.reset();
      };
      var showErr = function () {
        hideMsgs();
        if (err) { err.classList.add("show"); err.scrollIntoView({ behavior: "smooth", block: "center" }); }
      };

      /* mailto fallback — used when Formspree isn't configured yet */
      var sendMailtoFallback = function () {
        var get = function (n) {
          var f = form.elements[n];
          return f ? (f.value || "").trim() : "";
        };
        var body =
          "New quote request from the website\n" +
          "----------------------------------------\n" +
          "Name: " + get("name") + "\n" +
          "Phone: " + get("phone") + "\n" +
          "Email: " + get("email") + "\n" +
          "Service needed: " + get("service") + "\n" +
          "Address / town: " + get("address") + "\n\n" +
          "Details:\n" + get("message") + "\n";
        var subject = "Quote request — " + (get("name") || "Website") +
          (get("service") ? " (" + get("service") + ")" : "");
        window.location.href = "mailto:Info@suiteshieldplumbing.ca" +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        showOk();
      };

      var action = form.getAttribute("action") || "";
      var configured = action && action.indexOf("YOUR_FORMSPREE_ID") === -1 &&
                       action.indexOf("formspree.io/f/") !== -1;

      if (!configured) { sendMailtoFallback(); return; }

      /* live Formspree submission */
      if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.label = submitBtn.textContent; submitBtn.textContent = "Sending…"; }

      var data = new FormData(form);
      fetch(action, {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (res.ok) { showOk(); }
        else { showErr(); }
      }).catch(function () {
        showErr();
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || "Send My Request"; }
      });
    });
  });

  /* ---- footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
