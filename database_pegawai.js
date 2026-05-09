const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'pegawai.sqlite');

const dbPegawai = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening pegawai database', err.message);
    } else {
        console.log('Connected to the pegawai SQLite database.');
    }
});

module.exports = dbPegawai;
