const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const dbPegawai = require('./database_pegawai');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API for Surat Keluar ---

// Get all surat keluar
app.get('/api/surat-keluar', (req, res) => {
    db.all("SELECT * FROM surat_keluar ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create new surat keluar
app.post('/api/surat-keluar', (req, res) => {
    const { nomor_urut, tanggal_surat, nomor_surat, asal_surat, tujuan, isi_surat, keterangan } = req.body;
    db.run(`INSERT INTO surat_keluar (nomor_urut, tanggal_surat, nomor_surat, asal_surat, tujuan, isi_surat, keterangan) VALUES (?,?,?,?,?,?,?)`,
        [nomor_urut, tanggal_surat, nomor_surat, asal_surat, tujuan, isi_surat, keterangan],
        function(err, result) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({
                "message": "success",
                "data": { id: this.lastID }
            });
        });
});

// Update surat keluar
app.put('/api/surat-keluar/:id', (req, res) => {
    const { nomor_urut, tanggal_surat, nomor_surat, asal_surat, tujuan, isi_surat, keterangan } = req.body;
    db.run(`UPDATE surat_keluar SET nomor_urut=?, tanggal_surat=?, nomor_surat=?, asal_surat=?, tujuan=?, isi_surat=?, keterangan=? WHERE id=?`,
        [nomor_urut, tanggal_surat, nomor_surat, asal_surat, tujuan, isi_surat, keterangan, req.params.id],
        function(err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({"message": "success"});
        });
});

// Delete surat keluar
app.delete('/api/surat-keluar/:id', (req, res) => {
    db.run(`DELETE FROM surat_keluar WHERE id=?`, req.params.id, function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message": "success"});
    });
});

// --- API for Legalisir ---

// Get all legalisir
app.get('/api/legalisir', (req, res) => {
    db.all("SELECT * FROM legalisir ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create new legalisir
app.post('/api/legalisir', (req, res) => {
    const { nomor_urut, tanggal_surat, nomor_legalisir, nama_nip, yang_menandatangani, keterangan } = req.body;
    db.run(`INSERT INTO legalisir (nomor_urut, tanggal_surat, nomor_legalisir, nama_nip, yang_menandatangani, keterangan) VALUES (?,?,?,?,?,?)`,
        [nomor_urut, tanggal_surat, nomor_legalisir, nama_nip, yang_menandatangani, keterangan],
        function(err, result) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({
                "message": "success",
                "data": { id: this.lastID }
            });
        });
});

// Update legalisir
app.put('/api/legalisir/:id', (req, res) => {
    const { nomor_urut, tanggal_surat, nomor_legalisir, nama_nip, yang_menandatangani, keterangan } = req.body;
    db.run(`UPDATE legalisir SET nomor_urut=?, tanggal_surat=?, nomor_legalisir=?, nama_nip=?, yang_menandatangani=?, keterangan=? WHERE id=?`,
        [nomor_urut, tanggal_surat, nomor_legalisir, nama_nip, yang_menandatangani, keterangan, req.params.id],
        function(err) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({"message": "success"});
        });
});

// Delete legalisir
app.delete('/api/legalisir/:id', (req, res) => {
    db.run(`DELETE FROM legalisir WHERE id=?`, req.params.id, function(err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message": "success"});
    });
});

// --- API for Pegawai ---

// Get all pegawai
app.get('/api/pegawai', (req, res) => {
    dbPegawai.all('SELECT "NO", "NAMA", "NIP BARU", "TMT KERJA", "Pangkat", "PANGKAT GOL/RUANG", "JABATAN", "TGL LAHIR", "TMT PENSIUN" FROM DataPegawai ORDER BY "NO" ASC', [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
