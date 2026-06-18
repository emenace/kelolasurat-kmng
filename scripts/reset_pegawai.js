const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/data/pegawai.sqlite');
const csvPath = path.resolve(__dirname, '../newdata.csv');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening db:', err);
        process.exit(1);
    }
});

function readCSV() {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(';');
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const rowData = lines[i].split(';');
        const row = {};
        headers.forEach((header, index) => {
            let val = rowData[index] || null;
            if (val !== null) {
                val = val.trim();
                // Check if FORMATTED NIP starts with '
                if (header.trim() === 'FORMATTED NIP' && val.startsWith("'")) {
                    val = val.substring(1);
                }
            }
            row[header.trim()] = val;
        });
        rows.push(row);
    }
    return rows;
}

db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS "DataPegawai"`);
    db.run(`CREATE TABLE "DataPegawai" (
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

    const data = readCSV();
    if (data.length > 0) {
        const stmt = db.prepare(`INSERT INTO "DataPegawai" VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        data.forEach(row => {
            stmt.run([
                row['NO'],
                row['NAMA'],
                row['NIP LAMA'],
                row['NIP BARU'],
                row['FORMATTED NIP'],
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
                row['KET']
            ]);
        });
        stmt.finalize();
        console.log(`Inserted ${data.length} rows into DataPegawai.`);
    } else {
        console.log("No data found in CSV to insert.");
    }
});

db.close();
