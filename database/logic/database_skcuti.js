const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/skcuti.sqlite');

const dbSKCuti = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening skcuti database', err.message);
    } else {
        console.log('Connected to the skcuti SQLite database.');

        dbSKCuti.run(`CREATE TABLE IF NOT EXISTS sk_cuti (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuti_nomor TEXT,
            cuti_createdate TEXT,
            cuti_tahun TEXT,
            cuti_alasan TEXT,
            cuti_startdate TEXT,
            cuti_enddate TEXT,
            cuti_daylong INTEGER,
            pegawai_nama TEXT,
            pegawai_nip TEXT,
            pegawai_pangkat TEXT,
            pegawai_golongan TEXT,
            pegawai_jabatan TEXT,
            atasan_nama TEXT,
            atasan_nip TEXT
        )`);
    }
});

module.exports = dbSKCuti;
