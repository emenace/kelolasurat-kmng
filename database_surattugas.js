const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'surattugas.sqlite');

const dbSuratTugas = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening surattugas database', err.message);
    } else {
        console.log('Connected to the surattugas SQLite database.');
        
        dbSuratTugas.serialize(() => {
            dbSuratTugas.run(`CREATE TABLE IF NOT EXISTS surat_tugas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                surat_nomor TEXT,
                surat_tanggal TEXT,
                surat_bulan TEXT,
                surat_tahun TEXT,
                dasar_pengirim TEXT,
                dasar_nomor TEXT,
                dasar_tanggal TEXT,
                dasar_perihal TEXT,
                kegiatan_nama TEXT,
                kegiatan_haritanggal TEXT,
                kegiatan_waktu TEXT,
                kegiatan_tempat TEXT,
                pegawai_jumlah INTEGER
            )`);
            
            // Migration: add kegiatan_tempat if not exists (for existing databases)
            dbSuratTugas.run(`ALTER TABLE surat_tugas ADD COLUMN kegiatan_tempat TEXT`, (err) => {
                // Ignore error if column already exists
            });
            
            dbSuratTugas.run(`CREATE TABLE IF NOT EXISTS surat_tugas_pegawai (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                surat_tugas_id INTEGER,
                nama TEXT,
                nip TEXT,
                pangkat TEXT,
                golongan TEXT,
                jabatan TEXT,
                FOREIGN KEY (surat_tugas_id) REFERENCES surat_tugas(id) ON DELETE CASCADE
            )`);
        });
    }
});

module.exports = dbSuratTugas;
