const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('./database/logic/database');
const dbPegawai = require('./database/logic/database_pegawai');
const dbSuratTugas = require('./database/logic/database_surattugas');

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
            res.status(400).json({ "error": err.message });
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
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message });
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
        function (err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ "message": "success" });
        });
});

// Delete surat keluar
app.delete('/api/surat-keluar/:id', (req, res) => {
    db.run(`DELETE FROM surat_keluar WHERE id=?`, req.params.id, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success" });
    });
});

// --- API for Legalisir ---

// Get all legalisir
app.get('/api/legalisir', (req, res) => {
    db.all("SELECT * FROM legalisir ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
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
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message });
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
        function (err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ "message": "success" });
        });
});

// Delete legalisir
app.delete('/api/legalisir/:id', (req, res) => {
    db.run(`DELETE FROM legalisir WHERE id=?`, req.params.id, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "success" });
    });
});

// --- API for Pegawai ---

// Get all pegawai
app.get('/api/pegawai', (req, res) => {
    dbPegawai.all('SELECT "NO", "NAMA", "NIP BARU", "TMT KERJA", "Pangkat", "PANGKAT GOL/RUANG", "JABATAN", "TGL LAHIR", "TMT PENSIUN" FROM DataPegawai ORDER BY "NO" ASC', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// --- API for Surat Tugas ---

app.get('/api/surat-tugas/last-nomor', (req, res) => {
    db.get('SELECT nomor_urut FROM surat_keluar ORDER BY CAST(nomor_urut AS INTEGER) DESC LIMIT 1', [], (err, row) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        let nextNumber = 1;
        if (row && row.nomor_urut) {
            nextNumber = parseInt(row.nomor_urut) + 1;
            if (isNaN(nextNumber)) nextNumber = 1;
        }
        res.json({ "message": "success", "data": { nextNumber } });
    });
});

app.get('/api/surat-tugas', (req, res) => {
    dbSuratTugas.all('SELECT * FROM surat_tugas ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

app.get('/api/surat-tugas/:id', (req, res) => {
    dbSuratTugas.get('SELECT * FROM surat_tugas WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(400).json({ "error": err.message });
        if (!row) return res.status(404).json({ "error": "Not found" });
        dbSuratTugas.all('SELECT * FROM surat_tugas_pegawai WHERE surat_tugas_id = ?', [req.params.id], (err, pegawaiRows) => {
            if (err) return res.status(400).json({ "error": err.message });
            row.pegawai = pegawaiRows;
            res.json({ "message": "success", "data": row });
        });
    });
});

// Helper: format YYYY-MM-DD to "DD MMMM YYYY" in Indonesian
function formatDateID(dateStr) {
    if (!dateStr) return '...';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return day + ' ' + (months[monthIdx] || '') + ' ' + year;
}

app.post('/api/surat-tugas', (req, res) => {
    const data = req.body;
    dbSuratTugas.run(
        `INSERT INTO surat_tugas (surat_nomor, surat_tanggal, surat_bulan, surat_tahun, dasar_pengirim, dasar_nomor, dasar_tanggal, dasar_perihal, kegiatan_nama, kegiatan_haritanggal, kegiatan_waktu, kegiatan_tempat, pegawai_jumlah) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [data.surat_nomor, data.surat_tanggal, data.surat_bulan, data.surat_tahun, data.dasar_pengirim, data.dasar_nomor, data.dasar_tanggal, data.dasar_perihal, data.kegiatan_nama, data.kegiatan_haritanggal, data.kegiatan_waktu, data.kegiatan_tempat, data.pegawai_jumlah],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            const suratId = this.lastID;
            if (data.pegawai && data.pegawai.length > 0) {
                const stmt = dbSuratTugas.prepare(`INSERT INTO surat_tugas_pegawai (surat_tugas_id, nama, nip, pangkat, golongan, jabatan) VALUES (?,?,?,?,?,?)`);
                data.pegawai.forEach(p => {
                    stmt.run([suratId, p.nama, p.nip, p.pangkat, p.golongan, p.jabatan]);
                });
                stmt.finalize();
            }
            // Also insert into surat_keluar database
            db.run(
                `INSERT INTO surat_keluar (nomor_urut, tanggal_surat, nomor_surat, asal_surat, tujuan, isi_surat, keterangan) VALUES (?,?,?,?,?,?,?)`,
                [data.surat_nomor, data.surat_tanggal, 'B-' + data.surat_nomor, 'Kepegawaian', '-', 'Surat Tugas ' + data.kegiatan_nama, 'Generate Aplikasi'],
                function (errSK) {
                    if (errSK) console.error('Failed to insert surat_keluar:', errSK.message);
                }
            );
            res.json({ "message": "success", "data": { id: suratId } });
        }
    );
});

app.put('/api/surat-tugas/:id', (req, res) => {
    const data = req.body;
    const id = req.params.id;
    dbSuratTugas.run(
        `UPDATE surat_tugas SET surat_nomor=?, surat_tanggal=?, surat_bulan=?, surat_tahun=?, dasar_pengirim=?, dasar_nomor=?, dasar_tanggal=?, dasar_perihal=?, kegiatan_nama=?, kegiatan_haritanggal=?, kegiatan_waktu=?, kegiatan_tempat=?, pegawai_jumlah=? WHERE id=?`,
        [data.surat_nomor, data.surat_tanggal, data.surat_bulan, data.surat_tahun, data.dasar_pengirim, data.dasar_nomor, data.dasar_tanggal, data.dasar_perihal, data.kegiatan_nama, data.kegiatan_haritanggal, data.kegiatan_waktu, data.kegiatan_tempat, data.pegawai_jumlah, id],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            dbSuratTugas.run('DELETE FROM surat_tugas_pegawai WHERE surat_tugas_id=?', [id], (err) => {
                if (err) return res.status(400).json({ "error": err.message });
                if (data.pegawai && data.pegawai.length > 0) {
                    const stmt = dbSuratTugas.prepare(`INSERT INTO surat_tugas_pegawai (surat_tugas_id, nama, nip, pangkat, golongan, jabatan) VALUES (?,?,?,?,?,?)`);
                    data.pegawai.forEach(p => {
                        stmt.run([id, p.nama, p.nip, p.pangkat, p.golongan, p.jabatan]);
                    });
                    stmt.finalize();
                }
                res.json({ "message": "success" });
            });
        }
    );
});

app.delete('/api/surat-tugas/:id', (req, res) => {
    dbSuratTugas.run('DELETE FROM surat_tugas WHERE id=?', [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success" });
    });
});



// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
