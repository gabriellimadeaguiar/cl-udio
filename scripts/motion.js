/* Motion — reveal on scroll + parallax editorial.
   Progressive enhancement: sem JS ou com prefers-reduced-motion,
   o conteúdo permanece 100% visível e estático. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return; // respeita a preferência do sistema

  // Marca que o JS está ativo — só aqui o CSS pode esconder p/ revelar.
  document.documentElement.classList.add("js-motion");

  /* ---------- Reveal on scroll ---------- */
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    // Sem suporte: mostra tudo imediatamente.
    revealed.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Parallax leve (translate3d, rAF-throttled) ---------- */
  var items = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]")
  );
  if (!items.length) return;

  var vh = window.innerHeight;
  var ticking = false;

  function update() {
    ticking = false;
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
      var rect = el.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      // -0.5 (acima do centro) .. +0.5 (abaixo) aprox.
      var offset = (center - vh / 2) / vh;
      var y = -offset * speed; // magnitude pequena, definida no HTML
      el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    vh = window.innerHeight;
    onScroll();
  });
  update(); // posição inicial
})();
