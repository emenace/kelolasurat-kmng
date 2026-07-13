require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const db = require('./database/logic/database');
const dbPegawai = require('./database/logic/database_pegawai');
const dbSuratTugas = require('./database/logic/database_surattugas');
const dbSKCuti = require('./database/logic/database_skcuti');

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
    dbPegawai.all('SELECT * FROM DataPegawai ORDER BY "NO" ASC', [], (err, rows) => {
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

// Verify pass key for editing data pegawai
app.post('/api/verify-key', (req, res) => {
    const { key } = req.body;
    const correctKey = process.env.EDIT_PASSKEY;
    if (key === correctKey) {
        res.json({ message: "success" });
    } else {
        res.status(401).json({ error: "Kode kunci tidak sesuai, perubahan tidak diperbolehkan" });
    }
});

// Add new pegawai
app.post('/api/pegawai', (req, res) => {
    const d = req.body;
    // Auto-sync FORMATTED NIP from NIP BARU
    d["FORMATTED NIP"] = d["NIP BARU"] || '';
    dbPegawai.run(
        `INSERT INTO DataPegawai ("NO","NAMA","NIP LAMA","NIP BARU","FORMATTED NIP","GOLRU","PANGKAT","TMT GOLRU","SATKER","JABATAN","TMT JABATAN","THN","BLN","PENDIDIKAN TERAKHIR","THN PENDIDIKAN","JENIS PENDIDIKAN","TGL LAHIR","TMT PENSIUN","KET")
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [d["NO"], d["NAMA"], d["NIP LAMA"], d["NIP BARU"], d["FORMATTED NIP"], d["GOLRU"], d["PANGKAT"], d["TMT GOLRU"], d["SATKER"], d["JABATAN"], d["TMT JABATAN"], d["THN"], d["BLN"], d["PENDIDIKAN TERAKHIR"], d["THN PENDIDIKAN"], d["JENIS PENDIDIKAN"], d["TGL LAHIR"], d["TMT PENSIUN"], d["KET"]],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success", "data": { id: this.lastID } });
        }
    );
});

// Update pegawai by NO
app.put('/api/pegawai/:no', (req, res) => {
    const d = req.body;
    const no = req.params.no;
    // Auto-sync FORMATTED NIP from NIP BARU
    d["FORMATTED NIP"] = d["NIP BARU"] || '';
    dbPegawai.run(
        `UPDATE DataPegawai SET "NAMA"=?,"NIP LAMA"=?,"NIP BARU"=?,"FORMATTED NIP"=?,"GOLRU"=?,"PANGKAT"=?,"TMT GOLRU"=?,"SATKER"=?,"JABATAN"=?,"TMT JABATAN"=?,"THN"=?,"BLN"=?,"PENDIDIKAN TERAKHIR"=?,"THN PENDIDIKAN"=?,"JENIS PENDIDIKAN"=?,"TGL LAHIR"=?,"TMT PENSIUN"=?,"KET"=? WHERE "NO"=?`,
        [d["NAMA"], d["NIP LAMA"], d["NIP BARU"], d["FORMATTED NIP"], d["GOLRU"], d["PANGKAT"], d["TMT GOLRU"], d["SATKER"], d["JABATAN"], d["TMT JABATAN"], d["THN"], d["BLN"], d["PENDIDIKAN TERAKHIR"], d["THN PENDIDIKAN"], d["JENIS PENDIDIKAN"], d["TGL LAHIR"], d["TMT PENSIUN"], d["KET"], no],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success" });
        }
    );
});

// Delete pegawai by NO
app.delete('/api/pegawai/:no', (req, res) => {
    dbPegawai.run('DELETE FROM DataPegawai WHERE "NO"=?', [req.params.no], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success" });
    });
});

// Import CSV DataPegawai with automatic backup
app.post('/api/pegawai/import-csv', upload.single('csvFile'), (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'File CSV tidak ditemukan' });
    }

    try {
        const fileContent = req.file.buffer.toString('utf-8');
        const normalized = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        const records = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < normalized.length; i++) {
            const ch = normalized[i];
            if (ch === '"') {
                if (inQuotes && i + 1 < normalized.length && normalized[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === '\n' && !inQuotes) {
                if (current.trim() !== '') {
                    records.push(current);
                }
                current = '';
            } else {
                current += ch;
            }
        }
        if (current.trim() !== '') {
            records.push(current);
        }

        if (records.length < 2) {
            return res.status(400).json({ error: 'File CSV kosong atau tidak memiliki data baris' });
        }

        const headers = records[0].split(';').map(h => h.trim());
        const rows = [];
        for (let i = 1; i < records.length; i++) {
            const rowData = records[i].split(';');
            const row = {};
            headers.forEach((header, index) => {
                let val = rowData[index] || null;
                if (val !== null) {
                    val = val.trim();
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.substring(1, val.length - 1);
                    }
                    val = val.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                }
                row[header] = val;
            });
            rows.push(row);
        }

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Tidak ada data valid yang bisa diimpor' });
        }

        // Automatic Backup of pegawai.sqlite with format DDMMYYYY (e.g. pegawai.sqlite.13072026)
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const backupFileName = `pegawai.sqlite.${dd}${mm}${yyyy}`;
        const dbPath = path.resolve(__dirname, './database/data/pegawai.sqlite');
        const backupPath = path.resolve(__dirname, `./database/data/${backupFileName}`);

        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, backupPath);
            console.log(`Backup database pegawai berhasil dibuat: ${backupFileName}`);
        }

        dbPegawai.serialize(() => {
            dbPegawai.run('DELETE FROM DataPegawai', (errDel) => {
                if (errDel) {
                    console.error('Error clearing DataPegawai:', errDel.message);
                    return res.status(500).json({ error: errDel.message });
                }

                const stmt = dbPegawai.prepare(`INSERT INTO "DataPegawai" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                rows.forEach(row => {
                    const formattedNip = row['NIP BARU'] || '';
                    const ket = row['KET.'] || row['KET'] || null;

                    stmt.run([
                        row['NO'],
                        row['NAMA'],
                        row['NIP LAMA'],
                        row['NIP BARU'],
                        formattedNip,
                        row['GOLRU'],
                        row['PANGKAT'],
                        row['TMT GOLRU'],
                        row['SATKER'],
                        row['JABATAN'],
                        row['TMT JABATAN'],
                        row['THN'],
                        row['BLN'],
                        row['PENDIDIKAN TERAKHIR'],
                        row['THN PENDIDIKAN'],
                        row['JENIS PENDIDIKAN'],
                        row['TGL LAHIR'],
                        row['TMT PENSIUN'],
                        ket
                    ]);
                });
                stmt.finalize((errFin) => {
                    if (errFin) {
                        console.error('Error finalizing insert:', errFin.message);
                        return res.status(500).json({ error: errFin.message });
                    }
                    res.json({
                        message: 'success',
                        inserted: rows.length,
                        backupFile: backupFileName
                    });
                });
            });
        });
    } catch (error) {
        console.error('Import CSV error:', error);
        res.status(500).json({ error: 'Gagal memproses file CSV: ' + error.message });
    }
});



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


// --- API for SK Cuti ---

app.get('/api/sk-cuti', (req, res) => {
    dbSKCuti.all('SELECT * FROM sk_cuti ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": rows });
    });
});

app.get('/api/sk-cuti/:id', (req, res) => {
    dbSKCuti.get('SELECT * FROM sk_cuti WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(400).json({ "error": err.message });
        if (!row) return res.status(404).json({ "error": "Not found" });
        res.json({ "message": "success", "data": row });
    });
});

app.post('/api/sk-cuti', (req, res) => {
    const d = req.body;
    dbSKCuti.run(
        `INSERT INTO sk_cuti (cuti_nomor, cuti_createdate, cuti_tahun, cuti_alasan, cuti_startdate, cuti_enddate, cuti_daylong, pegawai_nama, pegawai_nip, pegawai_pangkat, pegawai_golongan, pegawai_jabatan, atasan_nama, atasan_nip, cuti_alamatcuti, cuti_nohp, pegawai_unitkerja, cuti_atasan_jabatan, pegawai_m_t, pegawai_m_b, cuti_tanggalmanual) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [d.cuti_nomor, d.cuti_createdate, d.cuti_tahun, d.cuti_alasan, d.cuti_startdate, d.cuti_enddate, d.cuti_daylong, d.pegawai_nama, d.pegawai_nip, d.pegawai_pangkat, d.pegawai_golongan, d.pegawai_jabatan, d.atasan_nama, d.atasan_nip, d.cuti_alamatcuti, d.cuti_nohp, d.pegawai_unitkerja, d.cuti_atasan_jabatan, d.pegawai_m_t, d.pegawai_m_b, d.cuti_tanggalmanual],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success", "data": { id: this.lastID } });
        }
    );
});

app.put('/api/sk-cuti/:id', (req, res) => {
    const d = req.body;
    dbSKCuti.run(
        `UPDATE sk_cuti SET cuti_nomor=?, cuti_createdate=?, cuti_tahun=?, cuti_alasan=?, cuti_startdate=?, cuti_enddate=?, cuti_daylong=?, pegawai_nama=?, pegawai_nip=?, pegawai_pangkat=?, pegawai_golongan=?, pegawai_jabatan=?, atasan_nama=?, atasan_nip=?, cuti_alamatcuti=?, cuti_nohp=?, pegawai_unitkerja=?, cuti_atasan_jabatan=?, pegawai_m_t=?, pegawai_m_b=?, cuti_tanggalmanual=? WHERE id=?`,
        [d.cuti_nomor, d.cuti_createdate, d.cuti_tahun, d.cuti_alasan, d.cuti_startdate, d.cuti_enddate, d.cuti_daylong, d.pegawai_nama, d.pegawai_nip, d.pegawai_pangkat, d.pegawai_golongan, d.pegawai_jabatan, d.atasan_nama, d.atasan_nip, d.cuti_alamatcuti, d.cuti_nohp, d.pegawai_unitkerja, d.cuti_atasan_jabatan, d.pegawai_m_t, d.pegawai_m_b, d.cuti_tanggalmanual, req.params.id],
        function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "success" });
        }
    );
});

app.delete('/api/sk-cuti/:id', (req, res) => {
    dbSKCuti.run('DELETE FROM sk_cuti WHERE id=?', [req.params.id], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success" });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
