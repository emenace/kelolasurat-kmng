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

// Helper to get year from date string
function getYear(dateStr) {
    if (!dateStr) return '...';
    return dateStr.split('-')[0] || '...';
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
    element.style.width = '175.9mm';
    element.style.minHeight = 'auto';

    const opt = {
        margin: [8, 15, 15, 15],
        filename: `Formulir_Cuti_${cutiNomor || "Draft"}.pdf`,
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

    <!-- HEADER -->
    <div class="header-block">
        <div>ANAK LAMPIRAN I.b</div>
        <div>PERATURAN BADAN KEPEGAWAIAN NEGARA</div>
        <div>REPUBLIK INDONESIA</div>
        <div>TENTANG</div>
        <div><b>TATA CARA PEMBERIAN CUTI PEGAWAI NEGERI SIPIL</b></div>
    </div>

    <!-- ADDRESS -->
    <div class="address-block">
        <div style="margin-left:72px;">Metro, ${formatDateID(d.cuti_createdate)}</div>
        <div style="margin-left:72px;">Kepada</div>
        <div style="margin-left:100px;">Yth. Kepala Kantor Kemenag Kota Metro</div>
        <div style="margin-left:100px;">Di Metro</div>
    </div>

    <!-- TITLE -->
    <div class="form-title">FORMULIR PERMINTAAN DAN PEMBERIAN CUTI</div>

    <!-- SECTION I: DATA PEGAWAI -->
    <table class="s-table">
        <colgroup>
            <col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%">
        </colgroup>
        <tr>
            <td colspan="4" class="sec-hdr">I. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DATA PEGAWAI</td>
        </tr>
        <tr>
            <td>NAMA</td>
            <td>${d.pegawai_nama || '...'}</td>
            <td>NIP</td>
            <td style="white-space: nowrap;">${d.pegawai_nip || '...'}</td>
        </tr>
        <tr>
            <td>JABATAN</td>
            <td>${d.pegawai_jabatan || '...'}</td>
            <td>MASA KERJA</td>
            <td style="white-space: nowrap;">${d.pegawai_m_t != null && d.pegawai_m_t !== '' ? d.pegawai_m_t : '0'} Tahun ${d.pegawai_m_b != null && d.pegawai_m_b !== '' ? d.pegawai_m_b : '0'} Bulan</td>
        </tr>
        <tr>
            <td colspan="4"><b>UNIT KERJA</b> &nbsp;&nbsp;${d.pegawai_unitkerja || '0'}</td>
        </tr>
    </table>

    <!-- SECTION II: JENIS CUTI YANG DIAMBIL -->
    <table class="s-table">
        <colgroup>
            <col style="width:50%"><col style="width:50%">
        </colgroup>
        <tr>
            <td colspan="2" class="sec-hdr">II. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JENIS CUTI YANG DIAMBIL**</td>
        </tr>
        <tr>
            <td>
                <table class="inner-tbl">
                    <tr><td style="width:20px;">1.</td><td>CUTI TAHUNAN</td><td style="width:30px; text-align:center; font-weight:bold;">V</td></tr>
                    <tr><td>3.</td><td>CUTI SAKIT</td><td></td></tr>
                    <tr><td>5.</td><td>CUTI ALASAN PENTING</td><td></td></tr>
                </table>
            </td>
            <td>
                <table class="inner-tbl">
                    <tr><td style="width:20px;">2.</td><td>CUTI BESAR</td></tr>
                    <tr><td>4.</td><td>CUTI MELAHIRKAN</td></tr>
                    <tr><td>6.</td><td>CUTI DILUAR TANGGUNGAN NEGARA</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- SECTION III: ALASAN CUTI -->
    <table class="s-table">
        <tr>
            <td class="sec-hdr">III. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ALASAN CUTI</td>
        </tr>
        <tr>
            <td style="min-height:25px; padding:5px 8px;">${d.cuti_alasan || '...'}</td>
        </tr>
    </table>

    <!-- SECTION IV: LAMANYA CUTI -->
    <table class="s-table">
        <colgroup>
            <col style="width:14%"><col style="width:16%"><col style="width:16%"><col style="width:20%"><col style="width:10%"><col style="width:24%">
        </colgroup>
        <tr>
            <td colspan="6" class="sec-hdr">IV. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LAMANYA CUTI</td>
        </tr>
        <tr>
            <td>Selama <b>${d.cuti_daylong || '...'}</b> Hari</td>
            <td>Hari/bulan/Tahun</td>
            <td>Mulai Tanggal</td>
            <td>${formatDateID(d.cuti_startdate)}</td>
            <td>s/d</td>
            <td>${formatDateID(d.cuti_enddate)}</td>
        </tr>
    </table>

    <!-- SECTION V: CATATAN CUTI -->
    <table class="s-table">
        <colgroup>
            <col style="width:10%"><col style="width:15%"><col style="width:25%"><col style="width:10%"><col style="width:40%">
        </colgroup>
        <tr>
            <td colspan="5" class="sec-hdr">V. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CATATAN CUTI***</td>
        </tr>
        <tr>
            <td colspan="3" style="padding:0;">
                <table class="inner-tbl-bordered">
                    <tr><td colspan="3" style="font-weight:bold; padding:2px 6px;">1. &nbsp; CUTI TAHUNAN</td></tr>
                    <tr>
                        <td style="width:30%; padding:2px 6px;">Tahun</td>
                        <td style="width:30%; padding:2px 6px;">Sisa</td>
                        <td style="padding:2px 6px;">Keterangan</td>
                    </tr>
                    <tr><td style="padding:2px 6px;">N-2</td><td style="padding:2px 6px;">&nbsp;</td><td style="padding:2px 6px;">&nbsp;</td></tr>
                    <tr><td style="padding:2px 6px;">N-1</td><td style="padding:2px 6px;">&nbsp;</td><td style="padding:2px 6px;">&nbsp;</td></tr>
                    <tr><td style="padding:2px 6px;">N</td><td style="padding:2px 6px;">&nbsp;</td><td style="padding:2px 6px;">&nbsp;</td></tr>
                </table>
            </td>
            <td colspan="2" style="padding:0; vertical-align:top;">
                <table class="inner-tbl-bordered">
                    <tr><td style="width:20px;">2.</td><td>CUTI BESAR</td></tr>
                    <tr><td>3.</td><td>CUTI SAKIT</td></tr>
                    <tr><td>4.</td><td>CUTI MELAHIRKAN</td></tr>
                    <tr><td>5.</td><td>CUTI KARENA ALASAN PENTING</td></tr>
                    <tr><td>6.</td><td>CUTI DILUAR TANGGUNGAN NEGARA</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- SECTION VI: ALAMAT SELAMA MENJALANKAN CUTI -->
    <table class="s-table">
        <colgroup>
            <col style="width:45%"><col style="width:15%"><col style="width:40%">
        </colgroup>
        <tr>
            <td colspan="3" class="sec-hdr">VI. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ALAMAT SELAMA MENJALANKAN CUTI</td>
        </tr>
        <tr>
            <td style="vertical-align:top;">${d.cuti_alamatcuti || '...'}</td>
            <td style="vertical-align:top;">TELPON</td>
            <td style="vertical-align:top;">${d.cuti_nohp || '...'}</td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td colspan="2" style="text-align:left; vertical-align:top; padding:5px 8px;">
                Hormat saya,<br><br><br><br><br>
                ${d.pegawai_nama || '...'}<br>
                NIP. ${d.pegawai_nip || '...'}
            </td>
        </tr>
    </table>

    <!-- SECTION VII: PERTIMBANGAN ATASAN LANGSUNG -->
    <table class="s-table">
        <colgroup>
            <col style="width:16.6%"><col style="width:16.7%"><col style="width:16.7%"><col style="width:50%">
        </colgroup>
        <tr>
            <td colspan="4" class="sec-hdr">VII. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PERTIMBANGAN ATASAN LANGSUNG</td>
        </tr>
        <tr>
            <td style="text-align:left;">DISETUJUI</td>
            <td style="text-align:left;">PERUBAHAN<br>****</td>
            <td style="text-align:left;">DITANGGUHKAN****</td>
            <td style="text-align:left;">TIDAK DISETUJUI****</td>
        </tr>
        <tr>
            <td style="height:30px;">&nbsp;V</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td style="height:30px;">&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td style="text-align:left; vertical-align:top; padding:5px 8px;">
                Atasan Langsung<br>
                ${d.cuti_atasan_jabatan || '...'}<br><br><br><br>
                ${d.atasan_nama || '...'}<br>
                NIP. ${d.atasan_nip || '...'}
            </td>
        </tr>
    </table>

    <!-- SECTION VIII: KEPUTUSAN PEJABAT -->
    <table class="s-table">
        <colgroup>
            <col style="width:16.6%"><col style="width:16.7%"><col style="width:16.7%"><col style="width:50%">
        </colgroup>
        <tr>
            <td colspan="4" class="sec-hdr">VIII. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;KEPUTUSAN PEJABAT YANG BERWENANG MEMBERIKAN CUTI</td>
        </tr>
        <tr>
            <td style="text-align:left;">DISETUJUI</td>
            <td style="text-align:left;">PERUBAHAN<br>****</td>
            <td style="text-align:left;">DITANGGUHKAN****</td>
            <td style="text-align:left;">TIDAK DISETUJUI****</td>
        </tr>
        <tr>
            <td style="height:30px;">&nbsp;V</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td style="height:30px;">&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td style="text-align:left; vertical-align:top; padding:5px 8px;">
                Kepala Kantor Kemenag Kota Metro,<br><br><br><br><br>
                H. ABDUL HARIS, S.Ag.,M.H.I.<br>
                NIP. 197311252000031001
            </td>
        </tr>
    </table>

    <!-- CATATAN -->
    <div class="catatan">
        <p>Catatan.</p>
        <p>* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Coret yang tidak perlu</p>
        <p>** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; pilih salah satu dengan memberikan tanda centang ( V )</p>
        <p>*** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Di isi oleh pejabat yang menangani bidang Kepegawaian sebelum PNS mengajukan Cuti</p>
        <p>N &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = Cuti Tahun Berjalan</p>
        <p>N-1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = sisa Cuti 1 tahun sebelumnya</p>
    </div>

</div>
        `;

        document.getElementById('app').innerHTML = htmlTemplate;

    } catch (error) {
        document.getElementById('app').innerHTML = `<div style="text-align: center; margin-top: 50px; color: red;">Error memuat dokumen: ${error.message}</div>`;
    }
});
