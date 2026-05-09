const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

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

// --- API for Surat Tugas ---

app.get('/api/surat-tugas/last-nomor', (req, res) => {
    db.get('SELECT nomor_urut FROM surat_keluar ORDER BY CAST(nomor_urut AS INTEGER) DESC LIMIT 1', [], (err, row) => {
        if (err) {
            return res.status(400).json({"error": err.message});
        }
        let nextNumber = 1;
        if (row && row.nomor_urut) {
            nextNumber = parseInt(row.nomor_urut) + 1;
            if (isNaN(nextNumber)) nextNumber = 1;
        }
        res.json({"message": "success", "data": { nextNumber }});
    });
});

app.get('/api/surat-tugas', (req, res) => {
    dbSuratTugas.all('SELECT * FROM surat_tugas ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(400).json({"error": err.message});
        res.json({"message": "success", "data": rows});
    });
});

app.get('/api/surat-tugas/:id', (req, res) => {
    dbSuratTugas.get('SELECT * FROM surat_tugas WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(400).json({"error": err.message});
        if (!row) return res.status(404).json({"error": "Not found"});
        dbSuratTugas.all('SELECT * FROM surat_tugas_pegawai WHERE surat_tugas_id = ?', [req.params.id], (err, pegawaiRows) => {
            if (err) return res.status(400).json({"error": err.message});
            row.pegawai = pegawaiRows;
            res.json({"message": "success", "data": row});
        });
    });
});

app.post('/api/surat-tugas', (req, res) => {
    const data = req.body;
    dbSuratTugas.run(
        `INSERT INTO surat_tugas (surat_nomor, surat_tanggal, surat_bulan, surat_tahun, dasar_pengirim, dasar_nomor, dasar_tanggal, dasar_perihal, kegiatan_nama, kegiatan_haritanggal, kegiatan_waktu, pegawai_jumlah) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [data.surat_nomor, data.surat_tanggal, data.surat_bulan, data.surat_tahun, data.dasar_pengirim, data.dasar_nomor, data.dasar_tanggal, data.dasar_perihal, data.kegiatan_nama, data.kegiatan_haritanggal, data.kegiatan_waktu, data.pegawai_jumlah],
        function(err) {
            if (err) return res.status(400).json({"error": err.message});
            const suratId = this.lastID;
            if (data.pegawai && data.pegawai.length > 0) {
                const stmt = dbSuratTugas.prepare(`INSERT INTO surat_tugas_pegawai (surat_tugas_id, nama, nip, pangkat, golongan, jabatan) VALUES (?,?,?,?,?,?)`);
                data.pegawai.forEach(p => {
                    stmt.run([suratId, p.nama, p.nip, p.pangkat, p.golongan, p.jabatan]);
                });
                stmt.finalize();
            }
            res.json({"message": "success", "data": { id: suratId }});
        }
    );
});

app.put('/api/surat-tugas/:id', (req, res) => {
    const data = req.body;
    const id = req.params.id;
    dbSuratTugas.run(
        `UPDATE surat_tugas SET surat_nomor=?, surat_tanggal=?, surat_bulan=?, surat_tahun=?, dasar_pengirim=?, dasar_nomor=?, dasar_tanggal=?, dasar_perihal=?, kegiatan_nama=?, kegiatan_haritanggal=?, kegiatan_waktu=?, pegawai_jumlah=? WHERE id=?`,
        [data.surat_nomor, data.surat_tanggal, data.surat_bulan, data.surat_tahun, data.dasar_pengirim, data.dasar_nomor, data.dasar_tanggal, data.dasar_perihal, data.kegiatan_nama, data.kegiatan_haritanggal, data.kegiatan_waktu, data.pegawai_jumlah, id],
        function(err) {
            if (err) return res.status(400).json({"error": err.message});
            dbSuratTugas.run('DELETE FROM surat_tugas_pegawai WHERE surat_tugas_id=?', [id], (err) => {
                if (err) return res.status(400).json({"error": err.message});
                if (data.pegawai && data.pegawai.length > 0) {
                    const stmt = dbSuratTugas.prepare(`INSERT INTO surat_tugas_pegawai (surat_tugas_id, nama, nip, pangkat, golongan, jabatan) VALUES (?,?,?,?,?,?)`);
                    data.pegawai.forEach(p => {
                        stmt.run([id, p.nama, p.nip, p.pangkat, p.golongan, p.jabatan]);
                    });
                    stmt.finalize();
                }
                res.json({"message": "success"});
            });
        }
    );
});

app.delete('/api/surat-tugas/:id', (req, res) => {
    dbSuratTugas.run('DELETE FROM surat_tugas WHERE id=?', [req.params.id], function(err) {
        if (err) return res.status(400).json({"error": err.message});
        res.json({"message": "success"});
    });
});

// Helper: merge split text runs in Word XML so that template tags like
// {pegawai.nama[1]} that Word splits across multiple <w:t> elements
// become single continuous strings we can find-and-replace.
function mergeDocxTextRuns(xml) {
    // This regex finds sequences of </w:t></w:r><w:r ...><w:rPr>...</w:rPr><w:t ...>
    // and merges them into a single text run, preserving only the first run's formatting.
    // We do multiple passes to handle deeply split tags.
    for (let i = 0; i < 10; i++) {
        const before = xml;
        xml = xml.replace(
            /(<w:t[^>]*>)([^<]*)<\/w:t><\/w:r>(?:<w:proofErr[^\/]*\/>)*<w:r[^>]*><w:rPr>[^]*?<\/w:rPr><w:t[^>]*>([^<]*)/g,
            '$1$2$3'
        );
        if (xml === before) break;
    }
    return xml;
}

app.get('/api/surat-tugas/generate/:id', (req, res) => {
    dbSuratTugas.get('SELECT * FROM surat_tugas WHERE id = ?', [req.params.id], (err, row) => {
        if (err || !row) return res.status(400).json({"error": "Data not found"});
        dbSuratTugas.all('SELECT * FROM surat_tugas_pegawai WHERE surat_tugas_id = ?', [req.params.id], (err, pegawaiRows) => {
            if (err) return res.status(400).json({"error": err.message});

            try {
                // Read ORIGINAL template
                const content = fs.readFileSync(path.resolve(__dirname, 'template.docx'));
                const zip = new PizZip(content);
                let xml = zip.file('word/document.xml').asText();

                // Step 1: Merge split text runs
                xml = mergeDocxTextRuns(xml);

                // Step 2: Find the table row (<w:tr>) containing {pegawai.nama[1]}
                // and duplicate it for each employee
                const rowRegex = /(<w:tr\b[^>]*>)([\s\S]*?{pegawai\.nama\[1\]}[\s\S]*?)(<\/w:tr>)/;
                const rowMatch = xml.match(rowRegex);

                if (rowMatch) {
                    const templateRow = rowMatch[0]; // Full <w:tr>...</w:tr>

                    // Also find and remove the [2] row if it exists
                    const row2Regex = /<w:tr\b[^>]*>[\s\S]*?{pegawai\.nama\[2\]}[\s\S]*?<\/w:tr>/;
                    xml = xml.replace(row2Regex, '');

                    // Build replacement rows for each employee
                    let allRows = '';
                    for (let i = 0; i < pegawaiRows.length; i++) {
                        let r = templateRow;
                        const p = pegawaiRows[i];
                        // Replace [1] tags with this employee's data
                        r = r.replace(/\{pegawai\.nama\[1\]\}/g, p.nama || '');
                        r = r.replace(/\{pegawai\.nip\[1\]\}/g, p.nip || '');
                        r = r.replace(/\{pegawai\.pangkat\[1\]\}/g, p.pangkat || '');
                        r = r.replace(/\{pegawai\.golongan\[1\]\}/g, p.golongan || '');
                        r = r.replace(/\{pegawai\.jabatan\[1\]\}/g, p.jabatan || '');
                        // Replace "1." numbering with actual number
                        r = r.replace(/>1\.\s*</g, '>' + (i + 1) + '. <');
                        allRows += r;
                    }

                    // Replace original [1] row with all generated rows
                    xml = xml.replace(rowRegex, allRows);
                } else {
                    // Fallback: if no row pattern found, just do flat replacements
                    for (let i = 0; i < pegawaiRows.length; i++) {
                        const idx = i + 1;
                        const p = pegawaiRows[i];
                        xml = xml.replace(new RegExp('\\{pegawai\\.nama\\[' + idx + '\\]\\}', 'g'), p.nama || '');
                        xml = xml.replace(new RegExp('\\{pegawai\\.nip\\[' + idx + '\\]\\}', 'g'), p.nip || '');
                        xml = xml.replace(new RegExp('\\{pegawai\\.pangkat\\[' + idx + '\\]\\}', 'g'), p.pangkat || '');
                        xml = xml.replace(new RegExp('\\{pegawai\\.golongan\\[' + idx + '\\]\\}', 'g'), p.golongan || '');
                        xml = xml.replace(new RegExp('\\{pegawai\\.jabatan\\[' + idx + '\\]\\}', 'g'), p.jabatan || '');
                    }
                }

                // Step 3: Replace other simple variables
                xml = xml.replace(/\{surat_nomor\}/g, row.surat_nomor || '');
                xml = xml.replace(/\{surat_tanggal\}/g, row.surat_tanggal || '');
                xml = xml.replace(/\{surat_bulan\}/g, row.surat_bulan || '');
                xml = xml.replace(/\{surat_tahun\}/g, row.surat_tahun || '');
                xml = xml.replace(/\{dasar_pengirim\}/g, row.dasar_pengirim || '');
                xml = xml.replace(/\{dasar_nomor\}/g, row.dasar_nomor || '');
                xml = xml.replace(/\{dasar_tanggal\}/g, row.dasar_tanggal || '');
                xml = xml.replace(/\{dasar_perihal\}/g, row.dasar_perihal || '');
                xml = xml.replace(/\{kegiatan_nama\}/g, row.kegiatan_nama || '');
                xml = xml.replace(/\{kegiatan_haritanggal\}/g, row.kegiatan_haritanggal || '');
                xml = xml.replace(/\{kegiatan_waktu\}/g, row.kegiatan_waktu || '');
                xml = xml.replace(/\{kegiatan_tempat\}/g, row.kegiatan_tempat || '');
                xml = xml.replace(/\{pegawai_jumlah\}/g, String(row.pegawai_jumlah || pegawaiRows.length));

                // Step 4: Clean up any remaining unfilled pegawai placeholders
                xml = xml.replace(/\{pegawai\.\w+\[\d+\]\}/g, '');

                // Step 5: Write back and send
                zip.file('word/document.xml', xml);
                const buf = zip.generate({ type: 'nodebuffer' });

                res.setHeader('Content-Disposition', `attachment; filename="Surat_Tugas_${row.surat_nomor || row.id}.docx"`);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                res.send(buf);
            } catch (e) {
                console.error('Generate error:', e);
                res.status(500).json({"error": "Failed to generate document: " + e.message});
            }
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
