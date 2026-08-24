const API_URL = 'http://localhost:5000/api';

// Array penampung barang di keranjang
let cart = [];

// Format mata uang Rupiah
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

// 1. Ambil Informasi Alamat Toko & Pengiriman
fetch(`${API_URL}/store-info`)
  .then(res => res.json())
  .then(data => {
    const infoDiv = document.getElementById('store-info-content');
    if (infoDiv) {
      infoDiv.innerHTML = `
        <p><strong>Nama Toko:</strong> ${data.nama_toko}</p>
        <p><strong>Alamat Lengkap:</strong> ${data.alamat}</p>
        <p><strong>Jam Operasional:</strong> ${data.jam_operasional}</p>
        <p><strong>Opsi Pengiriman:</strong> ${data.pengiriman}</p>
      `;
    }
  })
  .catch(err => console.error('Error fetching store info:', err));

// 2. Ambil Daftar Produk dari Database
fetch(`${API_URL}/products`)
  .then(res => res.json())
  .then(products => {
    renderProducts(products);
  })
  .catch(err => console.error('Error fetching products:', err));

// 3. Render Katalog Produk
function renderProducts(products) {
  const container = document.getElementById('product-list');
  if (!container) return;
  
  container.innerHTML = '';

  products.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.foto_url}" 
             alt="${p.nama_produk}" 
             class="product-img" 
             onerror="this.onerror=null; this.src='https://placehold.co/300x200?text=No+Image';">
        
        <div class="product-details">
          <h3 class="product-title">${p.nama_produk}</h3>
          <p class="product-price">${formatRupiah(p.harga)}</p>
          <span class="product-stock">Stok: ${p.stok} pcs</span>
          
          <button class="btn-buy" onclick="addToCart('${p.nama_produk}', ${p.harga})">
            + Tambah Keranjang
          </button>
        </div>
      </div>
    `;
  });
}

// 4. Buka / Tutup Modal Keranjang
function toggleCart() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

// 5. Tambah Barang ke Keranjang
function addToCart(nama, harga) {
  const existingItem = cart.find(item => item.nama === nama);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ nama, harga, qty: 1 });
  }
  
  updateCartUI();
}

// 6. Hapus Barang dari Keranjang
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// 7. Update Tampilan Keranjang & Badge
function updateCartUI() {
  const cartList = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total-price');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) cartCount.innerText = totalQty;

  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = '<p style="text-align:center; color:#888;">Keranjang kamu masih kosong.</p>';
    if (cartTotal) cartTotal.innerText = formatRupiah(0);
    return;
  }

  let totalHarga = 0;
  cartList.innerHTML = '';

  cart.forEach((item, index) => {
    const subtotal = item.harga * item.qty;
    totalHarga += subtotal;

    cartList.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.nama}</strong><br>
          <small>${item.qty} x ${formatRupiah(item.harga)}</small>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold; margin-bottom: 4px;">${formatRupiah(subtotal)}</div>
          <button class="btn-remove" onclick="removeFromCart(${index})">Hapus</button>
        </div>
      </div>
    `;
  });

  if (cartTotal) cartTotal.innerText = formatRupiah(totalHarga);
}

// 8. Checkout ke WhatsApp
function checkoutWA() {
  if (cart.length === 0) {
    alert("Keranjang kamu masih kosong!");
    return;
  }

  let pesan = "Halo Admin Brothers Clothes, saya mau pesan:\n\n";
  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.harga * item.qty;
    pesan += `${i + 1}. ${item.nama} (${item.qty}x) = ${formatRupiah(subtotal)}\n`;
    total += subtotal;
  });

  pesan += `\n*Total Bayar: ${formatRupiah(total)}*`;

  // Ganti dengan nomor WhatsApp Toko kamu (format 62...)
  const noWA = "6281234567890"; 
  const url = `https://wa.me/${noWA}?text=${encodeURIComponent(pesan)}`;
  
  window.open(url, '_blank');
}