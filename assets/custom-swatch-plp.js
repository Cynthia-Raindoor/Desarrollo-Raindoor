// Definir funciones globalmente de inmediato

document.addEventListener('DOMContentLoaded', function () {
    // Busca TODOS los wrappers de swatches (uno por card)
    const allWrappers = document.querySelectorAll('.plp-swatches-wrapper');
    
    allWrappers.forEach(function(wrapper) {
      // En cada wrapper, busca los botones habilitados
      const buttons = wrapper.querySelectorAll('.plp-swatch:not(.disabled):not([disabled])');
      
      if (buttons.length > 0) {
        // Le pone 'active' al primero con stock en ESA card
        const firstButton = buttons[0];
        firstButton.classList.add('active');
        
        // Opcional: dispara la función para actualizar precio/variante en esa card
        // (asumiendo que updateSelectedVariant maneja el contexto de 'this')
        updateSelectedVariant(firstButton);
      }
    });
  });
window.updateSelectedVariant = function(button) {
  const cardWrapper = button.closest('.card-wrapper') || button.closest('.grid__item');
  if (!cardWrapper) return;
  
  const form = cardWrapper.querySelector('.plp-add-form');
  if (!form) return;
  
  const hiddenInput = form.querySelector('.selected-variant-id');
  const submitButton = form.querySelector('.plp-add-btn');
  const swatches = button.closest('.plp-swatches').querySelectorAll('.plp-swatch');
  
  swatches.forEach(s => s.classList.remove('active'));
  button.classList.add('active');
  
  hiddenInput.value = button.dataset.variantId;
  submitButton.disabled = false;
};

window.handleAddToCart = function(event, button) {
  event.preventDefault();
  
  const form = button.closest('.plp-add-form');
  let variantId = form.querySelector('.selected-variant-id').value;
  
  if (!variantId) {
    const cardWrapper = button.closest('.card-wrapper') || button.closest('.grid__item');
    const firstAvailableSwatch = cardWrapper.querySelector('.plp-swatch:not(.disabled)');
    if (firstAvailableSwatch) {
      variantId = firstAvailableSwatch.dataset.variantId;
      form.querySelector('.selected-variant-id').value = variantId;
    } else {
      return;
    }
  }
  
  button.disabled = true;
  button.textContent = 'Agregando...';
  
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: 1 })
  })
  .then(res => res.json())
  .then(() => {
    button.textContent = '¡Agregado!';
    
    fetch(`${window.Shopify.routes.root}?section_id=cart-drawer`)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newDrawer = doc.querySelector('cart-drawer');
        if (newDrawer) {
          const currentDrawer = document.querySelector('cart-drawer');
          if (currentDrawer) currentDrawer.outerHTML = newDrawer.outerHTML;
        }
        
        fetch(`${window.Shopify.routes.root}?section_id=cart-icon-bubble`)
          .then(res => res.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newBubble = doc.querySelector('.shopify-section');
            if (newBubble) {
              const currentBubble = document.querySelector('#cart-icon-bubble');
              if (currentBubble) currentBubble.innerHTML = newBubble.innerHTML;
            }
          });
        
        setTimeout(() => {
          const drawer = document.querySelector('cart-drawer');
          if (drawer && typeof drawer.open === 'function') drawer.open();
        }, 100);
      });
    
    setTimeout(() => {
      button.textContent = 'Agregar al carro';
      button.disabled = false;
    }, 1500);
  })
  .catch(() => {
    button.textContent = 'Error';
    setTimeout(() => {
      button.textContent = 'Agregar al carro';
      button.disabled = false;
    }, 1500);
  });
};
