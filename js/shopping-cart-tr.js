// ============================================
// JBL STORE - Alışveriş Sepeti Sistemi
// ============================================

class ShoppingCartSystem {
  constructor() {
    this.cart = this.loadCart();
    this.initializeCart();
    this.attachEventListeners();
  }

  // 1. Sepeti localStorage'dan yükle
  loadCart() {
    const saved = localStorage.getItem('jblCart');
    return saved ? JSON.parse(saved) : [];
  }

  // 2. Sepeti localStorage'a kaydet
  saveCart() {
    localStorage.setItem('jblCart', JSON.stringify(this.cart));
  }

  // 3. Ürünü sepete ekle
  addToCart(name, price, image = null) {
    const existingItem = this.cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity++;
      this.showNotification(`✓ ${name} miktarı güncellendi`);
    } else {
      this.cart.push({
        id: Date.now(),
        name,
        price,
        image,
        quantity: 1
      });
      this.showNotification(`✓ ${name} sepete eklendi`);
    }
    this.saveCart();
    this.updateUI();
  }

  // 4. Ürünü sepetten sil
  removeFromCart(productId) {
    const index = this.cart.findIndex(item => item.id === productId);
    if (index > -1) {
      const name = this.cart[index].name;
      this.cart.splice(index, 1);
      this.saveCart();
      this.showNotification(`✗ ${name} sepetten çıkarıldı`);
      this.updateUI();
    }
  }

  // 5. Ürün miktarını güncelle
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
        this.updateUI();
      }
    }
  }

  // 6. Sepeti temizle
  clearCart() {
    if (this.cart.length === 0) {
      alert('Sepet zaten boş');
      return;
    }
    if (confirm('Sepeti tamamen temizlemek istediğinize emin misiniz?')) {
      this.cart = [];
      this.saveCart();
      this.showNotification('✓ Sepet temizlendi');
      this.updateUI();
    }
  }

  // 7. Toplam fiyatı hesapla
  getTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // 8. Ürün sayısını hesapla
  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // 9. Bildirim göster
  showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'cart-notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.classList.add('show');
    }, 10);
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // 10. Tüm UI'ı güncelle
  updateUI() {
    this.updateCartCount();
    this.renderCartModal();
  }

  // 11. Sepet sayacını güncelle (başlık)
  updateCartCount() {
    const badge = document.querySelector('.count_item_header');
    if (badge) {
      badge.textContent = this.getTotalItems();
    }
  }

  // 12. Sepet modalını render et
  renderCartModal() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    let html = `
      <div class="cart-modal-overlay" onclick="if(event.target === this) cartSystem.toggleCartModal()">
        <div class="cart-modal-content">
          <div class="cart-modal-header">
            <h2>🛒 Alışveriş Sepeti</h2>
            <button class="close-btn" onclick="cartSystem.toggleCartModal()">✕</button>
          </div>
    `;

    if (this.cart.length === 0) {
      html += `
        <div class="empty-cart">
          <p>😔 Sepetiniz boş</p>
          <p style="color: #999; font-size: 14px;">Lütfen bir ürün seçin</p>
        </div>
      `;
    } else {
      html += '<div class="cart-items-list">';
      this.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        html += `
          <div class="cart-item" data-item-id="${item.id}">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : ''}
            <div class="item-details">
              <h4>${item.name}</h4>
              <p class="item-price">₺${item.price.toLocaleString('tr-TR')}</p>
            </div>
            <div class="item-quantity">
              <button onclick="cartSystem.updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
              <input type="number" value="${item.quantity}" min="1" 
                onchange="cartSystem.updateQuantity(${item.id}, this.value)">
              <button onclick="cartSystem.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">
              ₺${itemTotal.toLocaleString('tr-TR')}
            </div>
            <button class="remove-btn" onclick="cartSystem.removeFromCart(${item.id})" title="Sil">
              🗑️
            </button>
          </div>
        `;
      });

      html += '</div>';

      const total = this.getTotal();
      html += `
        <div class="cart-summary">
          <div class="summary-row">
            <span>Ürünler:</span>
            <strong>${this.getTotalItems()} adet</strong>
          </div>
          <div class="summary-row">
            <span>Ara Toplam:</span>
            <strong>₺${total.toLocaleString('tr-TR')}</strong>
          </div>
          <div class="summary-row">
            <span>Kargo:</span>
            <strong>₺50,00</strong>
          </div>
          <div class="summary-row total">
            <span>Toplam:</span>
            <strong>₺${(total + 50).toLocaleString('tr-TR')}</strong>
          </div>
        </div>
        <div class="cart-actions">
          <button class="btn-checkout" onclick="cartSystem.checkout()">
            💳 Ödemeye Geç
          </button>
          <button class="btn-continue" onclick="cartSystem.toggleCartModal()">
            🛍️ Alışverişe Devam Et
          </button>
          <button class="btn-clear" onclick="cartSystem.clearCart()">
            🗑️ Sepeti Temizle
          </button>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    modal.innerHTML = html;
  }

  // 13. Sepet başlat (sayfa yüklendiğinde)
  initializeCart() {
    if (!document.getElementById('cartModal')) {
      const modal = document.createElement('div');
      modal.id = 'cartModal';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
    this.updateUI();
  }

  // 14. Sepet modalını aç/kapat
  toggleCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
      const isVisible = modal.style.display !== 'none';
      modal.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        this.renderCartModal();
      }
    }
  }

  // 15. Tüm ürün düğmelerine olay ekle
  attachEventListeners() {
    // Satın Al düğmelerine tıkla
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
    
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price);
      const image = card.dataset.image;
    
      if (e.target.classList.contains('buy-btn')) {
        cartSystem.addToCart(name, price, image);
        updateProductButton(card, 1);
      }
    
      if (e.target.classList.contains('plus')) {
        cartSystem.addToCart(name, price, image);
        const item = cartSystem.cart.find(i => i.name === name);
        updateProductButton(card, item.quantity);
      }
    
      if (e.target.classList.contains('minus')) {
        const item = cartSystem.cart.find(i => i.name === name);
        if (!item) return;
    
        cartSystem.updateQuantity(item.id, item.quantity - 1);
        updateProductButton(card, item.quantity - 1);
      }
    });

    
    

    // Sepet simgesine tıkla
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon && cartIcon.querySelector('.fa-cart-shopping')) {
      cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleCartModal();
      });
    }
  }

  // 16. Ödeme işlemi
  checkout() {
    if (this.cart.length === 0) {
      alert('Sepet boş');
      return;
    }

    const total = this.getTotal() + 50;
    const itemCount = this.getTotalItems();
    const summary = `
Ödeme Özeti:
━━━━━━━━━━━━━━━━
Ürünler: ${itemCount} adet
Ara Toplam: ₺${this.getTotal().toLocaleString('tr-TR')}
Kargo: ₺50,00
━━━━━━━━━━━━━━━━
TOPLAM: ₺${total.toLocaleString('tr-TR')}
    `;

    if (confirm(summary + '\n\nÖdemeye devam etmek istiyor musunuz?')) {
      alert('✓ Ödeme başarılı!\n\nSipariş numaranız: #' + Date.now());
      this.cart = [];
      this.saveCart();
      this.updateUI();
      this.toggleCartModal();
      this.showNotification('✓ Siparişiniz alındı');
    }
  }

  // 17. Sepet içeriğini göster (konsol için)
  showCartDetails() {
    console.log('📊 Sepet Detayları:');
    console.log('Ürünler:', this.cart);
    console.log('Toplam Ürün:', this.getTotalItems());
    console.log('Toplam Fiyat: ₺' + this.getTotal().toLocaleString('tr-TR'));
  }

  // 18. Sepeti İndir (CSV)
  downloadCartAsCSV() {
    let csv = 'Ürün Adı,Fiyat,Miktar,Toplam\n';
    this.cart.forEach(item => {
      csv += `"${item.name}",${item.price},${item.quantity},${item.price * item.quantity}\n`;
    });
    csv += `\nTOPLAM,${this.getTotal()}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sepet_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// Sayfa yüklendiğinde sistemi başlat
let cartSystem;
document.addEventListener('DOMContentLoaded', () => {
  cartSystem = new ShoppingCartSystem();
  console.log('✓ Alışveriş Sepeti Sistemi yüklendi');
});

// Kolay erişim için global fonksiyonlar
function addToCart(name, price, image) {
  if (cartSystem) {
    cartSystem.addToCart(name, price, image);
  }
}

function toggleCart() {
  if (cartSystem) {
    cartSystem.toggleCartModal();
  }
}

function getCartTotal() {
  return cartSystem ? cartSystem.getTotal() : 0;
}

function getCartItems() {
  return cartSystem ? cartSystem.cart : [];
}

document.querySelectorAll('.product-card').forEach(card => {
  const name = card.dataset.name;
  const item = cartSystem.cart.find(i => i.name === name);
  updateProductButton(card, item ? item.quantity : 0);
});


// Ürü ara
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const products = document.querySelectorAll('.product-card');

  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const searchValue = searchInput.value.toLowerCase().trim();

    products.forEach(product => {
      const productName = product.querySelector('h3').textContent.toLowerCase();

      if (productName.includes(searchValue)) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
  });
});


function updateProductButton(card, quantity) {
  const actionArea = card.querySelector('.action-area');

  if (quantity > 0) {
    actionArea.innerHTML = `
      <div class="qty-control">
        <button class="minus">−</button>
        <span>${quantity}</span>
        <button class="plus">+</button>
      </div>
    `;
  } else {
    actionArea.innerHTML = `
      <button class="buy-btn">Sepete Ekle</button>
    `;
  }
}


