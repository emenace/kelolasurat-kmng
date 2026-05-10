document.addEventListener('DOMContentLoaded', function () {
    var table;
    var allPegawai = [];

    // Form elements
    var form = document.getElementById('formSuratTugas');
    var idSurat = document.getElementById('id_surat');
    var suratNomor = document.getElementById('surat_nomor');
    var suratTanggal = document.getElementById('surat_tanggal');

    var dasarPengirim = document.getElementById('dasar_pengirim');
    var dasarNomor = document.getElementById('dasar_nomor');
    var dasarTanggal = document.getElementById('dasar_tanggal');
    var dasarPerihal = document.getElementById('dasar_perihal');

    var kegiatanNama = document.getElementById('kegiatan_nama');
    var kegiatanHariTanggal = document.getElementById('kegiatan_haritanggal');
    var kegiatanWaktu = document.getElementById('kegiatan_waktu');
    var kegiatanTempat = document.getElementById('kegiatan_tempat');

    var pegawaiContainer = document.getElementById('pegawai-container');
    var btnTambahPegawai = document.getElementById('btn-tambah-pegawai');
    var btnCancelEdit = document.getElementById('btn-cancel-edit');

    // Fetch Pegawai Data for Autocomplete
    fetch('/api/pegawai')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.message === "success") {
                allPegawai = data.data;
            }
        });

    // Auto load last nomor surat from surat_keluar
    function loadLastNomor() {
        fetch('/api/surat-keluar')
            .then(function (res) { return res.json(); })
            .then(function (response) {
                if (response.message === "success" && !idSurat.value) {
                    var maxNo = 0;
                    if (response.data && response.data.length > 0) {
                        response.data.forEach(function (row) {
                            var num = parseInt(row.nomor_urut);
                            if (!isNaN(num) && num > maxNo) {
                                maxNo = num;
                            }
                        });
                    }
                    suratNomor.placeholder = maxNo + 1;
                }
            });
    }
    loadLastNomor();

    // Dynamic Pegawai Row
    var rowCounter = 0;

    function createPegawaiRow(prefillData) {
        rowCounter++;
        var rowId = 'pegawai-row-' + rowCounter;

        var row = document.createElement('div');
        row.className = 'pegawai-row';
        row.id = rowId;

        var html = '';
        html += '<button type="button" class="btn btn-sm btn-danger btn-remove-row"><i class="bi bi-trash"></i></button>';
        html += '<div class="mb-2 position-relative">';
        html += '  <label class="form-label text-muted small mb-1">Cari Nama Pegawai</label>';
        html += '  <input type="text" class="form-control form-control-sm search-pegawai" placeholder="Ketik nama pegawai..." autocomplete="off">';
        html += '  <div class="autocomplete-results d-none" id="auto-' + rowId + '"></div>';
        html += '</div>';
        html += '<div class="row g-2">';
        html += '  <div class="col-md-6"><input type="text" class="form-control form-control-sm i-nama" placeholder="Nama" value="' + (prefillData ? prefillData.nama : '') + '"></div>';
        html += '  <div class="col-md-6"><input type="text" class="form-control form-control-sm i-nip" placeholder="NIP" value="' + (prefillData ? prefillData.nip : '') + '"></div>';
        html += '  <div class="col-md-4"><input type="text" class="form-control form-control-sm i-pangkat" placeholder="Pangkat" value="' + (prefillData ? prefillData.pangkat : '') + '"></div>';
        html += '  <div class="col-md-4"><input type="text" class="form-control form-control-sm i-golongan" placeholder="Gol/Ruang" value="' + (prefillData ? prefillData.golongan : '') + '"></div>';
        html += '  <div class="col-md-4"><input type="text" class="form-control form-control-sm i-jabatan" placeholder="Jabatan" value="' + (prefillData ? prefillData.jabatan : '') + '"></div>';
        html += '</div>';

        row.innerHTML = html;

        // Remove row button
        row.querySelector('.btn-remove-row').addEventListener('click', function () {
            row.remove();
        });

        // Autocomplete Logic
        var searchInput = row.querySelector('.search-pegawai');
        var autoContainer = row.querySelector('#auto-' + rowId);
        var iNama = row.querySelector('.i-nama');
        var iNip = row.querySelector('.i-nip');
        var iPangkat = row.querySelector('.i-pangkat');
        var iGolongan = row.querySelector('.i-golongan');
        var iJabatan = row.querySelector('.i-jabatan');

        searchInput.addEventListener('input', function () {
            var val = searchInput.value.toLowerCase();
            autoContainer.innerHTML = '';
            if (!val) {
                autoContainer.classList.add('d-none');
                return;
            }
            var matches = allPegawai.filter(function (p) {
                return p.NAMA && p.NAMA.toLowerCase().includes(val);
            });
            if (matches.length > 0) {
                autoContainer.classList.remove('d-none');
                matches.slice(0, 10).forEach(function (p) {
                    var div = document.createElement('div');
                    div.className = 'autocomplete-item';
                    div.innerHTML = '<strong>' + p.NAMA + '</strong> - ' + p["NIP BARU"];
                    div.addEventListener('click', function () {
                        iNama.value = p.NAMA || '';
                        iNip.value = p["NIP BARU"] || '';
                        iPangkat.value = p.Pangkat || '';
                        iGolongan.value = p["PANGKAT GOL/RUANG"] || '';
                        iJabatan.value = p.JABATAN || '';
                        searchInput.value = '';
                        autoContainer.classList.add('d-none');
                    });
                    autoContainer.appendChild(div);
                });
            } else {
                autoContainer.classList.add('d-none');
            }
        });

        // Hide autocomplete when clicking elsewhere
        document.addEventListener('click', function (e) {
            if (e.target !== searchInput) {
                autoContainer.classList.add('d-none');
            }
        });

        pegawaiContainer.appendChild(row);
    }

    btnTambahPegawai.addEventListener('click', function () {
        createPegawaiRow(null);
    });

    // Extract month as numeric (01-12) and year from date string
    function extractMonthYear(dateString) {
        if (!dateString) return { month: "", year: "" };
        var parts = dateString.split('-'); // YYYY-MM-DD
        return {
            month: parts[1] || '',
            year: parts[0] || ''
        };
    }

    // Submit Form
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var my = extractMonthYear(suratTanggal.value);
        var rows = pegawaiContainer.querySelectorAll('.pegawai-row');
        var pegawaiList = [];

        rows.forEach(function (r) {
            pegawaiList.push({
                nama: r.querySelector('.i-nama').value,
                nip: r.querySelector('.i-nip').value,
                pangkat: r.querySelector('.i-pangkat').value,
                golongan: r.querySelector('.i-golongan').value,
                jabatan: r.querySelector('.i-jabatan').value
            });
        });

        var payload = {
            surat_nomor: suratNomor.value,
            surat_tanggal: suratTanggal.value,
            surat_bulan: my.month,
            surat_tahun: my.year,
            dasar_pengirim: dasarPengirim.value,
            dasar_nomor: dasarNomor.value,
            dasar_tanggal: dasarTanggal.value,
            dasar_perihal: dasarPerihal.value,
            kegiatan_nama: kegiatanNama.value,
            kegiatan_haritanggal: kegiatanHariTanggal.value,
            kegiatan_waktu: kegiatanWaktu.value,
            kegiatan_tempat: kegiatanTempat.value,
            pegawai_jumlah: pegawaiList.length,
            pegawai: pegawaiList
        };

        var method = idSurat.value ? 'PUT' : 'POST';
        var url = idSurat.value ? '/api/surat-tugas/' + idSurat.value : '/api/surat-tugas';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.message === "success") {
                    alert("Data berhasil disimpan!");
                    form.reset();
                    idSurat.value = "";
                    pegawaiContainer.innerHTML = "";
                    btnCancelEdit.classList.add('d-none');
                    loadLastNomor();
                    loadTableData();
                } else {
                    alert("Gagal menyimpan data: " + data.error);
                }
            });
    });

    btnCancelEdit.addEventListener('click', function () {
        form.reset();
        idSurat.value = "";
        pegawaiContainer.innerHTML = "";
        btnCancelEdit.classList.add('d-none');
        loadLastNomor();
    });

    // Action formatter for table
    var actionFormatter = function (cell) {
        return '<div class="d-flex gap-1 justify-content-center">'
            + '<button class="btn btn-sm btn-primary btn-warning" title="Edit"><i class="bi bi-pencil"></i> Edit</button>'
            + '<button class="btn btn-sm btn-success btn-generate" title="Generate Dokumen"><i class="bi bi-printer-fill"></i> Cetak</button>'
            //+ '<button class="btn btn-sm btn-info btn-debug" title="Debug"><i class="bi bi-bug"></i></button>'
            + '<button class="btn btn-sm btn-danger btn-delete" title="Hapus"><i class="bi bi-trash"></i> Hapus</button>'
            + '</div>';
    };

    // Initialize Table
    table = new Tabulator("#table-surat-tugas", {
        layout: "fitData",
        pagination: "local",
        paginationSize: 10,
        placeholder: "Tidak ada data",
        columns: [
            //{ title: "No", formatter: "rownum", hozAlign: "center", width: 60, headerSort: false },
            { title: "Nomor Surat", field: "surat_nomor", sorter: "string", minWidth: 120 },
            { title: "Aksi", formatter: actionFormatter, hozAlign: "center", width: 280, headerSort: false },
            { title: "Nama Kegiatan", field: "kegiatan_nama", sorter: "string", minWidth: 200 },
            { title: "Tgl Kegiatan", field: "kegiatan_haritanggal", sorter: "string", minWidth: 120 },
            { title: "Jml Pegawai", field: "pegawai_jumlah", hozAlign: "center", minWidth: 100 }
        ],
        locale: "id",
        langs: {
            "id": {
                "pagination": { "first": "Pertama", "last": "Terakhir", "prev": "Sebelumnya", "next": "Selanjutnya", "all": "Semua" }
            }
        }
    });

    // Table click handler
    table.on("cellClick", function (e, cell) {
        var rowData = cell.getRow().getData();
        var action = e.target.closest('button');

        if (!action) return;

        if (action.classList.contains('btn-edit')) {
            fetch('/api/surat-tugas/' + rowData.id)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.message === "success") {
                        var d = data.data;
                        idSurat.value = d.id;
                        suratNomor.value = d.surat_nomor;
                        suratTanggal.value = d.surat_tanggal;
                        dasarPengirim.value = d.dasar_pengirim;
                        dasarNomor.value = d.dasar_nomor;
                        dasarTanggal.value = d.dasar_tanggal;
                        dasarPerihal.value = d.dasar_perihal;
                        kegiatanNama.value = d.kegiatan_nama;
                        kegiatanHariTanggal.value = d.kegiatan_haritanggal;
                        kegiatanWaktu.value = d.kegiatan_waktu;
                        kegiatanTempat.value = d.kegiatan_tempat || '';

                        pegawaiContainer.innerHTML = "";
                        if (d.pegawai) {
                            d.pegawai.forEach(function (p) { createPegawaiRow(p); });
                        }

                        btnCancelEdit.classList.remove('d-none');
                        window.scrollTo(0, 0);
                    }
                });
        } else if (action.classList.contains('btn-delete')) {
            if (confirm('Yakin ingin menghapus data ini?')) {
                fetch('/api/surat-tugas/' + rowData.id, { method: 'DELETE' })
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        if (data.message === "success") loadTableData();
                    });
            }
        } else if (action.classList.contains('btn-generate')) {
            window.open('/surat_tugas_generate.html?id=' + rowData.id, '_blank');
        } else if (action.classList.contains('btn-debug')) {
            fetch('/api/surat-tugas/' + rowData.id)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.message === "success") {
                        var d = data.data;
                        var msg = '=== DEBUG: Seluruh Variabel Tersimpan ===\n\n';
                        msg += '--- Data Surat ---\n';
                        msg += 'surat_nomor: ' + d.surat_nomor + '\n';
                        msg += 'surat_tanggal: ' + d.surat_tanggal + '\n';
                        msg += 'surat_bulan: ' + d.surat_bulan + '\n';
                        msg += 'surat_tahun: ' + d.surat_tahun + '\n\n';
                        msg += '--- Dasar Surat ---\n';
                        msg += 'dasar_pengirim: ' + d.dasar_pengirim + '\n';
                        msg += 'dasar_nomor: ' + d.dasar_nomor + '\n';
                        msg += 'dasar_tanggal: ' + d.dasar_tanggal + '\n';
                        msg += 'dasar_perihal: ' + d.dasar_perihal + '\n\n';
                        msg += '--- Detail Kegiatan ---\n';
                        msg += 'kegiatan_nama: ' + d.kegiatan_nama + '\n';
                        msg += 'kegiatan_haritanggal: ' + d.kegiatan_haritanggal + '\n';
                        msg += 'kegiatan_tempat: ' + d.kegiatan_tempat + '\n';
                        msg += 'kegiatan_waktu: ' + d.kegiatan_waktu + '\n\n';
                        msg += '--- Pegawai (jumlah: ' + d.pegawai_jumlah + ') ---\n';
                        if (d.pegawai && d.pegawai.length > 0) {
                            d.pegawai.forEach(function (p, idx) {
                                msg += '\nPegawai [' + (idx + 1) + ']:\n';
                                msg += '  nama: ' + p.nama + '\n';
                                msg += '  nip: ' + p.nip + '\n';
                                msg += '  pangkat: ' + p.pangkat + '\n';
                                msg += '  golongan: ' + p.golongan + '\n';
                                msg += '  jabatan: ' + p.jabatan + '\n';
                            });
                        } else {
                            msg += '(tidak ada data pegawai)\n';
                        }
                        alert(msg);
                    }
                });
        }
    });

    function loadTableData() {
        fetch('/api/surat-tugas')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.message === "success") table.setData(data.data);
            });
    }

    // Global Search
    var searchInputGlobal = document.getElementById("global-search");
    searchInputGlobal.addEventListener("input", function () {
        var term = searchInputGlobal.value;
        if (term === "") {
            table.clearFilter();
        } else {
            table.setFilter(function (data) {
                var matchSurat = data.surat_nomor && data.surat_nomor.toLowerCase().includes(term.toLowerCase());
                var matchKegiatan = data.kegiatan_nama && data.kegiatan_nama.toLowerCase().includes(term.toLowerCase());
                return matchSurat || matchKegiatan;
            });
        }
    });

    loadTableData();
});
