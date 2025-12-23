document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.editorial-variant-form');
  forms.forEach((form) => {
    const variantsJson = form.querySelector('[data-variants]');
    const optionsJson = form.querySelector('[data-options]');
    if (!variantsJson || !optionsJson) return;

    const variants = JSON.parse(variantsJson.textContent);
    const options = JSON.parse(optionsJson.textContent);
    const addButton = form.querySelector('.btn-add-to-cart');
    const variantInput = form.querySelector('input[name="id"]');
    const swatchesContainer = form.querySelector('.variant-selectors');

 const updateAddButton = () => {
  const selectedOptions = getSelectedOptions(form);
  const selectedVariant = findVariant(variants, options, selectedOptions);

  // 1. Verificar si HAY ALGÚN variant disponible en todo el producto
  const anyVariantAvailable = variants.some(v => v.available);

  if (!anyVariantAvailable) {
    // Ningún variant en stock → "No disponible"
    addButton.disabled = true;
    addButton.textContent = 'No disponible';
    addButton.classList.add('unavailable');
    return;
  }

  // 2. Si hay stock, pero no se ha seleccionado todo
  if (!selectedVariant) {
    addButton.disabled = true;
    addButton.textContent = 'Selecciona opciones';
    addButton.classList.remove('unavailable');
    return;
  }

  // 3. Si hay selección completa y está disponible
  if (selectedVariant.available) {
    variantInput.value = selectedVariant.id;
    addButton.disabled = false;
    addButton.textContent = 'Agregar al carro';
    addButton.classList.remove('unavailable');
  } else {
    // Seleccionado pero sin stock
    addButton.disabled = true;
    addButton.textContent = 'No disponible';
    addButton.classList.add('unavailable');
  }
};

    const getSelectedOptions = (form) => {
      const selected = {};
      form.querySelectorAll('.swatch.active').forEach((swatch) => {
        selected[swatch.dataset.option] = swatch.dataset.value;
      });
      return selected;
    };

    const findVariant = (variants, options, selected) => {
      return variants.find((variant) => {
        return options.every((opt, index) => {
          const selValue = selected[opt];
          return !selValue || variant.options[index] === selValue;
        });
      });
    };

    swatchesContainer.addEventListener('click', (e) => {
      if (!e.target.matches('.swatch') || e.target.classList.contains('disabled')) return;
      const optionName = e.target.dataset.option;
      form.querySelectorAll(`.swatch[data-option="${optionName}"]`).forEach((s) => s.classList.remove('active'));
      e.target.classList.add('active');
      updateAddButton();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (addButton.disabled) return;

      const variantId = variantInput.value;
      const oldText = addButton.textContent;
      addButton.disabled = true;
      addButton.textContent = 'Agregando...';

      fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: parseInt(variantId), quantity: 1 }] }),
      })
        .then((res) => res.json())
        .then(() => fetch(`${window.Shopify.routes.root}?section_id=cart-drawer`).then((res) => res.text()))
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const newDrawer = doc.querySelector('cart-drawer');
          if (newDrawer) {
            const currentDrawer = document.querySelector('cart-drawer');
            if (currentDrawer) currentDrawer.outerHTML = newDrawer.outerHTML;
          }
          
          // Update bubble
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
          
          // Open drawer with animation
          setTimeout(() => {
            const drawer = document.querySelector('cart-drawer');
            if (drawer && typeof drawer.open === 'function') drawer.open();
          }, 100);

          addButton.textContent = '¡Agregado!';
          setTimeout(() => {
            addButton.textContent = oldText;
            addButton.disabled = false;
          }, 1500);
          document.dispatchEvent(new CustomEvent('cart:updated'));
        })
        .catch((err) => {
          console.error('Error:', err);
          addButton.textContent = 'Error';
          setTimeout(() => {
            addButton.textContent = oldText;
            addButton.disabled = false;
          }, 1500);
        });
    });

    updateAddButton();
  });
});