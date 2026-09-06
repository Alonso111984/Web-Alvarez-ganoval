/* ==========================================================
   GANOVAL — interacción
   Vanilla JS, sin dependencias. Cada bloque va aislado:
   si uno falla, los demás siguen funcionando.
   ========================================================== */
(function () {
  "use strict";

  var WA = "593991763133";

  function seguro(fn, nombre) {
    try { fn(); } catch (e) { console.warn("[ganoval] falló " + nombre, e); }
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Año en el pie ---------- */
  seguro(function () {
    var n = $("#anio");
    if (n) n.textContent = new Date().getFullYear();
  }, "anio");

  /* ---------- Carriles horizontales ---------- */
  seguro(function () {
    var carriles = [
      { carril: $("#carril-obras"), mandos: $('[data-mandos="obras"]'), pista: $('[data-pista="obras"]') },
      { carril: $("#carril-productos"), mandos: $('[data-mandos="productos"]'), pista: $('[data-pista="productos"]') }
    ];

    carriles.forEach(function (c) {
      if (!c.carril) return;

      function visibles() {
        return $$(":scope > *", c.carril).filter(function (el) { return !el.hidden; });
      }

      function salto() {
        var items = visibles();
        if (!items.length) return 320;
        var ancho = items[0].getBoundingClientRect().width;
        var hueco = parseFloat(getComputedStyle(c.carril).columnGap || "18") || 18;
        var porPantalla = Math.max(1, Math.floor(c.carril.clientWidth / (ancho + hueco)));
        return (ancho + hueco) * porPantalla;
      }

      function refrescar() {
        if (!c.mandos) return;
        var izq = c.mandos.querySelector('[data-ir="-1"]');
        var der = c.mandos.querySelector('[data-ir="1"]');
        var max = c.carril.scrollWidth - c.carril.clientWidth;
        if (izq) izq.disabled = c.carril.scrollLeft <= 4;
        if (der) der.disabled = c.carril.scrollLeft >= max - 4 || max <= 4;
      }

      // El navegador a veces deja el carril desplazado tras el snap inicial.
      c.carril.scrollLeft = 0;

      var yaMovio = false;
      function usado() {
        if (yaMovio) return;
        yaMovio = true;
        if (c.pista) c.pista.classList.add("oculta");
      }

      if (c.mandos) {
        $$("[data-ir]", c.mandos).forEach(function (b) {
          b.addEventListener("click", function () {
            usado();
            c.carril.scrollBy({ left: salto() * Number(b.dataset.ir), behavior: "smooth" });
          });
        });
      }

      // Solo se oculta con una acción real: arrastre, rueda o teclado.
      ["pointerdown", "wheel", "touchstart", "keydown"].forEach(function (ev) {
        c.carril.addEventListener(ev, usado, { passive: true });
      });

      c.carril.addEventListener("scroll", refrescar, { passive: true });
      window.addEventListener("resize", refrescar);
      c.refrescar = refrescar;
      refrescar();
    });

    window.__ganovalCarriles = carriles;
  }, "carriles");

  /* ---------- Filtros de trabajos ---------- */
  seguro(function () {
    var botones = $$("[data-filtro]");
    var carril = $("#carril-obras");
    if (!botones.length || !carril) return;

    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        botones.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        var f = b.dataset.filtro;
        $$(".obra", carril).forEach(function (o) {
          o.hidden = !(f === "todo" || o.dataset.tipo === f);
        });
        carril.scrollTo({ left: 0, behavior: "smooth" });
        setTimeout(function () {
          var c = (window.__ganovalCarriles || []).find(function (x) { return x.carril === carril; });
          if (c && c.refrescar) c.refrescar();
        }, 350);
      });
    });
  }, "filtros");

  /* ---------- Cotizador ---------- */
  var Cotizador = (function () {
    var fichas = $$(".ficha");
    var bandeja = $("#bandeja");
    var cuenta = $("#bandeja-cuenta");
    var lista = $("#bandeja-lista");
    var cta = $("#bandeja-cta");
    var limpiar = $("#bandeja-limpiar");

    function elegidos() {
      return fichas.filter(function (f) { return f.getAttribute("aria-pressed") === "true"; })
                   .map(function (f) { return f.dataset.producto; });
    }

    function pintar() {
      if (!bandeja) return;
      var sel = elegidos();
      if (!sel.length) { bandeja.classList.remove("visible"); return; }

      bandeja.classList.add("visible");
      if (cuenta) {
        cuenta.textContent = sel.length === 1
          ? "1 mueble seleccionado"
          : sel.length + " muebles seleccionados";
      }
      if (lista) lista.textContent = sel.join(" · ");
      if (cta) {
        var txt = "Hola GANOVAL, quiero cotizar:\n\n" +
                  sel.map(function (s) { return "• " + s; }).join("\n") +
                  "\n\nEstoy en Guayaquil. ¿Me ayudan con el presupuesto?";
        cta.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(txt);
      }
    }

    function marcar(nombres) {
      fichas.forEach(function (f) {
        if (nombres.indexOf(f.dataset.producto) !== -1) f.setAttribute("aria-pressed", "true");
      });
      pintar();
    }

    seguro(function () {
      fichas.forEach(function (f) {
        f.addEventListener("click", function () {
          var activo = f.getAttribute("aria-pressed") === "true";
          f.setAttribute("aria-pressed", String(!activo));
          pintar();
        });
      });
      if (limpiar) {
        limpiar.addEventListener("click", function () {
          fichas.forEach(function (f) { f.setAttribute("aria-pressed", "false"); });
          pintar();
        });
      }
      pintar();
    }, "cotizador");

    return { marcar: marcar, pintar: pintar };
  })();

  /* ---------- Quiz ---------- */
  seguro(function () {
    var cuerpo = $("#quiz-cuerpo");
    var paso = $("#quiz-paso");
    var avance = $("#quiz-avance");
    if (!cuerpo) return;

    var preguntas = [
      {
        t: "Abres la alacena de la cocina y…",
        p: ["Alacenas y anaqueles", "Muebles de cocina"],
        o: [
          "Todo en su sitio, como en revista.",
          "Se asoma un tupper, pero lo empujo y cierra.",
          "Caen tres tuppers y ninguna tapa les queda.",
          "Ya no la abro. Vivimos así."
        ]
      },
      {
        t: "Tu closet, siendo honesto, hoy es…",
        p: ["Closets y vestidores"],
        o: [
          "Un closet. Con puertas. Que cierran.",
          "Un closet y una silla que hace de closet.",
          "Dos sillas, y la ropa ya tiene jerarquía.",
          "Un yacimiento. Encontré un jean del 2019."
        ]
      },
      {
        t: "El mesón de la cocina en este momento…",
        p: ["Encimeras y mesones", "Muebles de cocina"],
        o: [
          "Impecable. Le pasé un paño hace diez minutos.",
          "Tiene una quemadita que ya nadie mira.",
          "Se está hinchando en la esquina del lavabo.",
          "Prefiero no hablar del mesón."
        ]
      },
      {
        t: "Llega visita sin avisar y tú…",
        p: ["Muebles de TV y sala"],
        o: [
          "Doy el tour completo, incluido el cuarto de plancha.",
          "Bajo un poco las luces, por si acaso.",
          "Los siento de espaldas al mueble de la tele.",
          "Los atiendo en la puerta y digo que ya salía."
        ]
      }
    ];

    var actual = 0;
    var respuestas = [];

    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }

    function pintarPregunta() {
      var q = preguntas[actual];
      var letras = ["A", "B", "C", "D"];
      var html = "<h3>" + esc(q.t) + "</h3><div class='quiz__ops'>";
      q.o.forEach(function (texto, i) {
        html += "<button class='op' type='button' data-valor='" + (i + 1) + "'>" +
                "<i>" + letras[i] + "</i> " + esc(texto) + "</button>";
      });
      html += "</div>";
      cuerpo.innerHTML = html;

      if (paso) paso.textContent = (actual + 1) + " de " + preguntas.length;
      if (avance) avance.style.width = (actual / preguntas.length * 100) + "%";

      $$(".op", cuerpo).forEach(function (b) {
        b.addEventListener("click", function () {
          respuestas[actual] = Number(b.dataset.valor);
          actual++;
          if (actual < preguntas.length) pintarPregunta();
          else pintarVeredicto();
        });
      });
    }

    function pintarVeredicto() {
      var total = respuestas.reduce(function (a, b) { return a + b; }, 0);
      var indice = Math.round((total - preguntas.length) / (preguntas.length * 3) * 100);

      var v;
      if (indice <= 25) {
        v = { t: "Tus muebles aguantan. Por ahora.",
              d: "No hay emergencia. Pero si estás leyendo esto es porque algo te viene picando desde hace rato." };
      } else if (indice <= 55) {
        v = { t: "Zona amarilla.",
              d: "Todavía funciona, pero ya empezaste a acomodar tu vida alrededor de un mueble que no da más. Eso siempre termina igual." };
      } else if (indice <= 80) {
        v = { t: "Se te están cayendo las tapas.",
              d: "Ya no es estética, es que el espacio dejó de servirte. Un mueble hecho a la medida exacta cambia esto en una sola instalación." };
      } else {
        v = { t: "Emergencia declarada.",
              d: "Estás escondiendo muebles de las visitas. No hay orden que arregle eso: el problema es el mueble, no tú." };
      }

      var sugeridos = [];
      preguntas.forEach(function (q, i) {
        if (respuestas[i] >= 3) {
          q.p.forEach(function (p) { if (sugeridos.indexOf(p) === -1) sugeridos.push(p); });
        }
      });

      var chips = sugeridos.length
        ? "<div class='veredicto__lista'>" + sugeridos.map(function (s) {
            return "<span>" + esc(s) + "</span>";
          }).join("") + "</div>"
        : "";

      var linea = sugeridos.length
        ? "Ya los dejamos marcados abajo en tu cotización."
        : "Igual puedes armar tu cotización abajo con lo que se te antoje.";

      cuerpo.innerHTML =
        "<div class='veredicto'>" +
          "<span class='veredicto__nota'>" + indice + "%</span>" +
          "<h3>" + esc(v.t) + "</h3>" +
          "<p>" + esc(v.d) + " " + esc(linea) + "</p>" +
          chips +
          "<div class='veredicto__pie'>" +
            "<a class='boton boton--fuerte' href='#cotizador'>Ver mi cotización</a>" +
            "<button class='reinicio' type='button' id='quiz-otra'>Responder otra vez</button>" +
          "</div>" +
        "</div>";

      if (paso) paso.textContent = "Resultado";
      if (avance) avance.style.width = "100%";

      if (sugeridos.length) Cotizador.marcar(sugeridos);

      var otra = $("#quiz-otra");
      if (otra) otra.addEventListener("click", function () {
        actual = 0; respuestas = []; pintarPregunta();
      });
    }

    // Engancha los botones que ya vienen escritos en el HTML
    $$(".op", cuerpo).forEach(function (b, i) {
      b.addEventListener("click", function () {
        respuestas[0] = i + 1;
        actual = 1;
        pintarPregunta();
      });
    });
    if (avance) avance.style.width = "0%";
  }, "quiz");

  /* ---------- Preguntas frecuentes (una abierta a la vez) ---------- */
  seguro(function () {
    var botones = $$(".pregunta__btn");
    if (!botones.length) return;

    function cerrar(btn) {
      var caja = btn.parentElement.nextElementSibling;
      if (!caja) return;
      caja.style.height = caja.scrollHeight + "px";
      requestAnimationFrame(function () { caja.style.height = "0px"; });
      btn.setAttribute("aria-expanded", "false");
    }

    function abrir(btn) {
      var caja = btn.parentElement.nextElementSibling;
      if (!caja) return;
      btn.setAttribute("aria-expanded", "true");
      caja.style.height = caja.scrollHeight + "px";
      caja.addEventListener("transitionend", function fin(e) {
        if (e.propertyName !== "height") return;
        if (btn.getAttribute("aria-expanded") === "true") caja.style.height = "auto";
        caja.removeEventListener("transitionend", fin);
      });
    }

    botones.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var abierta = btn.getAttribute("aria-expanded") === "true";
        botones.forEach(function (o) {
          if (o.getAttribute("aria-expanded") === "true") cerrar(o);
        });
        if (!abierta) abrir(btn);
      });
    });
  }, "faq");

  /* ---------- Aparición al entrar en pantalla ---------- */
  seguro(function () {
    var piezas = $$(".surge");
    if (!piezas.length) return;

    function todas() { piezas.forEach(function (p) { p.classList.add("dentro"); }); }

    if (!("IntersectionObserver" in window)) { todas(); return; }

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("dentro"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -40px 0px" });

    piezas.forEach(function (p) { obs.observe(p); });
    setTimeout(todas, 6000); // red de seguridad
  }, "surge");

})();
