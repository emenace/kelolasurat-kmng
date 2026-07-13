const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/data/pegawai.sqlite');
const csvPath = path.resolve(__dirname, '../JULI DUK.csv');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening db:', err);
        process.exit(1);
    }
});

/**
 * Parse CSV that may contain multiline quoted fields.
 * Delimiter is semicolon (;).
 */
function readCSV() {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    // Normalize line endings
    const normalized = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Parse CSV respecting quoted fields (which may contain newlines)
    const records = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < normalized.length; i++) {
        const ch = normalized[i];
        if (ch === '"') {
            if (inQuotes && i + 1 < normalized.length && normalized[i + 1] === '"') {
                // Escaped quote
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

    if (records.length < 2) return [];

    const headers = records[0].split(';').map(h => h.trim());
    console.log('CSV Headers found:', headers);

    const rows = [];
    for (let i = 1; i < records.length; i++) {
        const rowData = records[i].split(';');
        const row = {};
        headers.forEach((header, index) => {
            let val = rowData[index] || null;
            if (val !== null) {
                val = val.trim();
                // Remove surrounding quotes if any
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.substring(1, val.length - 1);
                }
                // Clean up multiline names - replace newlines with space
                val = val.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            }
            row[header] = val;
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
            // Map CSV columns to DB columns
            // CSV has: NO, NAMA, NIP LAMA, NIP BARU, GOLRU, PANGKAT, TMT GOLRU, SATKER, JABATAN, TMT JABATAN, THN, BLN, PENDIDIKAN TERAKHIR, THN PENDIDIKAN, JENIS PENDIDIKAN, TGL LAHIR, TAHUN PENSIUN, TMT PENSIUN, KET.
            // DB needs: NO, NAMA, NIP LAMA, NIP BARU, FORMATTED NIP, GOLRU, PANGKAT, TMT GOLRU, SATKER, JABATAN, TMT JABATAN, THN, BLN, PENDIDIKAN TERAKHIR, THN PENDIDIKAN, JENIS PENDIDIKAN, TGL LAHIR, TMT PENSIUN, KET

            // FORMATTED NIP is auto-generated from NIP BARU
            const formattedNip = row['NIP BARU'] || '';

            // KET might be "KET." in CSV
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
        stmt.finalize();
        console.log(`Inserted ${data.length} rows into DataPegawai.`);
    } else {
        console.log("No data found in CSV to insert.");
    }
});

db.close();
