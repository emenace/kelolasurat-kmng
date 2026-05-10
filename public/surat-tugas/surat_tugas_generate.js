// Helper to format date
function formatDateID(dateStr) {
    if (!dateStr) return '...';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return day + ' ' + (months[monthIdx] || '') + ' ' + year;
}

// Function to trigger PDF download
window.downloadPDF = function(suratNomor) {
    const element = document.querySelector('.page');
    
    const originalPadding = element.style.padding;
    const originalMargin = element.style.margin;
    const originalBoxShadow = element.style.boxShadow;
    const originalWidth = element.style.width;
    const originalMinHeight = element.style.minHeight;

    element.style.padding = '0';
    element.style.margin = '0';
    element.style.boxShadow = 'none';
    element.style.width = '175.9mm';
    element.style.minHeight = 'auto';

    const opt = {
        margin: [10, 20, 20, 20],
        filename: `Surat_Tugas_${suratNomor || "Draft"}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: [215.9, 330.2], orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
        element.style.padding = originalPadding;
        element.style.margin = originalMargin;
        element.style.boxShadow = originalBoxShadow;
        element.style.width = originalWidth;
        element.style.minHeight = originalMinHeight;
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        document.getElementById('app').innerHTML = '<div style="text-align: center; margin-top: 50px;">Error: ID dokumen tidak ditemukan.</div>';
        return;
    }

    try {
        const response = await fetch(`/api/surat-tugas/${id}`);
        const result = await response.json();
        
        if (!response.ok || !result.data) {
            throw new Error(result.error || 'Data tidak ditemukan');
        }

        const row = result.data;
        const pegawaiRows = row.pegawai || [];

        let pegawaiTableRows = '';
        for (let i = 0; i < pegawaiRows.length; i++) {
            const p = pegawaiRows[i];
            pegawaiTableRows += '<tr>'
                + '<td style="text-align:center;vertical-align:top;padding:6px 8px;border:0.5px solid #000;">' + (i + 1) + '</td>'
                + '<td style="vertical-align:top;padding:6px 8px;border:0.5px solid #000;">' + (p.nama || '') + '<br>' + (p.nip || '') + '</td>'
                + '<td style="vertical-align:top;padding:6px 8px;border:0.5px solid #000;">' + (p.pangkat || '') + '<br>(' + (p.golongan || '') + ')</td>'
                + '<td style="vertical-align:top;padding:6px 8px;border:0.5px solid #000;">' + (p.jabatan || '') + '</td>'
                + '</tr>';
        }

        const htmlTemplate = `
<div class="no-print">
    <button class="btn-back" onclick="window.close()">&larr; Tutup</button>
    <button class="btn-print" onclick="downloadPDF('${row.surat_nomor}')">&darr; Download PDF</button>
    <button class="btn-print" style="background: #4CAF50;" onclick="window.print()">&#9113; Cetak (Browser)</button>
</div>

<div class="page">
    <!-- KOP SURAT -->
    <div class="kop-surat">
        <img src="../assets/Kementerian_Agama_new_logo.png" alt="Logo">
        <div class="kop-text">
            <h2>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
            <h3>KANTOR KEMENTERIAN AGAMA KOTA METRO</h3>
            <p>Jl. Ki. Arsyad No. 6 Metro Pusat Kota Metro 34111</p>
            <p>Telepon : (0725) 41828</p>
            <p>Laman: kemenagkotametro.id / Posel: mailkemenag.kotametro@gmail.com</p>
        </div>
    </div>

    <!-- JUDUL -->
    <div class="title-section">
        <h3>SURAT TUGAS</h3>
        <p>NOMOR: B- ${row.surat_nomor || '...'}/Kk.08.10.1/ KP.07.1/${row.surat_bulan || '...'}/${row.surat_tahun || '...'}</p>
    </div>

    <!-- MENIMBANG & DASAR -->
    <div class="content">
        <table class="info-table">
            <tr>
                <td>Menimbang</td>
                <td>:</td>
                <td>
                    a. bahwa dalam rangka ${row.kegiatan_nama || '...'}<br>
                    b. bahwa yang namanya tercantum dalam Surat Tugas ini dipandang mampu untuk melaksanakan tugas;<br>
                    c. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan b, maka perlu dibuatkan Surat Tugas Kepala Kantor Kementerian Agama Kota Metro.
                </td>
            </tr>
            <tr><td colspan="3" style="height:6px;"></td></tr>
            <tr>
                <td>Dasar</td>
                <td>:</td>
                <td>Surat ${row.dasar_pengirim || '...'} Nomor : ${row.dasar_nomor || '...'} tanggal ${formatDateID(row.dasar_tanggal)} Perihal ${row.dasar_perihal || '...'}</td>
            </tr>
        </table>
    </div>

    <!-- MEMBERI TUGAS -->
    <p class="memberi-tugas">Memberi Tugas</p>
    <p class="kepada">Kepada:</p>
    <table class="pegawai-table">
        <thead>
            <tr>
                <th style="width:40px;">No.</th>
                <th style="width:30%;">Nama / NIP</th>
                <th style="width:25%;">Pangkat / Golongan</th>
                <th style="width:40%;">Jabatan</th>
            </tr>
        </thead>
        <tbody>
            ${pegawaiTableRows}
        </tbody>
    </table>

    <!-- DETAIL KEGIATAN -->
    <div class="detail-kegiatan">
        <p>Untuk mengikuti ${row.kegiatan_nama || '...'}, pada ;</p>
        <table>
            <tr><td>Hari, Tanggal</td><td>:</td><td>${formatDateID(row.kegiatan_haritanggal)}</td></tr>
            <tr><td>Waktu</td><td>:</td><td>${row.kegiatan_waktu || '...'} WIB </td></tr>
            <tr><td>Tempat</td><td>:</td><td>${row.kegiatan_tempat || '...'}</td></tr>
        </table>
    </div>

    <!-- PENUTUP -->
    <div class="closing">
        <p>Setelah selesai melaksanakan tugas agar melaporkan kepada Kepala Kantor Kementerian Agama Kota Metro.</p>
        <br>
        <p>Demikian surat tugas ini diberikan untuk dilaksanakan sebagaimana mestinya.</p>
    </div>

    <!-- QR + TANDA TANGAN -->
    <div class="footer-section">
        <div class="qr-code">
            <img src="../assets/qr_st.png" alt="QR Code">
        </div>
        <div class="signature-right">
            <p>Metro, ${formatDateID(row.surat_tanggal)}</p>
            <p>Kepala</p>
            <div class="stamp-wrap"><img src="../assets/stampel.png" alt="Tandatangan"></div>
            <p>Abdul Haris</p>
        </div>
    </div>
</div>
        `;

        document.getElementById('app').innerHTML = htmlTemplate;

    } catch (error) {
        document.getElementById('app').innerHTML = `<div style="text-align: center; margin-top: 50px; color: red;">Error memuat dokumen: ${error.message}</div>`;
    }
});
