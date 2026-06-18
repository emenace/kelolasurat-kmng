const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/pegawai.sqlite');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPegawai = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening pegawai.sqlite:', err.message);
    } else {
        console.log('Connected to the pegawai.sqlite.');
        
        dbPegawai.run(`CREATE TABLE IF NOT EXISTS "DataPegawai" (
            "NO" INTEGER,
            "NAMA" TEXT,
            "NIP LAMA" TEXT,
            "NIP BARU" TEXT,
            "FORMATTED NIP" TEXT,
            "GOLRU" TEXT,
            "PANGKAT" TEXT,
            "TMT GOLRU" TEXT,
            "SATKER" TEXT,
            "JABATAN" TEXT,
            "TMT JABATAN" TEXT,
            "THN" INTEGER,
            "BLN" INTEGER,
            "PENDIDIKAN TERAKHIR" TEXT,
            "THN PENDIDIKAN" INTEGER,
            "JENIS PENDIDIKAN" TEXT,
            "TGL LAHIR" TEXT,
            "TMT PENSIUN" TEXT,
            "KET" TEXT
        )`);
    }
});

module.exports = dbPegawai;
