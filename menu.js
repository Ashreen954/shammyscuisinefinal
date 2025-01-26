
// add to cart
document.addEventListener("DOMContentLoaded", function () {
    const menuCards = document.querySelectorAll(".menu-card");
    const cartBadge = document.querySelector(".cart-badge"); // Select the cart badge element
    let cartCount = parseInt(localStorage.getItem("cartCount")) || 0; // Load the saved cart count from localStorage

    // Set the initial cart count (this will be the number of items in the cart)
    cartBadge.textContent = cartCount;
    menuCards.forEach(card => {
        const addToCartButton = card.querySelector('.add-to-cart-btn');
        if (!addToCartButton) {
            console.warn("Add to Cart button not found in card:", card);
            return; // Skip this card if button is missing
        }
    
        const minOrder = parseInt(addToCartButton.dataset.minOrder || "1", 10); // Default to 1 if missing
        const quantityElement = card.querySelector('.quantity');
        const incrementButton = card.querySelector('.increment');
        const decrementButton = card.querySelector('.decrement');
    
        if (!quantityElement || !incrementButton || !decrementButton) {
            console.warn("Required elements missing in card:", card);
            return; 
        }
        const minOrderMessage = document.createElement('p'); // Create minimum order message element
        let quantity = minOrder; // Initialize quantity to the minimum order value

        // Set up the minimum order message
        minOrderMessage.textContent = `Minimum order quantity is ${minOrder}`;
        minOrderMessage.style.color = "red";
        minOrderMessage.style.display = "none"; // Initially hide the message
        card.querySelector('.menu-content').appendChild(minOrderMessage); // Append the message to the card

        // Initialize the quantity display
        quantityElement.textContent = quantity;

        incrementButton.addEventListener('click', () => {
            quantity++;
            quantityElement.textContent = quantity;
            if (quantity >= minOrder) {
                minOrderMessage.style.display = "none"; // Hide the message if quantity >= minimum order
            }
        });

        decrementButton.addEventListener('click', () => {
            if (quantity > minOrder) {
                quantity--; // Allow decrement only if quantity > minOrder
                quantityElement.textContent = quantity;
                minOrderMessage.style.display = "none"; // Hide the message
            } else {
                minOrderMessage.style.display = "block"; // Show the message
            }
        });
        addToCartButton.addEventListener('click', () => {
            if (quantity >= minOrder) {
                const item = addToCartButton.dataset.item;
                const price = addToCartButton.dataset.price;
                const imageUrl = card.querySelector('.menu-image').src; // Fetch the image URL
        
                // Store item data including minOrder, quantity, price, and image URL in localStorage
                const cartItem = { quantity, price, imageUrl, minOrder };
                localStorage.setItem(item, JSON.stringify(cartItem));
        
                // Maintain order of items in a separate array
                let itemsOrder = JSON.parse(localStorage.getItem("itemsOrder")) || [];
                if (!itemsOrder.includes(item)) {
                    itemsOrder.push(item);
                }
                localStorage.setItem("itemsOrder", JSON.stringify(itemsOrder));
        
                // Set modal content
                document.getElementById('modal-item').textContent = `Item: ${item}`;
                document.getElementById('modal-quantity').textContent = `Quantity: ${quantity}`;
                document.getElementById('modal-price').textContent = `Price: €${(quantity * price).toFixed(2)}`;
        
                // Show the modal
                const modal = document.getElementById('cart-modal');
                modal.style.display = 'block';
        
                // Close modal logic
                const closeModal = document.getElementById('close-modal');
                closeModal.onclick = () => {
                    modal.style.display = 'none';
                };
        
                // Close modal when clicking outside of it
                window.onclick = (event) => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                };
        
                // Update cart count and save it to localStorage
                cartCount++; // Increment the cart count
                cartBadge.textContent = cartCount; // Update the badge text
                localStorage.setItem("cartCount", cartCount); // Save the updated cart count
            } else {
                alert(`Please order at least ${minOrder} items of ${addToCartButton.dataset.item}.`);
            }
        });
        
    });
});
