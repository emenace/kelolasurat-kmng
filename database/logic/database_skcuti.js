const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../data/skcuti.sqlite');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbSKCuti = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening skcuti.sqlite:', err.message);
    } else {
        console.log('Connected to the skcuti.sqlite.');

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
            atasan_nip TEXT,
            cuti_alamatcuti TEXT,
            cuti_nohp TEXT,
            pegawai_unitkerja TEXT,
            cuti_atasan_jabatan TEXT,
            pegawai_m_t TEXT,
            pegawai_m_b TEXT
        )`);

        // Add new columns to existing databases (safe to call multiple times)
        const newColumns = [
            'cuti_alamatcuti TEXT',
            'cuti_nohp TEXT',
            'pegawai_unitkerja TEXT',
            'cuti_atasan_jabatan TEXT',
            'pegawai_m_t TEXT',
            'pegawai_m_b TEXT'
        ];
        newColumns.forEach(col => {
            dbSKCuti.run(`ALTER TABLE sk_cuti ADD COLUMN ${col}`, () => {});
        });
    }
});

module.exports = dbSKCuti;
