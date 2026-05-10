const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const dbPegawai = require('./database_pegawai');
const dbSuratTugas = require('./database_surattugas');

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

app.get('/api/surat-tugas/generate/:id', (req, res) => {
    dbSuratTugas.get('SELECT * FROM surat_tugas WHERE id = ?', [req.params.id], (err, row) => {
        if (err || !row) return res.status(400).json({ "error": "Data not found" });
        dbSuratTugas.all('SELECT * FROM surat_tugas_pegawai WHERE surat_tugas_id = ?', [req.params.id], (err, pegawaiRows) => {
            if (err) return res.status(400).json({ "error": err.message });

            // Helper to get base64 image
            function getBase64Image(filename) {
                try {
                    const filePath = path.join(__dirname, 'public', filename);
                    const fileData = fs.readFileSync(filePath);
                    const extension = path.extname(filename).replace('.', '');
                    return `data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${fileData.toString('base64')}`;
                } catch (e) {
                    console.error(`Error reading ${filename}:`, e);
                    return '';
                }
            }

            const logoBase64 = getBase64Image('Kementerian_Agama_new_logo.png');
            const qrBase64 = getBase64Image('qr_st.png');
            const stampBase64 = getBase64Image('stampel.png');

            // Build pegawai table rows
            let pegawaiTableRows = '';
            for (let i = 0; i < pegawaiRows.length; i++) {
                const p = pegawaiRows[i];
                pegawaiTableRows += '<tr>'
                    + '<td style="text-align:center;vertical-align:top;padding:6px 8px;border:1px solid #000;">' + (i + 1) + '</td>'
                    + '<td style="vertical-align:top;padding:6px 8px;border:1px solid #000;">' + (p.nama || '') + '<br>' + (p.nip || '') + '</td>'
                    + '<td style="vertical-align:top;padding:6px 8px;border:1px solid #000;">' + (p.pangkat || '') + '<br>(' + (p.golongan || '') + ')</td>'
                    + '<td style="vertical-align:top;padding:6px 8px;border:1px solid #000;">' + (p.jabatan || '') + '</td>'
                    + '</tr>';
            }

            const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Surat Tugas - ${row.surat_nomor || ''}</title>
<style>
    @font-face {
        font-family: 'Arial';
        src: url('/Arial.ttf') format('truetype');
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: Arial, Helvetica, sans-serif;
        background: #e0e0e0;
        color: #000;
    }
    .page {
        width: 8.5in;
        min-height: 13in;
        margin: 20px auto;
        padding: 15mm 20mm 20mm 20mm;
        background: #fff;
        box-shadow: 0 2px 16px rgba(0,0,0,0.18);
        position: relative;
    }
    .no-print {
        text-align: center;
        padding: 16px;
        background: #333;
        color: #fff;
    }
    .no-print button {
        padding: 10px 28px;
        font-size: 15px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        margin: 0 6px;
    }
    .btn-print { background: #2196F3; color: #fff; }
    .btn-back { background: #777; color: #fff; }

    /* Header */
    .kop-surat {
        display: flex;
        align-items: center;
        border-bottom: 3px solid #000;
        padding-bottom: 8px;
        margin-bottom: 14px;
    }
    .kop-surat img { width: 70px; height: 70px; margin-right: 14px; }
    .kop-surat .kop-text { text-align: center; flex: 1; }
    .kop-surat .kop-text h2 { font-size: 14pt; margin-bottom: 1px; letter-spacing: 1px; }
    .kop-surat .kop-text h3 { font-size: 12pt; margin-bottom: 2px; }
    .kop-surat .kop-text p { font-size: 9pt; margin: 0; }

    /* Title */
    .title-section { text-align: center; margin: 18px 0 4px 0; }
    .title-section h3 { font-size: 13pt; font-weight:bold; letter-spacing: 1px; }
    .title-section p { font-size: 11pt; margin-top: 2px; }

    /* Content */
    .content { font-size: 11pt; line-height: 1.7; margin-top: 16px; }
    .content table.info-table td { vertical-align: top; padding: 2px 6px; }
    .content table.info-table td:first-child { width: 90px; }
    .content table.info-table td:nth-child(2) { width: 10px; text-align: center; }

    /* Pegawai Table */
    .memberi-tugas { text-align: center; font-weight: bold; font-size: 11pt; margin: 18px 0 6px 0; }
    .kepada { font-size: 11pt; margin-bottom: 4px; }
    table.pegawai-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 14px; }
    table.pegawai-table th { background: #f5f5f5; border: 1px solid #000; padding: 6px 8px; font-weight: bold; text-align: center; }

    /* Detail kegiatan */
    .detail-kegiatan { font-size: 11pt; line-height: 1.6; margin-bottom: 14px; }
    .detail-kegiatan table td { padding: 1px 6px; vertical-align: top; }
    .detail-kegiatan table td:first-child { width: 110px; }
    .detail-kegiatan table td:nth-child(2) { width: 10px; }

    /* Closing */
    .closing { font-size: 11pt; line-height: 1.7; margin-bottom: 20px; }

    /* Footer: QR + Signature */
    .footer-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 20px;
    }
    .qr-code img {
        width: 100px;
        height: 100px;
    }
    .signature-right {
        text-align: left;
        font-size: 11pt;
        line-height: 1.6;
        margin-right: 50px;
    }
    .signature-right .stamp-wrap {
        display: flex;
        justify-content: center;
    }
    .signature-right .stamp-wrap img {
        width: 220px;
        margin: -10px 0 1px -70px;
    }

    /* Print */
    @media print {
        body { background: #fff; }
        .no-print { display: none !important; }
        .page {
            width: 100%;
            margin: 0;
            padding: 15mm 20mm 20mm 20mm;
            box-shadow: none;
            min-height: auto;
        }
        @page {
            size: 8.5in 13in;
            margin: 0;
        }
    }
</style>
</head>
<body>

<div class="no-print">
    <button class="btn-back" onclick="history.back()">\u2190 Kembali</button>
    <button class="btn-print" onclick="window.print()">\uD83D\uDDA8\uFE0F Cetak / Simpan PDF</button>
</div>

<div class="page">
    <!-- KOP SURAT -->
    <div class="kop-surat">
        <img src="${logoBase64}" alt="Logo">
        <div class="kop-text">
            <h2>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
            <h3>KANTOR KEMENTERIAN AGAMA KOTA METRO</h3>
            <p>Jl. Ki. Arsyad No. 6 Metro Pusat Kota Metro 34111</p>
            <p>Telepon : (0725) 41828</p>
            <p>Laman: kemenagkotametro.id / Posel: mailkemenag.kotametro@gmail.com</p>
        </div>
    </div>

    <!-- JUDUL -->
    <div class="title-section">
        <h3>SURAT TUGAS</h3>
        <p>NOMOR: B- ${row.surat_nomor || '...'}/Kk.08.10.1/ KP.07.1/${row.surat_bulan || '...'}/${row.surat_tahun || '...'}</p>
    </div>

    <!-- MENIMBANG & DASAR -->
    <div class="content">
        <table class="info-table">
            <tr>
                <td>Menimbang</td>
                <td>:</td>
                <td>
                    a. bahwa dalam rangka ${row.kegiatan_nama || '...'}<br>
                    b. bahwa yang namanya tercantum dalam Surat Tugas ini dipandang mampu untuk melaksanakan tugas;<br>
                    c. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan b, maka perlu dibuatkan Surat Tugas Kepala Kantor Kementerian Agama Kota Metro.
                </td>
            </tr>
            <tr><td colspan="3" style="height:6px;"></td></tr>
            <tr>
                <td>Dasar</td>
                <td>:</td>
                <td>Surat ${row.dasar_pengirim || '...'} Nomor : ${row.dasar_nomor || '...'} tanggal ${formatDateID(row.dasar_tanggal)} Perihal ${row.dasar_perihal || '...'}</td>
            </tr>
        </table>
    </div>

    <!-- MEMBERI TUGAS -->
    <p class="memberi-tugas">Memberi Tugas</p>
    <p class="kepada">Kepada:</p>
    <table class="pegawai-table">
        <thead>
            <tr>
                <th style="width:40px;">No.</th>
                <th>Nama / NIP</th>
                <th>Pangkat / Golongan</th>
                <th>Jabatan</th>
            </tr>
        </thead>
        <tbody>
            ${pegawaiTableRows}
        </tbody>
    </table>

    <!-- DETAIL KEGIATAN -->
    <div class="detail-kegiatan">
        <p>Untuk mengikuti ${row.kegiatan_nama || '...'}, pada ;</p>
        <table>
            <tr><td>Hari, Tanggal</td><td>:</td><td>${formatDateID(row.kegiatan_haritanggal)}</td></tr>
            <tr><td>Waktu</td><td>:</td><td>${row.kegiatan_waktu || '...'} WIB </td></tr>
            <tr><td>Tempat</td><td>:</td><td>${row.kegiatan_tempat || '...'}</td></tr>
        </table>
    </div>

    <!-- PENUTUP -->
    <div class="closing">
        <p>Setelah selesai melaksanakan tugas agar melaporkan kepada Kepala Kantor Kementerian Agama Kota Metro.</p>
        <br>
        <p>Demikian surat tugas ini diberikan untuk dilaksanakan sebagaimana mestinya.</p>
    </div>

    <!-- QR + TANDA TANGAN -->
    <div class="footer-section">
        <div class="qr-code">
            <img src="${qrBase64}" alt="QR Code">
        </div>
        <div class="signature-right">
            <p>Metro, ${formatDateID(row.surat_tanggal)}</p>
            <p>Kepala</p>
            <div class="stamp-wrap"><img src="${stampBase64}" alt="Tandatangan"></div>
            <p>Abdul Haris</p>
        </div>
    </div>
</div>

</body>
</html>`;

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(html);
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
