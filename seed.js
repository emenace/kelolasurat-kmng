const db = require('./database');

const today = new Date().toISOString().split('T')[0];
const yesterday = '2026-04-07'; // as requested by user

const suratKeluarDummy = [
    { nomor_urut: '001', tanggal_surat: today, nomor_surat: 'B-001/Kk.08/1/2026', asal_surat: 'Seksi Pendis', tujuan: 'Madrasah', isi_surat: 'Undangan Rapat KKM', keterangan: 'Penting' },
    { nomor_urut: '002', tanggal_surat: today, nomor_surat: 'B-002/Kk.08/2/2026', asal_surat: 'Seksi Bimas', tujuan: 'KUA Metro', isi_surat: 'Pembinaan Penyuluh', keterangan: 'Biasa' },
    { nomor_urut: '003', tanggal_surat: yesterday, nomor_surat: 'B-003/Kk.08/3/2026', asal_surat: 'Subbag TU', tujuan: 'Kanwil', isi_surat: 'Laporan Bulanan', keterangan: 'Rahasia' },
    { nomor_urut: '004', tanggal_surat: yesterday, nomor_surat: 'B-004/Kk.08/4/2026', asal_surat: 'Seksi PHU', tujuan: 'KBIHU', isi_surat: 'Sosialisasi Haji', keterangan: 'Segera' },
    { nomor_urut: '005', tanggal_surat: today, nomor_surat: 'B-005/Kk.08/5/2026', asal_surat: 'Penyelenggara Zawa', tujuan: 'BAZNAS', isi_surat: 'Koordinasi Zakat', keterangan: 'Biasa' }
];

const legalisirDummy = [
    { nomor_urut: '001', tanggal_surat: today, nomor_legalisir: 'L-001/Kk.08/1/2026', nama_nip: 'Ahmad / 198001012005011001', yang_menandatangani: 'Kepala Kantor', keterangan: 'Ijazah' },
    { nomor_urut: '002', tanggal_surat: today, nomor_legalisir: 'L-002/Kk.08/2/2026', nama_nip: 'Siti / 198502022010012002', yang_menandatangani: 'Kasubbag TU', keterangan: 'Piagam' },
    { nomor_urut: '003', tanggal_surat: yesterday, nomor_legalisir: 'L-003/Kk.08/3/2026', nama_nip: 'Budi / 199003032015031003', yang_menandatangani: 'Kasi Pendis', keterangan: 'Sertifikat Pendidik' },
    { nomor_urut: '004', tanggal_surat: yesterday, nomor_legalisir: 'L-004/Kk.08/4/2026', nama_nip: 'Dewi / 199204042018012004', yang_menandatangani: 'Kepala Kantor', keterangan: 'Buku Nikah' },
    { nomor_urut: '005', tanggal_surat: today, nomor_legalisir: 'L-005/Kk.08/5/2026', nama_nip: 'Joko / 198805052012121005', yang_menandatangani: 'Kasubbag TU', keterangan: 'SK PNS' }
];

db.serialize(() => {
    suratKeluarDummy.forEach(d => {
        db.run(`INSERT INTO surat_keluar (nomor_urut, tanggal_surat, nomor_surat, asal_surat, tujuan, isi_surat, keterangan) VALUES (?,?,?,?,?,?,?)`,
            [d.nomor_urut, d.tanggal_surat, d.nomor_surat, d.asal_surat, d.tujuan, d.isi_surat, d.keterangan]);
    });

    legalisirDummy.forEach(d => {
        db.run(`INSERT INTO legalisir (nomor_urut, tanggal_surat, nomor_legalisir, nama_nip, yang_menandatangani, keterangan) VALUES (?,?,?,?,?,?)`,
            [d.nomor_urut, d.tanggal_surat, d.nomor_legalisir, d.nama_nip, d.yang_menandatangani, d.keterangan]);
    });
    
    console.log('Dummy data inserted');
});
