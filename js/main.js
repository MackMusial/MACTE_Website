// MACTE site — shared behavior

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the mobile menu after a link is clicked
    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // Escape closes the mobile menu and returns focus to the toggle
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !links.classList.contains("open")) return;
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    });
  }

  // Set current year in footer
  const yearEl = document.querySelector("[data-current-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setUpPayPalLink();
  setUpScrollReveal();
});

// The PayPal button on membership.html ships with an empty href until MACTE's
// payment link is pasted in. While it is empty, switch the button off and show
// the "coming soon" note instead of leaving a button that goes nowhere.
function setUpPayPalLink() {
  const link = document.querySelector("[data-paypal-link]");
  if (!link) return;
  if ((link.getAttribute("href") || "").trim()) return;

  link.removeAttribute("href");
  link.removeAttribute("target");
  link.setAttribute("role", "link");
  link.setAttribute("aria-disabled", "true");

  const pending = document.querySelector("[data-paypal-pending]");
  if (pending) pending.hidden = false;
}

// Content below the first screen eases up into place as it scrolls into view.
// Anything already on screen at load is left alone, so nothing visible ever
// flickers, and visitors who ask for reduced motion get the plain page.
function setUpScrollReveal() {
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const selector = ".section-header, .card-grid > *, .two-col > *, .table-wrap, .callout";
  const targets = Array.from(document.querySelectorAll(selector)).filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight
  );
  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        // Scrolled past without being seen (e.g. the browser restored a
        // position further down the page): show it without animating.
        const passed = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        if (!entry.isIntersecting && !passed) return;

        observer.unobserve(el);
        el.classList.remove("reveal");
        if (passed) return;

        // Cards in a grid follow each other in; the delay is capped so a long
        // grid never keeps anyone waiting.
        const inGrid = el.parentElement.classList.contains("card-grid");
        const index = inGrid ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "none" },
          ],
          {
            duration: 400,
            delay: Math.min(index, 4) * 50,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "backwards",
          }
        );
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}
