document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".subcategory-tab");
  const productContainer = document.getElementById("subcategory-products");

  if (!tabs.length || !window.subcategories) return;

  let allProducts = [];

  // Load all subcategory products initially
  async function fetchAllProducts() {
    for (const subcat of window.subcategories) {
      const res = await fetch(`/api/storefront/categories/${subcat.id}/products`);
      const data = await res.json();
      allProducts = allProducts.concat(data);
    }
    renderProducts(allProducts);
  }

  // Render product cards
  function renderProducts(products) {
    productContainer.innerHTML = products.map(p => `
      <div class="product">
        <a href="${p.path}">
          <img src="${p.images?.[0]?.url}" alt="${p.name}" />
          <h3>${p.name}</h3>
        </a>
        <p>${p.price?.formatted || ''}</p>
      </div>
    `).join('');
  }

  // Filter products by subcategory ID
  function filterProducts(catId) {
    if (catId === 'all') return renderProducts(allProducts);
    const filtered = allProducts.filter(p => p.categoryIds.includes(Number(catId)));
    renderProducts(filtered);
  }

  // Event listeners
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelector(".subcategory-tab.active")?.classList.remove("active");
      tab.classList.add("active");
      filterProducts(tab.dataset.id);
    });
  });

  fetchAllProducts();
});
