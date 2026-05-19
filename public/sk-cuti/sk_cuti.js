document.addEventListener('DOMContentLoaded', function () {
    var table;
    var allPegawai = [];

    // Form elements
    var form = document.getElementById('formSKCuti');
    var idCuti = document.getElementById('id_cuti');
    var cutiNomor = document.getElementById('cuti_nomor');
    var cutiCreatedate = document.getElementById('cuti_createdate');
    var cutiAlasan = document.getElementById('cuti_alasan');
    var cutiStartdate = document.getElementById('cuti_startdate');
    var cutiEnddate = document.getElementById('cuti_enddate');
    var cutiDaylong = document.getElementById('cuti_daylong');
    var cutiAlamatcuti = document.getElementById('cuti_alamatcuti');
    var cutiNohp = document.getElementById('cuti_nohp');
    var pegawaiUnitkerja = document.getElementById('pegawai_unitkerja');
    var cutiAtasanJabatan = document.getElementById('cuti_atasan_jabatan');

    var pegawaiNama = document.getElementById('pegawai_nama');
    var pegawaiNip = document.getElementById('pegawai_nip');
    var pegawaiPangkat = document.getElementById('pegawai_pangkat');
    var pegawaiGolongan = document.getElementById('pegawai_golongan');
    var pegawaiJabatan = document.getElementById('pegawai_jabatan');
    var pegawaiMT = document.getElementById('pegawai_m_t');
    var pegawaiMB = document.getElementById('pegawai_m_b');

    var atasanNama = document.getElementById('atasan_nama');
    var atasanNip = document.getElementById('atasan_nip');

    var btnCancelEdit = document.getElementById('btn-cancel-edit');

    // Set default date to today
    cutiCreatedate.valueAsDate = new Date();

    // Enable Bootstrap validation styling
    form.classList.add('needs-validation');
    form.setAttribute('novalidate', '');

    // Fetch Pegawai Data for Autocomplete
    fetch('/api/pegawai')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.message === "success") {
                allPegawai = data.data;
            }
        });

    // Load last nomor SK Cuti
    function loadLastNomor() {
        fetch('/api/sk-cuti')
            .then(function (res) { return res.json(); })
            .then(function (response) {
                if (response.message === "success" && !idCuti.value) {
                    var maxNo = 0;
                    if (response.data && response.data.length > 0) {
                        response.data.forEach(function (row) {
                            var num = parseInt(row.cuti_nomor);
                            if (!isNaN(num) && num > maxNo) {
                                maxNo = num;
                            }
                        });
                    }
                    cutiNomor.placeholder = maxNo + 1;
                }
            });
    }
    loadLastNomor();

    // --- Autocomplete: Pegawai ---
    var searchPegawai = document.getElementById('search_pegawai');
    var autoPegawai = document.getElementById('auto-pegawai');
    var pegawaiInfoBox = document.getElementById('pegawai-info-box');

    searchPegawai.addEventListener('input', function () {
        var val = searchPegawai.value.toLowerCase();
        autoPegawai.innerHTML = '';
        if (!val) { autoPegawai.classList.add('d-none'); return; }
        var matches = allPegawai.filter(function (p) {
            return p.NAMA && p.NAMA.toLowerCase().includes(val);
        });
        if (matches.length > 0) {
            autoPegawai.classList.remove('d-none');
            matches.slice(0, 10).forEach(function (p) {
                var div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.innerHTML = '<strong>' + p.NAMA + '</strong> - ' + p["NIP BARU"];
                div.addEventListener('click', function () {
                    pegawaiNama.value = p.NAMA || '';
                    pegawaiNip.value = p["NIP BARU"] || '';
                    pegawaiPangkat.value = p.Pangkat || '';
                    pegawaiGolongan.value = p["PANGKAT GOL/RUANG"] || '';
                    pegawaiJabatan.value = p.JABATAN || '';
                    pegawaiMT.value = p["MASA KERJA THN"] || '';
                    pegawaiMB.value = p["BLN"] || '';

                    document.getElementById('display_nama').textContent = p.NAMA || '-';
                    document.getElementById('display_nip').textContent = p["NIP BARU"] || '-';
                    document.getElementById('display_pangkat').textContent = p.Pangkat || '-';
                    document.getElementById('display_golongan').textContent = p["PANGKAT GOL/RUANG"] || '-';
                    document.getElementById('display_jabatan').textContent = p.JABATAN || '-';

                    pegawaiInfoBox.classList.remove('d-none');
                    searchPegawai.value = '';
                    autoPegawai.classList.add('d-none');
                });
                autoPegawai.appendChild(div);
            });
        } else {
            autoPegawai.classList.add('d-none');
        }
    });

    // --- Autocomplete: Atasan Langsung ---
    var searchAtasan = document.getElementById('search_atasan');
    var autoAtasan = document.getElementById('auto-atasan');
    var atasanInfoBox = document.getElementById('atasan-info-box');

    searchAtasan.addEventListener('input', function () {
        var val = searchAtasan.value.toLowerCase();
        autoAtasan.innerHTML = '';
        if (!val) { autoAtasan.classList.add('d-none'); return; }
        var matches = allPegawai.filter(function (p) {
            return p.NAMA && p.NAMA.toLowerCase().includes(val);
        });
        if (matches.length > 0) {
            autoAtasan.classList.remove('d-none');
            matches.slice(0, 10).forEach(function (p) {
                var div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.innerHTML = '<strong>' + p.NAMA + '</strong> - ' + p["NIP BARU"];
                div.addEventListener('click', function () {
                    atasanNama.value = p.NAMA || '';
                    atasanNip.value = p["NIP BARU"] || '';

                    document.getElementById('display_atasan_nama').textContent = p.NAMA || '-';
                    document.getElementById('display_atasan_nip').textContent = p["NIP BARU"] || '-';

                    atasanInfoBox.classList.remove('d-none');
                    searchAtasan.value = '';
                    autoAtasan.classList.add('d-none');
                });
                autoAtasan.appendChild(div);
            });
        } else {
            autoAtasan.classList.add('d-none');
        }
    });

    // Hide autocomplete when clicking elsewhere
    document.addEventListener('click', function (e) {
        if (e.target !== searchPegawai) autoPegawai.classList.add('d-none');
        if (e.target !== searchAtasan) autoAtasan.classList.add('d-none');
    });

    // Auto-calculate lama cuti
    function calcDaylong() {
        var start = cutiStartdate.value;
        var end = cutiEnddate.value;
        if (start && end) {
            var diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
            if (diff > 0) cutiDaylong.value = diff;
        }
    }
    cutiStartdate.addEventListener('change', calcDaylong);
    cutiEnddate.addEventListener('change', calcDaylong);

    // Submit Form
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Bootstrap validation
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        var tahun = '';
        if (cutiCreatedate.value) {
            tahun = cutiCreatedate.value.split('-')[0] || '';
        }

        var payload = {
            cuti_nomor: cutiNomor.value,
            cuti_createdate: cutiCreatedate.value,
            cuti_tahun: tahun,
            cuti_alasan: cutiAlasan.value,
            cuti_startdate: cutiStartdate.value,
            cuti_enddate: cutiEnddate.value,
            cuti_daylong: parseInt(cutiDaylong.value) || 0,
            pegawai_nama: pegawaiNama.value,
            pegawai_nip: pegawaiNip.value,
            pegawai_pangkat: pegawaiPangkat.value,
            pegawai_golongan: pegawaiGolongan.value,
            pegawai_jabatan: pegawaiJabatan.value,
            atasan_nama: atasanNama.value,
            atasan_nip: atasanNip.value,
            cuti_alamatcuti: cutiAlamatcuti.value,
            cuti_nohp: cutiNohp.value,
            pegawai_unitkerja: pegawaiUnitkerja.value,
            cuti_atasan_jabatan: cutiAtasanJabatan.value,
            pegawai_m_t: pegawaiMT.value,
            pegawai_m_b: pegawaiMB.value
        };

        var method = idCuti.value ? 'PUT' : 'POST';
        var url = idCuti.value ? '/api/sk-cuti/' + idCuti.value : '/api/sk-cuti';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.message === "success") {
                    alert("Data berhasil disimpan!");
                    resetForm();
                    loadTableData();
                } else {
                    alert("Gagal menyimpan data: " + data.error);
                }
            });
    });

    function resetForm() {
        form.reset();
        form.classList.remove('was-validated');
        idCuti.value = "";
        pegawaiNama.value = "";
        pegawaiNip.value = "";
        pegawaiPangkat.value = "";
        pegawaiGolongan.value = "";
        pegawaiJabatan.value = "";
        pegawaiMT.value = "";
        pegawaiMB.value = "";
        atasanNama.value = "";
        atasanNip.value = "";
        cutiAlamatcuti.value = "";
        cutiNohp.value = "";
        pegawaiUnitkerja.value = "";
        cutiAtasanJabatan.value = "";
        pegawaiInfoBox.classList.add('d-none');
        atasanInfoBox.classList.add('d-none');
        btnCancelEdit.classList.add('d-none');
        cutiCreatedate.valueAsDate = new Date();
        loadLastNomor();
    }

    btnCancelEdit.addEventListener('click', resetForm);

    // Action formatter for table
    var actionFormatter = function (cell) {
        return '<div class="d-flex gap-1 justify-content-center">'
            + '<button class="btn btn-sm btn-warning btn-edit" title="Edit"><i class="bi bi-pencil"></i> Edit</button>'
            + '<button class="btn btn-sm btn-success btn-generate" title="Generate Dokumen"><i class="bi bi-printer-fill"></i> Cetak</button>'
            + '<button class="btn btn-sm btn-info btn-formulir" title="Formulir Cuti"><i class="bi bi-file-earmark-text"></i> Formulir</button>'
            + '<button class="btn btn-sm btn-danger btn-delete" title="Hapus"><i class="bi bi-trash"></i> Hapus</button>'
            + '</div>';
    };

    // Initialize Table
    table = new Tabulator("#table-sk-cuti", {
        layout: "fitData",
        pagination: "local",
        paginationSize: 10,
        placeholder: "Tidak ada data",
        columns: [
            { title: "No. SK", field: "cuti_nomor", sorter: "string", minWidth: 80 },
            { title: "Aksi", formatter: actionFormatter, hozAlign: "center", width: 380, headerSort: false },
            { title: "Nama Pegawai", field: "pegawai_nama", sorter: "string", minWidth: 180 },
            { title: "Tgl Cuti", field: "cuti_startdate", sorter: "string", minWidth: 110 },
            { title: "s.d", field: "cuti_enddate", sorter: "string", minWidth: 110 },
            { title: "Lama", field: "cuti_daylong", hozAlign: "center", minWidth: 70 },
            { title: "Alasan", field: "cuti_alasan", sorter: "string", minWidth: 150 }
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
            fetch('/api/sk-cuti/' + rowData.id)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.message === "success") {
                        var d = data.data;
                        idCuti.value = d.id;
                        cutiNomor.value = d.cuti_nomor;
                        cutiCreatedate.value = d.cuti_createdate;
                        cutiAlasan.value = d.cuti_alasan;
                        cutiStartdate.value = d.cuti_startdate;
                        cutiEnddate.value = d.cuti_enddate;
                        cutiDaylong.value = d.cuti_daylong;

                        pegawaiNama.value = d.pegawai_nama;
                        pegawaiNip.value = d.pegawai_nip;
                        pegawaiPangkat.value = d.pegawai_pangkat;
                        pegawaiGolongan.value = d.pegawai_golongan;
                        pegawaiJabatan.value = d.pegawai_jabatan;
                        pegawaiMT.value = d.pegawai_m_t || '';
                        pegawaiMB.value = d.pegawai_m_b || '';

                        document.getElementById('display_nama').textContent = d.pegawai_nama || '-';
                        document.getElementById('display_nip').textContent = d.pegawai_nip || '-';
                        document.getElementById('display_pangkat').textContent = d.pegawai_pangkat || '-';
                        document.getElementById('display_golongan').textContent = d.pegawai_golongan || '-';
                        document.getElementById('display_jabatan').textContent = d.pegawai_jabatan || '-';
                        pegawaiInfoBox.classList.remove('d-none');

                        atasanNama.value = d.atasan_nama;
                        atasanNip.value = d.atasan_nip;
                        document.getElementById('display_atasan_nama').textContent = d.atasan_nama || '-';
                        document.getElementById('display_atasan_nip').textContent = d.atasan_nip || '-';
                        atasanInfoBox.classList.remove('d-none');

                        cutiAlamatcuti.value = d.cuti_alamatcuti || '';
                        cutiNohp.value = d.cuti_nohp || '';
                        pegawaiUnitkerja.value = d.pegawai_unitkerja || '';
                        cutiAtasanJabatan.value = d.cuti_atasan_jabatan || '';

                        btnCancelEdit.classList.remove('d-none');
                        window.scrollTo(0, 0);
                    }
                });
        } else if (action.classList.contains('btn-delete')) {
            if (confirm('Yakin ingin menghapus data ini?')) {
                fetch('/api/sk-cuti/' + rowData.id, { method: 'DELETE' })
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        if (data.message === "success") loadTableData();
                    });
            }
        } else if (action.classList.contains('btn-generate')) {
            window.open('sk_cuti_generate.html?id=' + rowData.id, '_blank');
        } else if (action.classList.contains('btn-formulir')) {
            window.open('sk_cuti_formulir.html?id=' + rowData.id, '_blank');
        }
    });

    function loadTableData() {
        fetch('/api/sk-cuti')
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
                var matchNomor = data.cuti_nomor && data.cuti_nomor.toLowerCase().includes(term.toLowerCase());
                var matchNama = data.pegawai_nama && data.pegawai_nama.toLowerCase().includes(term.toLowerCase());
                var matchAlasan = data.cuti_alasan && data.cuti_alasan.toLowerCase().includes(term.toLowerCase());
                return matchNomor || matchNama || matchAlasan;
            });
        }
    });

    loadTableData();
});
