const cartItemsElement = document.getElementById("cart-items");
const totalBillElement = document.getElementById("total-bill");
const cartBadge = document.querySelector(".cart-badge");
const cartHeading = document.querySelector("h2");


let totalBill = 0;

// Function to update the cart count displayed on the badge
function updateCartCount() {
  // Filter keys to exclude non-cart items like "cartCount" and "language"
  const cartCount = Object.keys(localStorage).filter((key) => {
    // Check that the key is not "cartCount" or "language" and the value is a valid JSON object
    if (key === "cartCount" || key === "language") return false;

    try {
      const value = JSON.parse(localStorage.getItem(key));
      // Further check that the value has cart-specific properties like "quantity"
      return value && typeof value.quantity === "number";
    } catch (e) {
      return false; // Exclude keys with invalid JSON
    }
  }).length;

  // Update the cart badge if it exists
  if (cartBadge) {
    cartBadge.textContent = cartCount; // Update cart count in badge
  }
  // Save updated count in localStorage
  localStorage.setItem("cartCount", cartCount);
}

// Function to update total bill

function updateTotalBill() {
  totalBill = 0;
  const rows = cartItemsElement.querySelectorAll("tr");

  rows.forEach((row) => {
    const itemTotal = parseFloat(
      row.querySelector(".item-total").textContent.replace("€", "")
    );
    totalBill += itemTotal;
  });

  let discount = 0;
 /* if (totalBill >= 200) {
    discount = 0.1;  // 10% discount for orders >= 200€
  } else if (totalBill >= 100) {
    discount = 0.05; // 5% discount for orders >= 100€
  }
*/
  const discountedTotal = totalBill - totalBill * discount;

  // Create HTML for total, discount, and final total with added styling
  let totalMessage = "";
  let discountMessage = "";
  let finalTotalMessage = `<strong style="font-size: 1em;">Total: €${discountedTotal.toFixed(2)}</strong>`;

  if (discount > 0) {
    totalMessage = `Total: <s>€${totalBill.toFixed(2)}</s><br>`;
    discountMessage = `<p style="color: #ff4500; font-size: 0.6em;">Réduction appliquée : ${(discount * 100).toFixed(0)}%</p>`;
}

  // Combine the messages to display the information
  totalBillElement.innerHTML = `${totalMessage}${discountMessage}${finalTotalMessage}`;
}





// Get the items order array
const itemsOrder = JSON.parse(localStorage.getItem("itemsOrder")) || [];

function checkAndDisplayEmptyCartMessage() {
  if (itemsOrder.length === 0) {
    cartHeading.textContent = "Votre panier est vide";
    cartHeading.style.textAlign = "center";

    // Hide the cart table and total bill
    document.querySelector("table").style.display = "none";
    totalBillElement.style.display = "none";
    document.getElementById("confirm-order").style.display = "none";


    // Show empty cart message
    cartItemsElement.innerHTML = `<tr><td colspan="6" class="text-center">Votre panier est vide</td></tr>
`;
  } else {
    // Show the table and total bill again if there are items
    document.querySelector("table").style.display = "table";
    totalBillElement.style.display = "block";
    document.getElementById("confirm-order").style.display = "inline-block";

  }
}
// Iterate through the itemsOrder array
itemsOrder.forEach((key) => {
  const itemData = JSON.parse(localStorage.getItem(key));
  if (itemData) {
    const row = document.createElement("tr");
    const itemTotal = itemData.quantity * itemData.price;
    const minOrder = itemData.minOrder || 1; // Default to 1 if not set
    row.innerHTML = `
           
    <td>${key}</td>
    <td>
        <div class="quantity-container">
            <div>
                <button class="decrement btn btn-sm btn-danger">-</button>
                <span class="quantity">${itemData.quantity}</span>
                <button class="increment btn btn-sm btn-success">+</button>
            </div>
            <p class="min-order-message">La quantité minimale de commande est ${minOrder}</p>
        </div>
    </td>
    <td>€${itemData.price}</td>
    <td class="item-total">€${itemTotal.toFixed(2)}</td>
  <td>
<a href="#" class="delete-item text-danger">
<i class="fas fa-trash-alt"></i>
</a>
</td>


        `;
    // Get the min order message and quantity elements
    const minOrderMessage = row.querySelector(".min-order-message");
    const quantityElement = row.querySelector(".quantity");

    // Add event listeners for the increment, decrement, and delete buttons
    const decrementButton = row.querySelector(".decrement");
    const incrementButton = row.querySelector(".increment");
    const deleteButton = row.querySelector(".delete-item");
    // (Event listeners for decrement, increment, and delete buttons remain unchanged)
    // Decrement quantity
    decrementButton.addEventListener("click", () => {
      let quantity = parseInt(quantityElement.textContent); // Parse current quantity from UI.

      if (quantity > minOrder) {
        quantity--;
        quantityElement.textContent = quantity; // Update the UI.
        itemData.quantity = quantity; // Update the item data.
        localStorage.setItem(key, JSON.stringify(itemData)); // Persist the updated quantity.

        // Update item total and total bill.
        row.querySelector(".item-total").textContent = `€${(
          itemData.quantity * itemData.price
        ).toFixed(2)}`;
        updateTotalBill();

        // Show or hide the minOrderMessage based on the quantity
        if (quantity < minOrder) {
          minOrderMessage.style.display = "block";
        } else {
          minOrderMessage.style.display = "none";
        }
      } else {
        quantityElement.textContent = minOrder;
        itemData.quantity = minOrder;
        localStorage.setItem(key, JSON.stringify(itemData));
        minOrderMessage.style.display = "block";
      }
    });

    // Increment quantity
    incrementButton.addEventListener("click", () => {
      let quantity = parseInt(quantityElement.textContent);
      quantity++;
      quantityElement.textContent = quantity;
      itemData.quantity = quantity;
      localStorage.setItem(key, JSON.stringify(itemData));
      row.querySelector(".item-total").textContent = `€${(
        itemData.quantity * itemData.price
      ).toFixed(2)}`;
      updateTotalBill();
      minOrderMessage.style.display = "none";
    });

    // Delete item from cart
    // Delete item from cart
    deleteButton.addEventListener("click", () => {
      // Remove the item from localStorage
      localStorage.removeItem(key);

      // Update the global itemsOrder array by filtering out the deleted item
      const updatedItemsOrder = itemsOrder.filter((item) => item !== key);
      localStorage.setItem("itemsOrder", JSON.stringify(updatedItemsOrder));

      // Update the global itemsOrder to reflect the change
      itemsOrder.length = 0; // Clear the array in place
      itemsOrder.push(...updatedItemsOrder); // Push the updated items back

      // Remove the row from the table
      row.remove();

      // Update total bill, cart count, and empty cart message
      updateTotalBill();
      updateCartCount();
      checkAndDisplayEmptyCartMessage();
    });

    // Append row to the table
    cartItemsElement.appendChild(row);
    totalBill += itemTotal;
  }
});

// Update the total bill and cart count on page load
checkAndDisplayEmptyCartMessage();
updateTotalBill();
updateCartCount(); // Update the cart count when the page loads

if (!localStorage.getItem("orderCounter")) {
  // If not, initialize it to 1
  localStorage.setItem("orderCounter", 1);
}

// Function to generate a unique order ID
function generateOrderId() {
  // Get the current date and time
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // Format: YYYYMMDD
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ""); // Format: HHMMSS

  // Get the last order counter from localStorage and increment it
  let orderCounter = parseInt(localStorage.getItem("orderCounter"));

  // Create the new Order ID
  const orderId = `${dateStr}-${timeStr}-${orderCounter}`;

  // Increment the counter for the next order
  localStorage.setItem("orderCounter", orderCounter + 1);

  return orderId;
}

// Fonction pour envoyer les détails de la commande sur WhatsApp
function sendOrderDetailsToWhatsApp() {
    // Générer un ID de commande unique
    const orderId = generateOrderId();
    console.log("ID de commande généré:", orderId);
  
    const itemsOrder = JSON.parse(localStorage.getItem("itemsOrder"));
    let orderSummary = `Bonjour ! Je souhaite passer une commande. Voici les détails (ID de commande : ${orderId}) :\n\n`;
  
    let totalBill = 0;
    let serialNumber = 1; // Commencer la numérotation à partir de 1
  
    itemsOrder.forEach((key) => {
      const item = JSON.parse(localStorage.getItem(key));
      const itemTotal = item.quantity * parseFloat(item.price);
      
      // Ajouter le numéro de série, le nom de l'article, la quantité, le prix et le total au message
      orderSummary += `${serialNumber}. *${key}* : Quantité : ${item.quantity}, Prix : €${item.price}, Total : €${itemTotal.toFixed(2)}\n`;
      
      totalBill += itemTotal;
      serialNumber++; // Incrémenter le numéro de série pour l'article suivant
    });
    let discount = 0;
   /* if (totalBill >= 200) {
      discount = 0.1;  // 10% discount for orders >= 200€
    } else if (totalBill >= 100) {
      discount = 0.05; // 5% discount for orders >= 100€
    }

    const discountedTotal = totalBill - totalBill * discount;
    orderSummary += `\nTotal : €${totalBill.toFixed(2)}\nPromotion Total : €${discountedTotal.toFixed(2)} \nMerci pour l'attention portée à ma commande !`;
    */
    orderSummary += `\nTotal: €${totalBill.toFixed(2)}\nThank you for your attention to my order!`;

    // Encoder le message pour WhatsApp
    const message = encodeURIComponent(orderSummary);
  
    // Numéro WhatsApp (Remplacez par le numéro réel)
    const whatsappNumber = "+33766155323";
  
    // Construire l'URL WhatsApp avec le message encodé
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
  
    // Ouvrir la fenêtre de chat WhatsApp avec le résumé de la commande
    window.open(whatsappURL, "_blank");
  }
  


// Add event listener to the button
document
  .getElementById("confirm-order")
  .addEventListener("click", sendOrderDetailsToWhatsApp);
