const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke Database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'brothers_clothes_db'
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi Database Gagal:', err);
    } else {
        console.log('Terhubung ke Database MySQL!');
    }
});

// API 1: Mengambil Daftar & Stok Produk
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// API 2: Mengambil Informasi Alamat Toko
app.get('/api/store-info', (req, res) => {
    res.json({
        nama_toko: "Brothers Clothes Store",
        alamat: "Jl. Pemuda No. 45, Jakarta Timur",
        jam_operasional: "10.00 - 22.00 WIB",
        pengiriman: "JNE, J&T, GoSend, GrabExpress"
    });
});

app.listen(5000, () => {
    console.log('Server running di http://localhost:5000');
});