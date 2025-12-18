import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Supabase client
const supabaseUrl = "https://cxkbvhqtyluxcmmmmxxm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a2J2aHF0eWx1eGNtbW1teHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzgzMDMsImV4cCI6MjA4MDI1NDMwM30.vzukNpEBoFxswLI5_lEYED1Ta64I_Dauoz4waLJg6kU"; // replace with your key
const supabase = createClient(supabaseUrl, supabaseKey);


const cartItemsDiv = document.getElementById("cartItems");
const cartTotalDiv = document.getElementById("cartTotal");
const purchaseBtn = document.getElementById("purchaseBtn");
const paymentModal = document.getElementById("paymentModal");
const paymentRef = document.getElementById("paymentRef");
const confirmPayment = document.getElementById("confirmPayment");
const cancelPayment = document.getElementById("cancelPayment");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Generate unique reference
function generateReference() {
  return "RHORHA-" + Date.now();
}

// Render cart items
function renderCart() {
  cartItemsDiv.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
    cartTotalDiv.textContent = "";
    return;
  }

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>Size: ${item.size}</p>
        <p>Price: R${item.price.toFixed(2)}</p>
        <p>
          Quantity:
          <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
          ${item.qty}
          <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
        </p>
        <p><strong>Subtotal:</strong> R${subtotal.toFixed(2)}</p>
      </div>
      <div class="cart-actions">
        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartTotalDiv.textContent = `Total: R${total.toFixed(2)}`;
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Change quantity
window.changeQty = function(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}

// Remove item
window.removeItem = function(index) {
  cart.splice(index, 1);
  renderCart();
}

// Open payment modal
purchaseBtn.onclick = function() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  const reference = generateReference();
  paymentRef.textContent = reference;
  paymentModal.style.display = "flex";
}

// Cancel payment
cancelPayment.onclick = function() {
  paymentModal.style.display = "none";
}

// Confirm payment and save purchases
confirmPayment.onclick = async function() {
  const reference = paymentRef.textContent;

  for (const item of cart) {
    const { error } = await supabase.from("purchases").insert([{
      tshirt_name: item.name,
      size: item.size,
      quantity: item.qty,
      price: item.price,
      total: item.qty * item.price,
      reference
    }]);
    if (error) console.error("Error saving purchase:", error.message);
  }

  alert("Purchase recorded! Please use the reference to make payment.");
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  paymentModal.style.display = "none";
}

// Initialize
renderCart();
