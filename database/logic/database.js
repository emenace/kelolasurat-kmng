const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/database.sqlite');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database.sqlite:', err.message);
    } else {
        console.log('Connected to the database.sqlite.');
        
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS surat_keluar (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nomor_urut TEXT,
                tanggal_surat DATE,
                nomor_surat TEXT,
                asal_surat TEXT,
                tujuan TEXT,
                isi_surat TEXT,
                keterangan TEXT
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS legalisir (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nomor_urut TEXT,
                tanggal_surat DATE,
                nomor_legalisir TEXT,
                nama_nip TEXT,
                yang_menandatangani TEXT,
                keterangan TEXT
            )`);
        });
    }
});

module.exports = db;
