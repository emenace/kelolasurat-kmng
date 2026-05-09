// Test script to debug docxtemplater rendering
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const content = fs.readFileSync(path.resolve(__dirname, 'template_dynamic.docx'), 'binary');
const zip = new PizZip(content);

try {
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    // Print all tags the template expects
    // Use the inspectModule pattern
    const InspectModule = require('docxtemplater/js/inspect-module.js');
} catch(e) {
    // ignore if InspectModule not available
}

// Try rendering with minimal test data
try {
    const doc = new Docxtemplater(new PizZip(content), {
        paragraphLoop: true,
        linebreaks: true,
    });
    doc.render({
        surat_nomor: "123",
        surat_tanggal: "2026-05-10",
        surat_bulan: "Mei",
        surat_tahun: "2026",
        dasar_pengirim: "Test Pengirim",
        dasar_nomor: "456",
        dasar_tanggal: "2026-05-01",
        dasar_perihal: "Test Perihal",
        kegiatan_nama: "Test Kegiatan",
        kegiatan_haritanggal: "2026-05-15",
        kegiatan_waktu: "08:00",
        kegiatan_tempat: "",
        pegawai: [
            { nama: "Test Nama", nip: "123456", pangkat: "Penata", golongan: "III/c", jabatan: "Staf" }
        ]
    });
    console.log("SUCCESS: Template rendered without errors!");
} catch(e) {
    console.error("RENDER ERROR:", e.message);
    if (e.properties && e.properties.errors) {
        e.properties.errors.forEach(function(err) {
            console.error("  - Template error:", JSON.stringify(err.properties, null, 2));
        });
    }
}
