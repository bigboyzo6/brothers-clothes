// --- BAGIAN 1: PENGATURAN TEMA (JAM OTOMATIS & MANUAL SWITCH) ---

function updateSwitchButtonText() {
    const switchBtn = document.querySelector('.theme-switch-btn');
    if (!switchBtn) return;

    const isDark = document.body.classList.contains('crt-mode');

    if (isDark) {
        switchBtn.innerHTML = '<i class="fas fa-sun" style="color: #ffcc00; margin-right: 5px;"></i> Mode Terang';
    } else {
        switchBtn.innerHTML = '<i class="fas fa-moon" style="color: #ffcc00; margin-right: 5px;"></i> Mode Gelap';
    }
}

function showToast(message) {
    const toast = document.getElementById("toast-notification");
    if (toast) {
        toast.innerText = `> ${message}`;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }
}

function initAutoTheme() {
    const isDayTime = new Date().getHours() >= 6 && new Date().getHours() < 18;
    const savedTheme = localStorage.getItem('userThemePreference');
    
    // Prioritas 1: savedTheme dari localStorage, Prioritas 2: Jam otomatis
    const useCrt = savedTheme ? savedTheme === 'dark' : !isDayTime;

    document.body.classList.toggle('crt-mode', useCrt);
    updateSwitchButtonText();
}

function setupThemeSwitcher() {
    const switchBtn = document.querySelector('.theme-switch-btn');
    if (switchBtn) {
        switchBtn.replaceWith(switchBtn.cloneNode(true));
        const freshSwitchBtn = document.querySelector('.theme-switch-btn');

        freshSwitchBtn.addEventListener('click', function() {
            document.body.classList.toggle('crt-mode');
            if (document.body.classList.contains('crt-mode')) {
                localStorage.setItem('userThemePreference', 'dark');
            } else {
                localStorage.setItem('userThemePreference', 'light');
            }
            updateSwitchButtonText();
        });
    }
}


// --- BAGIAN 2: DATA PRODUK (DINAMIS DARI JSON) & LOGIKA E-COMMERCE ---

let products = [];
let cart = [];
let wishlist = [];
let activeCategory = 'ALL';

// Fungsi untuk mengambil data dari products.json
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Gagal memuat data produk.');
        }
        products = await response.json();
        renderProducts(); // Render produk setelah data berhasil ditarik
    } catch (error) {
        console.error('Error:', error);
        const grid = document.getElementById('product-list');
        if (grid) {
            grid.innerHTML = `<p style="color: red; grid-column: 1/-1; text-align: center; padding: 20px;">Gagal memuat produk dari server/JSON.</p>`;
        }
    }
}

function addToCartConfirmed() {
    const name = document.getElementById("modal-product-name").innerText;
    const size = document.getElementById("select-size").value;
    const color = document.getElementById("select-color").value;
    
    const product = products.find(p => p.name === name);
    const price = product ? product.price : 120000; 

    let itemImage = product ? product.defaultImage : "";
    if (product && product.images && product.images[color]) {
        itemImage = product.images[color];
    }

    const existingIndex = cart.findIndex(item => item.name === name && item.size === size && item.color === color);
    
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            name: name,
            size: size,
            color: color,
            price: price,
            image: itemImage,
            qty: 1
        });
    }

    updateCartBadge();
    closeVariantModal();
    showToast("Produk telah dimasukkan ke keranjang!");
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
        cartCountEl.innerText = totalItems;
    }
}

function toggleCartModal() {
    const modal = document.getElementById("cart-modal");
    if (!modal) return;
    if (modal.style.display === "none" || modal.style.display === "") {
        renderCartItems();
        modal.style.display = "flex";
    } else {
        modal.style.display = "none";
    }
}

function renderCartItems() {
    const container = document.getElementById("cart-items-container");
    const totalEl = document.getElementById("cart-total-price");
    
    if (!container) return;
    
    container.innerHTML = "";
    let totalPrice = 0;

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:10px;'>Keranjang belanja masih kosong.</p>";
        if (totalEl) totalEl.innerText = "Rp 0";
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        totalPrice += itemTotal;

        const row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
            <div class="cart-item-info" style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px dashed #ccc; padding-bottom:8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                    <div>
                        <h4 style="margin:0 0 4px 0; font-size: 14px;">${item.name}</h4>
                        <p style="margin:0; font-size:12px; color:#666;">Ukuran: ${item.size} | Warna: ${item.color}</p>
                        <div class="qty-controls" style="margin-top: 6px;">
                            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                            <span style="margin: 0 8px; font-size: 13px;">${item.qty} x Rp ${item.price.toLocaleString("id-ID")}</span>
                            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
                <div>
                    <strong style="font-size: 14px;">Rp ${itemTotal.toLocaleString("id-ID")}</strong>
                </div>
            </div>
        `;
        container.appendChild(row);
    });

    if (totalEl) {
        totalEl.innerText = `Rp ${totalPrice.toLocaleString("id-ID")}`;
    }
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartBadge();
    renderCartItems();
}

function checkoutWhatsApp() {
    if (cart.length === 0) return alert("Keranjang kamu kosong!");
    let msg = "Halo Brothers Clothes, saya mau pesan:\n";
    cart.forEach(i => {
        msg += `- ${i.name} (${i.size}, ${i.color}) x${i.qty}\n`;
    });
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank');
}

function checkoutShopee() { window.open("https://shopee.co.id", "_blank"); }
function checkoutTokopedia() { window.open("https://tokopedia.com", "_blank"); }
function checkoutTikTok() { window.open("https://tiktok.com", "_blank"); }

function showHeroView() {
    document.getElementById('hero-view').classList.add('active-view');
    document.getElementById('catalog-view').classList.remove('active-view');
}

function showCatalogView() {
    document.getElementById('hero-view').classList.remove('active-view');
    document.getElementById('catalog-view').classList.add('active-view');
    renderProducts();
}

function scrollToInfo() {
    setTimeout(() => {
        document.getElementById('info-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function renderProducts() {
    const grid = document.getElementById('product-list');
    const searchInput = document.getElementById('search-input');
    if (!grid) return;
    
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = products.filter(p => {
        const matchesCategory = (activeCategory === 'ALL' || p.category.toUpperCase() === activeCategory.toUpperCase());
        const matchesSearch = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-color, #fff); grid-column: 1/-1; text-align: center; padding: 20px;">Produk tidak ditemukan.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const imgSrc = p.defaultImage || p.image;
        const isWishlisted = wishlist.includes(p.id);

        return `
            <div class="product-card" data-category="${p.category.toLowerCase()}">
                <img src="${imgSrc}" alt="${p.name}" class="product-img" onclick="openQuickView(${p.id})">
                <div class="product-details">
                    <div class="product-title">${p.name}</div>
                    <div class="product-price">Rp ${p.price.toLocaleString('id-ID')}</div>
                    
                    <div class="card-actions">
                        <button class="btn-hero btn-brick btn-detail" onclick="openQuickView(${p.id})">Lihat Detail</button>
                        <button class="btn-wishlist-card ${isWishlisted ? 'active' : ''}" 
                                onclick="toggleWishlist(${p.id})" 
                                title="Tambah ke Wishlist">
                            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        renderProducts();
        searchInput.focus();
    }
}

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if (index === -1) {
        wishlist.push(id);
        showToast("Ditambahkan ke Wishlist!");
    } else {
        wishlist.splice(index, 1);
        showToast("Dihapus dari Wishlist!");
    }
    renderProducts();
    renderWishlistModal();
}

function renderWishlistModal() {
    const container = document.getElementById('wishlist-items-container');
    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">Wishlist kamu masih kosong.</p>';
        return;
    }

    const wishlistedProducts = products.filter(p => wishlist.includes(p.id));
    
    let html = '<div class="wishlist-list">';
    wishlistedProducts.forEach(product => {
        const imgSrc = product.defaultImage || product.image;
        html += `
            <div class="wishlist-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">
                <div style="display:flex; align-items:center; gap: 10px;">
                    <img src="${imgSrc}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <strong>${product.name}</strong><br>
                        <small>Rp ${product.price.toLocaleString('id-ID')}</small>
                    </div>
                </div>
                <button onclick="toggleWishlist(${product.id})" class="btn-clear-search" style="color:red; font-size:18px;">&times;</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function openQuickView(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const mainImg = document.getElementById('qv-main-img');
    const imgSrc = product.defaultImage || product.image;
    if (mainImg) mainImg.src = imgSrc;

    document.getElementById('qv-title').innerText = product.name;
    document.getElementById('qv-price').innerText = `Rp ${product.price.toLocaleString('id-ID')}`;
    document.getElementById('qv-stock').innerText = `Stok Tersedia: ${product.stock}`;
    document.getElementById('qv-desc').innerText = product.description;

    const colorBox = document.getElementById('qv-color-options');
    if (product.images && colorBox) {
        const colors = Object.keys(product.images);
        colorBox.innerHTML = colors.map(color => {
            let cssClass = color.toLowerCase().replace('-abu', '');
            return `<button class="color-pill ${cssClass}" onclick="changeProductImage('${product.images[color]}')">${color}</button>`;
        }).join('');
    } else if (colorBox) {
        colorBox.innerHTML = '';
    }

    document.getElementById('qv-btn-add').onclick = function() {
        closeQuickViewModal();
        openVariantModal(product.name);
    };

    document.getElementById('quick-view-modal').style.display = 'flex';
}

function changeProductImage(imageSrc) {
    const mainImg = document.getElementById('qv-main-img');
    if (mainImg) mainImg.src = imageSrc;
}

function closeQuickViewModal() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.style.display = 'none';
}

function openVariantModal(name) {
    document.getElementById('modal-product-name').innerText = name;
    document.getElementById('input-tb').value = '';
    document.getElementById('input-bb').value = '';
    document.getElementById('recommendation-result').innerText = 'Masukkan TB & BB untuk kalkulasi otomatis';
    document.getElementById('recommendation-badge').className = 'recommend-badge default';
    document.getElementById('variant-modal').style.display = 'flex';
}

function closeVariantModal() {
    document.getElementById('variant-modal').style.display = 'none';
}

function openSizeOnlyModal() {
    document.getElementById('size-calculator-modal').style.display = 'flex';
}

function hitungRekomendasiUkuran() {
    const tb = parseFloat(document.getElementById('input-tb').value);
    const bb = parseFloat(document.getElementById('input-bb').value);
    const resultText = document.getElementById('recommendation-result');
    const resultBadge = document.getElementById('recommendation-badge');
    const selectSize = document.getElementById('select-size');

    if (!tb || !bb || tb <= 0 || bb <= 0) {
        resultText.innerText = "Masukkan TB & BB untuk kalkulasi otomatis";
        resultBadge.className = "recommend-badge default";
        return;
    }

    let recommendedSize = "";
    if (bb < 55 && tb < 165) {
        recommendedSize = "S";
    } else if ((bb >= 55 && bb <= 67) || (tb >= 165 && tb <= 173 && bb <= 70)) {
        recommendedSize = "M";
    } else if ((bb > 67 && bb <= 78) || (tb > 173 && tb <= 180 && bb <= 82)) {
        recommendedSize = "L";
    } else if ((bb > 78 && bb <= 90) || (tb > 180 && bb <= 95)) {
        recommendedSize = "XL";
    } else {
        recommendedSize = "XXL";
    }

    resultText.innerHTML = `✨ Rekomendasi Ukuran Kamu: <strong>[ ${recommendedSize} ]</strong>`;
    resultBadge.className = "recommend-badge active";
    selectSize.value = recommendedSize;
}

function toggleWishlistModal() {
    const m = document.getElementById('wishlist-modal');
    if (!m) return;
    if (m.style.display === 'flex' || m.style.display === 'block') {
        m.style.display = 'none';
    } else {
        renderWishlistModal();
        m.style.display = 'flex';
    }
}

function calculateSize() {
    const h = parseFloat(document.getElementById('calc-height').value);
    const w = parseFloat(document.getElementById('calc-weight').value);
    const calcBadge = document.getElementById('calc-recommendation-badge');
    
    if (h && w) {
        let size = 'M';
        if (h > 175 || w > 75) size = 'XL';
        else if (h > 170 || w > 65) size = 'L';
        else if (h < 160 || w < 50) size = 'S';
        
        calcBadge.className = 'recommend-badge active';
        calcBadge.innerHTML = `Rekomendasi Ukuran Anda: <strong>${size}</strong>`;
    } else {
        calcBadge.className = 'recommend-badge default';
        calcBadge.innerText = 'Masukkan TB & BB untuk kalkulasi otomatis';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAutoTheme();
    setupThemeSwitcher();
    loadProducts(); // Memanggil fungsi untuk fetch data JSON

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', renderProducts);

    const filterButtons = document.querySelectorAll('.quick-filter-buttons .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-category');
            renderProducts();
        });
    });

    const btnCloseCalc = document.getElementById('close-size-calc-modal');
    const sizeCalcModal = document.getElementById('size-calculator-modal');
    if (btnCloseCalc && sizeCalcModal) {
        btnCloseCalc.addEventListener('click', () => {
            sizeCalcModal.style.display = 'none';
        });
    }

    const calcHeight = document.getElementById('calc-height');
    const calcWeight = document.getElementById('calc-weight');
    if (calcHeight && calcWeight) {
        calcHeight.addEventListener('input', calculateSize);
        calcWeight.addEventListener('input', calculateSize);
    }
});