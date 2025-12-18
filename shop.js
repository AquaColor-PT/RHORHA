import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ⚠️ IMPORTANT:
// You should use the ANON public key here, NOT service_role
const supabaseUrl = "https://cxkbvhqtyluxcmmmmxxm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a2J2aHF0eWx1eGNtbW1teHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzgzMDMsImV4cCI6MjA4MDI1NDMwM30.vzukNpEBoFxswLI5_lEYED1Ta64I_Dauoz4waLJg6kU";
const supabase = createClient(supabaseUrl, supabaseKey);


const productGrid = document.getElementById("productGrid");
const cartCountEl = document.getElementById("cartCount");
const sizeModal = document.getElementById("sizeModal");
const sizeInputs = document.getElementById("sizeInputs");
const modalTitle = document.getElementById("modalTitle");
const cancelBtn = sizeModal.querySelector(".cancel-btn");
const confirmBtn = sizeModal.querySelector(".confirm-btn");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentProduct = null;

// Update cart count badge
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = count;
}

// Load products from Supabase
async function loadProducts() {
  const { data: tshirts, error } = await supabase
    .from("tshirts")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    productGrid.innerHTML = "<p style='color:red'>Failed to load products.</p>";
    console.error(error);
    return;
  }

  productGrid.innerHTML = "";
  tshirts.forEach(t => {
    const card = document.createElement("div");
    card.className = "product-card";

    const sizesAvailable = Object.entries(t.quantity || {}).map(
      ([size, qty]) => `${size}: ${qty}`
    ).join(", ");

    card.innerHTML = `
      <img src="${t.image_url}" alt="${t.name}">
      <h3>${t.name}</h3>
      <p class="price">Price: R${Number(t.price).toFixed(2)}</p>
      <p>Available: ${sizesAvailable}</p>
      <button class="cart-btn">Add to Cart</button>
    `;

    const addBtn = card.querySelector(".cart-btn");
    addBtn.addEventListener("click", () => openSizeModal(t));
    productGrid.appendChild(card);
  });
}

// Open size modal
function openSizeModal(product) {
  currentProduct = product;
  sizeInputs.innerHTML = "";
  modalTitle.textContent = `Select Quantities for ${product.name}`;

  Object.entries(product.quantity || {}).forEach(([size, qty]) => {
    const div = document.createElement("div");
    div.className = "size-input";
    div.innerHTML = `
      <label>${size} (Available: ${qty}): </label>
      <input type="number" min="0" max="${qty}" value="0" data-size="${size}">
    `;
    sizeInputs.appendChild(div);
  });

  sizeModal.style.display = "flex";
}

// Cancel modal
cancelBtn.addEventListener("click", () => {
  sizeModal.style.display = "none";
  currentProduct = null;
});

// Confirm add to cart
confirmBtn.addEventListener("click", () => {
  const inputs = sizeInputs.querySelectorAll("input");
  inputs.forEach(input => {
    const size = input.dataset.size;
    const qty = parseInt(input.value);
    if (qty > 0) {
      const existing = cart.find(item => item.id === currentProduct.id && item.size === size);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({
          id: currentProduct.id,
          name: currentProduct.name,
          price: currentProduct.price,
          image: currentProduct.image_url,
          size,
          qty
        });
      }
    }
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  sizeModal.style.display = "none";
  currentProduct = null;
});

// Initialize
updateCartCount();
loadProducts();
