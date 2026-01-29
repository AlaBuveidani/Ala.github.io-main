// ===============================================
// CART POPUP FUNCTIONALITY
// ===============================================

// Create popup HTML structure
function createCartPopup() {
    const popupHTML = `
        <!-- Cart Popup Overlay -->
        <div class="cart-popup-overlay" id="cartPopupOverlay"></div>
        
        <!-- Cart Popup -->
        <div class="cart-popup" id="cartPopup">
            <!-- Header -->
            <div class="cart-popup-header">
                <h2>
                    <i class="fa-solid fa-cart-shopping"></i>
                    Sepetim
                </h2>
                <button class="cart-popup-close" id="closeCartPopup">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <!-- Success Message -->
            <div class="cart-popup-success" id="cartPopupSuccess" style="display: none;">
                <i class="fa-solid fa-circle-check"></i>
                <span>Ürün sepetinize eklendi</span>
            </div>
            
            <!-- Content -->
            <div class="cart-popup-content" id="cartPopupContent">
                <!-- Content will be dynamically loaded -->
            </div>
            
            <!-- Footer -->
            <div class="cart-popup-footer">
                <div class="cart-popup-buttons">
                    <a href="cart.html" class="cart-popup-btn cart-popup-btn-primary">
                        <i class="fa-solid fa-shopping-bag"></i>
                        Sepete Git
                    </a>
                    <button class="cart-popup-btn cart-popup-btn-secondary" id="continueShoppingBtn">
                        <i class="fa-solid fa-arrow-left"></i>
                        Alışverişe Devam Et
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
}

// Initialize popup
function initCartPopup() {
    // Create popup if it doesn't exist
    if (!document.getElementById('cartPopup')) {
        createCartPopup();
    }
    
    const overlay = document.getElementById('cartPopupOverlay');
    const popup = document.getElementById('cartPopup');
    const closeBtn = document.getElementById('closeCartPopup');
    const continueBtn = document.getElementById('continueShoppingBtn');
    
    // Close popup events
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCartPopup);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeCartPopup);
    }
    
    if (continueBtn) {
        continueBtn.addEventListener('click', closeCartPopup);
    }
    
    // Open popup when any cart icon is clicked
    // Method 1: Target links with cart-icon class
    const cartIconLinks = document.querySelectorAll('a.cart-icon');
    cartIconLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openCartPopup();
        });
    });
    
    // Method 2: Target all links containing cart shopping icon
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
        if (link.querySelector('.fa-cart-shopping')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openCartPopup();
            });
        }
    });
    
    // Method 3: Specifically target header cart icons
    const headerCartIcons = document.querySelectorAll('.header_icons .icon a');
    headerCartIcons.forEach(link => {
        const cartIcon = link.querySelector('.fa-cart-shopping');
        if (cartIcon) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openCartPopup();
            });
        }
    });
}

// Open cart popup
function openCartPopup(justAdded = null) {
    const overlay = document.getElementById('cartPopupOverlay');
    const popup = document.getElementById('cartPopup');
    const successMsg = document.getElementById('cartPopupSuccess');
    
    if (overlay && popup) {
        // Show success message if item was just added
        if (justAdded && successMsg) {
            successMsg.style.display = 'flex';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }
        
        // Update popup content
        updateCartPopupContent(justAdded);
        
        // Show popup
        overlay.classList.add('active');
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close cart popup
function closeCartPopup() {
    const overlay = document.getElementById('cartPopupOverlay');
    const popup = document.getElementById('cartPopup');
    
    if (overlay && popup) {
        overlay.classList.remove('active');
        popup.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Update popup content
function updateCartPopupContent(justAdded = null) {
    const content = document.getElementById('cartPopupContent');
    if (!content) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        content.innerHTML = `
            <div class="cart-popup-empty">
                <i class="fa-solid fa-cart-shopping"></i>
                <h3>Sepetiniz Boş</h3>
                <p>Alışverişe başlamak için ürünlerimize göz atın</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Show just added product
    if (justAdded) {
        html += `
            <div class="cart-added-product">
                <div class="cart-added-product-image">
                    <img src="${justAdded.image}" alt="${justAdded.name}">
                </div>
                <div class="cart-added-product-details">
                    <h3>${justAdded.name}</h3>
                    <p class="cart-added-product-price">₺${formatPrice(justAdded.price)}</p>
                    <p class="cart-added-product-quantity">Miktar: ${justAdded.quantity}</p>
                </div>
            </div>
        `;
    }
    
    // Free shipping progress bar
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingThreshold = 1000;
    const remaining = freeShippingThreshold - subtotal;
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    
    html += `
        <div class="free-shipping-progress">
            <p>${remaining > 0 ? `Ücretsiz kargo için ${formatPrice(remaining)} ₺ daha alışveriş yapın!` : 'Tebrikler! Ücretsiz kargo kazandınız! 🎉'}</p>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            ${remaining <= 0 ? '<p class="free-shipping-message"><i class="fa-solid fa-truck"></i> Ücretsiz Kargo</p>' : ''}
        </div>
    `;
    
    // Cart items
    html += `
        <div class="cart-popup-items">
            <h3>Sepetinizdeki Ürünler (${cart.length})</h3>
    `;
    
    cart.forEach(item => {
        html += `
            <div class="mini-cart-item">
                <div class="mini-cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="mini-cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="mini-cart-item-info">
                        <span class="mini-cart-item-quantity">${item.quantity} adet</span>
                        <span class="mini-cart-item-price">₺${formatPrice(item.price * item.quantity)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Cart summary
    const tax = subtotal * 0.20;
    const total = subtotal + tax;
    
    html += `
        <div class="cart-popup-summary">
            <div class="cart-summary-row">
                <span>Ara Toplam:</span>
                <span>₺${formatPrice(subtotal)}</span>
            </div>
            <div class="cart-summary-row">
                <span>KDV (%20):</span>
                <span>₺${formatPrice(tax)}</span>
            </div>
            <div class="cart-summary-row">
                <span>Kargo:</span>
                <span>${subtotal >= freeShippingThreshold ? 'ÜCRETSİZ' : '₺50'}</span>
            </div>
            <div class="cart-summary-divider"></div>
            <div class="cart-summary-total">
                <span>Toplam:</span>
                <span>₺${formatPrice(total + (subtotal >= freeShippingThreshold ? 0 : 50))}</span>
            </div>
        </div>
    `;
    
    // Suggested products (optional)
    html += `
        <div class="cart-popup-suggestions">
            <h3>Bunları da beğenebilirsiniz</h3>
            <div class="suggestion-item">
                <div class="suggestion-item-image">
                    <img src="img/jbl-wireless-mic.png" alt="JBL Kablosuz Mikrofon">
                </div>
                <div class="suggestion-item-details">
                    <h4>JBL Kablosuz Mikrofon</h4>
                    <p class="suggestion-item-price">₺1.199</p>
                </div>
            </div>
            <div class="suggestion-item">
                <div class="suggestion-item-image">
                    <img src="img/jbl-flip.png" alt="JBL Flip Bluetooth Hoparlör">
                </div>
                <div class="suggestion-item-details">
                    <h4>JBL Flip Bluetooth Hoparlör</h4>
                    <p class="suggestion-item-price">₺2.799</p>
                </div>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// Format price helper
function formatPrice(price) {
    return price.toLocaleString('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Modified add to cart function to show popup
function addToCartWithPopup(productData) {
    // Get existing cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists
    const existingIndex = cart.findIndex(item => item.name === productData.name);
    
    if (existingIndex > -1) {
        // Increase quantity
        cart[existingIndex].quantity += 1;
    } else {
        // Add new product
        cart.push({
            name: productData.name,
            price: productData.price,
            image: productData.image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update header cart count
    updateHeaderCartCount();
    
    // Open popup with just added item
    const addedItem = existingIndex > -1 ? cart[existingIndex] : cart[cart.length - 1];
    openCartPopup(addedItem);
}

// Update header cart count
function updateHeaderCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const headerCounts = document.querySelectorAll('.count_item_header');
    headerCounts.forEach(count => {
        count.textContent = totalItems;
        
        // Animate the count
        count.style.transform = 'scale(1.3)';
        setTimeout(() => {
            count.style.transform = 'scale(1)';
        }, 300);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initCartPopup();
    updateHeaderCartCount();
    
    // Add event listeners to all "Add to Cart" buttons
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productCard = this.closest('.product-card');
            if (productCard) {
                const productData = {
                    name: productCard.dataset.name,
                    price: parseInt(productCard.dataset.price),
                    image: productCard.dataset.image
                };
                
                addToCartWithPopup(productData);
            }
        });
    });
});

// Close popup with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCartPopup();
    }
});