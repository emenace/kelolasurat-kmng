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
window.downloadPDF = function (cutiNomor) {
    const element = document.querySelector('.page');

    const originalPadding = element.style.padding;
    const originalMargin = element.style.margin;
    const originalBoxShadow = element.style.boxShadow;
    const originalWidth = element.style.width;
    const originalMinHeight = element.style.minHeight;

    element.style.padding = '0';
    element.style.margin = '0';
    element.style.boxShadow = 'none';
    element.style.width = '170mm';
    element.style.minHeight = 'auto';

    const opt = {
        margin: [10, 20, 20, 20],
        filename: `SK_Cuti_${cutiNomor || "Draft"}.pdf`,
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
        const response = await fetch(`/api/sk-cuti/${id}`);
        const result = await response.json();

        if (!response.ok || !result.data) {
            throw new Error(result.error || 'Data tidak ditemukan');
        }

        const d = result.data;

        const htmlTemplate = `
<div class="no-print">
    <button class="btn-back" onclick="window.close()">&larr; Tutup</button>
    <button class="btn-print" onclick="downloadPDF('${d.cuti_nomor}')">&darr; Download PDF</button>
    <button class="btn-print" style="background: #4CAF50;" onclick="window.print()">&#9113; Cetak (Browser)</button>
</div>

<div class="page">
    <!-- KOP SURAT -->
    <div class="kop-surat">
        <img src="../assets/Kementerian_Agama_new_logo.png" alt="Logo" style="width: 70px; height: 70px; margin-bottom: 8px;">
        <h2>KEPUTUSAN KEPALA KANTOR</h2>
        <h3>KEMENTERIAN AGAMA KOTA METRO</h3>
        <p class="nomor-line">Nomor : ${d.cuti_nomor || '...'} Tahun ${d.cuti_tahun || '...'}</p>
    </div>

    <!-- JUDUL -->
    <div class="title-section">TENTANG</div>
    <div class="subtitle-section">PEMBERIAN CUTI PEGAWAI NEGERI SIPIL</div>

    <div style="text-align:center; font-size:11pt; margin: 14px 0 6px 0; line-height:1.2;">
        DENGAN RAHMAT TUHAN YANG MAHA ESA<br>
        KEPALA KANTOR KEMENTERIAN AGAMA KOTA METRO
    </div>

    <!-- MENIMBANG -->
    <div class="content">
        <table class="info-table">
            <tr>
                <td>Menimbang</td>
                <td>:</td>
                <td>
                    a. Bahwa untuk memperlancar pelaksanaan pemberian cuti pegawai negeri sipil diperlukan surat keputusan Kepala Kantor Kementerian Agama Kota Metro;<br>
                    b. Bahwa pegawai negeri sipil yang yang namanya tercantum di bawah ini diberikan cuti tahunan sebagaimana huruf (a) diatas
                </td>
            </tr>
            <tr><td colspan="3" style="height:6px;"></td></tr>
            <tr>
                <td>Mengingat</td>
                <td>:</td>
                <td>
                    <div style="padding-left: 16px; text-indent: -16px;">1. Undang-undang Nomor 5 Tahun 2014 tentang aparatur sipil negara (lembaran negara Republik Indonesia tahun 2014 nomor 6, tambahan lembaran negara Republik Indonesia nomor 5494);</div>
                    <div style="padding-left: 16px; text-indent: -16px;">2. Peraturan Pemerintah Nomor 11 tahun 2017 tentang manajemen pegawai negeri sipil (lembaran negara Republik Indonesia tahun 2017 nomor 63, tambahan lembaran negara Republik Indonesia nomor 6037);</div>
                    <div style="padding-left: 16px; text-indent: -16px;">3. Peraturan badan kepegawaian negara nomor 7 Tahun 2021 tentang perubahan peraturan badan kepegawaian negara nomor 24 Tahun 2017 tentang tata cara pemberian cuti pegawai negeri sipil.</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- MEMUTUSKAN -->
    <div class="memutuskan">MEMUTUSKAN</div>

    <!-- MENETAPKAN -->
    <table class="menetapkan-table">
        <tr>
            <td>Menetapkan</td>
            <td>:</td>
            <td>KEPUTUSAN KEPALA KANTOR KEMENTERIAN AGAMA TENTANG PEMBERIAN CUTI PEGAWAI NEGERI SIPIL DI LINGKUNGAN KANTOR KEMENTERIAN AGAMA KOTA METRO</td>
        </tr>
        <tr>
            <td>KESATU</td>
            <td>:</td>
            <td>Memberikan cuti tahunan pegawai negeri sipil yang berada dalam lingkungan Kantor Kementerian Agama Kota Metro :
                <table class="kesatu-detail" style="margin-top: 3px;">
                    <tr><td>Nama</td><td>:</td><td>${d.pegawai_nama || '...'}</td></tr>
                    <tr><td>NIP</td><td>:</td><td>${d.pegawai_nip || '...'}</td></tr>
                    <tr><td>Pangkat/Golongan</td><td>:</td><td>${d.pegawai_pangkat || '...'} (${d.pegawai_golongan || '...'})</td></tr>
                    <tr><td>Lama Cuti</td><td>:</td><td>${d.cuti_daylong || '...'} hari</td></tr>
                    <tr><td>Tanggal</td><td>:</td><td>${formatDateID(d.cuti_startdate)} s.d ${formatDateID(d.cuti_enddate)}</td></tr>
                </table>
            </td>
        </tr>
        <tr><td colspan="3" style="height:3px;"></td></tr>
        <tr>
            <td>KEDUA</td>
            <td>:</td>
            <td>Keputusan ini mulai berlaku pada tanggal ditetapkan dan apabila ada kekeliruan akan dibetulkan kembali;</td>
        </tr>
        <tr><td colspan="3" style="height:3px;"></td></tr>
        <tr>
            <td>KETIGA</td>
            <td>:</td>
            <td>Keputusan ini disampaikan kepada yang bersangkutan untuk dilaksanakan sebagaimana mestinya.</td>
        </tr>
    </table>

    <!-- TANDA TANGAN -->
    <div class="footer-section">
        <div class="sign-block">
            <p>Ditetapkan di &nbsp;&nbsp; : Kota Metro</p>
            <p>Pada Tanggal &nbsp;&nbsp;&nbsp; : ${formatDateID(d.cuti_createdate)}</p>
            <p>Kepala,</p>
            <div class="stamp-wrap"><img src="../assets/stampel.png" alt="Tandatangan"></div>
            <p>Abdul Haris</p>
        </div>
    </div>

    <!-- TEMBUSAN -->
    <div class="tembusan">
        <p>Tembusan:</p>
        <ol>
            <li>KPPN Kota Metro</li>
            <li>Yang Bersangkutan </li>
        </ol>
    </div>
</div>
        `;

        document.getElementById('app').innerHTML = htmlTemplate;

    } catch (error) {
        document.getElementById('app').innerHTML = `<div style="text-align: center; margin-top: 50px; color: red;">Error memuat dokumen: ${error.message}</div>`;
    }
});
