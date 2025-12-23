document.addEventListener("DOMContentLoaded", () => {
  const menus = document.querySelectorAll(".footer-block--menu");

  menus.forEach((menu) => {
    const title = menu.querySelector("h2");

    title.addEventListener("click", () => {
      menus.forEach((m) => {
        if (m !== menu) m.classList.remove("open");
      });

      menu.classList.toggle("open");
    });
  });

  // RaindoorBox

  document.addEventListener('click', function(e) {
      const addButton = e.target.closest('button[name="add"], input[type="submit"][name="add"], .add-to-cart-button', '.plp-add-btn');
      
      if (addButton) {
        setTimeout(() => {
          if (typeof window.giftSettings !== 'undefined' && window.giftSettings.active) {
            fetch('/cart.js')
              .then(response => response.json())
              .then(cartData => {
                const hasGift = cartData.items.some(item => item.variant_id === window.giftSettings.variantId);
                
                if (cartData.original_total_price >= window.giftSettings.subtotalMin && !hasGift) {
                  fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: [{ id: window.giftSettings.variantId, quantity: 1 }] })
                  }).then(() => {
                    // Trigger cart update event
                    if (typeof publish !== 'undefined' && typeof PUB_SUB_EVENTS !== 'undefined') {
                      publish(PUB_SUB_EVENTS.cartUpdate, { source: 'global-gift' });
                    }
                    // Update cart counter
                    fetch('/cart.js')
                      .then(response => response.json())
                      .then(updatedCart => {
                        document.querySelectorAll('[data-cart-count], .cart-count, .header-cart-count').forEach(el => {
                          el.textContent = updatedCart.item_count;
                        });
                      });
                  });
                }
              });
          }
        }, 2000);
      }
    });

});



// MENÚ DRAWER - ACORDEÓN CUSTOM
document.addEventListener("DOMContentLoaded", function () {
  const detailsElements = document.querySelectorAll(".menu-drawer details");

  detailsElements.forEach((details) => {
    details.addEventListener("toggle", function () {
      const isOpen = this.open;

      if (isOpen) {
        setTimeout(() => {
          // Opcional: Validar si es necesario scrollear en niveles profundos para que no salte
          if (!details.parentElement.closest("details[open]")) {
            details.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 50);

        // CERRAR TODOS LOS DEMÁS
        detailsElements.forEach((other) => {
          // FIX: Agregamos !other.contains(details)
          // Esto significa: "Si el 'otro' elemento CONTIENE al que acabo de abrir, NO lo cierres".
          if (other !== details && other.open && !other.contains(details)) {
            other.open = false;
            other.classList.remove("is-open");
          }
        });

        // ABRIR ESTE
        details.classList.add("is-open");
      } else {
        // CERRAR ESTE
        details.classList.remove("is-open");
      }

      // Forzar reflow para animación (hack clásico)
      void details.offsetHeight;
    });
  });

  // Cerrar al tocar fuera
  document.addEventListener("click", function (e) {
    const drawer = document.querySelector(".menu-drawer");
    // Asegurarse de no cerrar si el click fue dentro del drawer (aunque sea en un link vacío)
    if (
      drawer &&
      drawer.classList.contains("menu-drawer--open") &&
      !drawer.contains(e.target) &&
      !e.target.closest("summary") // Evita conflicto con el botón de abrir
    ) {
      detailsElements.forEach((d) => {
        if (d.open) {
          d.open = false;
          d.classList.remove("is-open");
        }
      });
    }
  });
});

// FIN MENÚ DRAWER - ACORDEÓN CUSTOM



/* MODAL PLP - SELECCIÓN AUTOMÁTICA DE TALLA */
let ultimaTallaClickeada = null;

document.addEventListener("click", function (e) {
  const btn = e.target.closest("button[data-variant-id]");
  if (btn) {
    const titulo = btn.innerText.trim().split("\n")[0];
    ultimaTallaClickeada = titulo;
  }
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes" && mutation.attributeName === "open") {
      const modal = mutation.target;
      if (modal.matches("quick-add-modal") && modal.hasAttribute("open")) {
        setTimeout(() => {
          if (!ultimaTallaClickeada) {
            console.log("No hay talla guardada aún");
            return;
          }

          const variantSelects = modal.querySelector("variant-selects");
          if (!variantSelects) return console.log("No hay variant-selects");

          const input = variantSelects.querySelector(
            `input[type="radio"][value="${ultimaTallaClickeada}"]`
          );
          if (!input) {
            console.log("Talla no encontrada en modal:", ultimaTallaClickeada);
            return;
          }

          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));

          console.log("Talla seleccionada en modal:", ultimaTallaClickeada);
        }, 100);
      }
    }
  });
});

document.querySelectorAll("quick-add-modal").forEach((modal) => {
  observer.observe(modal, { attributes: true });
});

new MutationObserver((muts) => {
  muts.forEach((mut) => {
    mut.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.matches?.("quick-add-modal")) {
          observer.observe(node, { attributes: true });
        }
        node.querySelectorAll?.("quick-add-modal")?.forEach((m) => {
          observer.observe(m, { attributes: true });
        });
      }
    });
  });
}).observe(document.body, { childList: true, subtree: true });
/* MODAL PLP - SELECCIÓN AUTOMÁTICA DE TALLA - FIN */

/* MOBILE SWATCHES */
if ('ontouchstart' in window) {
  document.addEventListener('touchend', (e) => {
    if (e.target.closest('.plp-add-btn') || e.target.closest('.plp-swatch') || e.target.closest('.quick-add__submit')) return;

    const card = e.target.closest('.card-wrapper');
    if (card) {
      const swatches = card.querySelector('.plp-swatches-wrapper');
      if (swatches) {
        document.querySelectorAll('.plp-swatches-wrapper.active').forEach(s => s.classList.remove('active'));
        swatches.classList.add('active');
      }
      return;
    }

    const editorialBlock = e.target.closest('.editorial-block');
    if (editorialBlock && editorialBlock.querySelector('.variant-selectors-wrapper')) {
      if (e.target.closest('.variant-selectors-wrapper')) return;
      document.querySelectorAll('.editorial-block.active').forEach(b => b.classList.remove('active'));
      editorialBlock.classList.add('active');
    }
  }, { passive: true });
}
/* FIN MOBILE SWATCHES */
