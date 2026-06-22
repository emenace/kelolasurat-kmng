document.addEventListener('DOMContentLoaded', function () {
    let table;
    let isEditMode = false;

    // All columns definition with their labels
    const FIELDS = [
        { field: "NO",                label: "No"                },
        { field: "NAMA",              label: "Nama"              },
        { field: "NIP LAMA",          label: "NIP Lama"          },
        { field: "NIP BARU",          label: "NIP Baru"          },
        { field: "FORMATTED NIP",     label: "Formatted NIP"     },
        { field: "GOLRU",             label: "Gol/Ruang"         },
        { field: "PANGKAT",           label: "Pangkat"           },
        { field: "TMT GOLRU",         label: "TMT Gol/Ruang"     },
        { field: "SATKER",            label: "Satuan Kerja"      },
        { field: "JABATAN",           label: "Jabatan"           },
        { field: "TMT JABATAN",       label: "TMT Jabatan"       },
        { field: "THN",               label: "Masa Kerja Thn"    },
        { field: "BLN",               label: "Masa Kerja Bln"    },
        { field: "PENDIDIKAN TERAKHIR", label: "Pendidikan"      },
        { field: "THN PENDIDIKAN",    label: "Thn Pendidikan"    },
        { field: "JENIS PENDIDIKAN",  label: "Jenis Pendidikan"  },
        { field: "TGL LAHIR",         label: "Tgl Lahir"         },
        { field: "TMT PENSIUN",       label: "TMT Pensiun"       },
        { field: "KET",               label: "Keterangan"        }
    ];

    // Columns shown in VIEW mode
    const VIEW_FIELDS = ["NAMA", "NIP BARU", "SATKER", "PANGKAT", "GOLRU", "JABATAN", "TGL LAHIR", "TMT PENSIUN"];

    // ----- Build columns for VIEW mode -----
    function buildViewColumns() {
        const cols = [
            { title: "No", formatter: "rownum", hozAlign: "center", width: 55, headerSort: false }
        ];
        VIEW_FIELDS.forEach(f => {
            const def = FIELDS.find(x => x.field === f);
            cols.push({ title: def.label, field: f, sorter: "string", minWidth: 140 });
        });
        return cols;
    }

    // ----- Build columns for EDIT mode -----
    function buildEditColumns() {
        const actionCol = {
            title: "EDIT",
            headerSort: false,
            hozAlign: "center",
            width: 130,
            frozen: true,
            formatter: function (cell) {
                return '<div class="flex gap-1 justify-center">' +
                    '<button class="btn-edit-row px-2 py-0.5 rounded bg-amber-500 text-white text-[11px] font-medium hover:bg-amber-600 transition">Edit</button>' +
                    '<button class="btn-delete-row px-2 py-0.5 rounded bg-red-500 text-white text-[11px] font-medium hover:bg-red-600 transition">Hapus</button>' +
                    '</div>';
            },
            cellClick: function (e, cell) {
                const btn = e.target.closest('button');
                if (!btn) return;
                if (btn.classList.contains('btn-edit-row')) {
                    openEditRowModal(cell.getRow().getData());
                } else if (btn.classList.contains('btn-delete-row')) {
                    deleteRow(cell.getRow().getData());
                }
            }
        };

        const cols = [
            actionCol,
            { title: "No", formatter: "rownum", hozAlign: "center", width: 55, headerSort: false }
        ];

        FIELDS.forEach(def => {
            cols.push({ title: def.label, field: def.field, sorter: "string", minWidth: 120 });
        });

        return cols;
    }

    // ----- Initialize Tabulator -----
    function initTable(data) {
        if (table) {
            table.destroy();
            table = null;
        }
        table = new Tabulator("#table-pegawai", {
            data: data,
            layout: "fitData",
            pagination: "local",
            paginationSize: 10,
            paginationSizeSelector: [10, 25, 50, 100, true],
            placeholder: "Tidak ada data",
            columns: buildViewColumns(),
            locale: "id",
            langs: {
                "id": {
                    "pagination": {
                        "first": "Pertama", "first_title": "Halaman Pertama",
                        "last": "Terakhir", "last_title": "Halaman Terakhir",
                        "prev": "Sebelumnya", "prev_title": "Halaman Sebelumnya",
                        "next": "Selanjutnya", "next_title": "Halaman Selanjutnya",
                        "all": "Semua"
                    }
                }
            }
        });
    }

    // ----- Load data from API -----
    function loadData(callback) {
        fetch('/api/pegawai')
            .then(r => r.json())
            .then(data => {
                if (data.message === "success") {
                    if (callback) callback(data.data);
                    else initTable(data.data);
                } else {
                    console.error("Gagal mengambil data:", data.error);
                }
            })
            .catch(err => console.error("Error loading data:", err));
    }

    // ----- Switch modes -----
    function enterEditMode() {
        isEditMode = true;
        document.getElementById('btn-update-data').textContent = 'Selesai Edit';
        document.getElementById('btn-update-data').classList.replace('bg-amber-500', 'bg-gray-500');
        document.getElementById('btn-update-data').classList.replace('hover:bg-amber-600', 'hover:bg-gray-600');
        document.getElementById('btn-tambah-data').classList.remove('hidden');

        loadData(function (data) {
            if (table) { table.destroy(); table = null; }
            table = new Tabulator("#table-pegawai", {
                data: data,
                layout: "fitData",
                pagination: "local",
                paginationSize: 10,
                paginationSizeSelector: [10, 25, 50, 100, true],
                placeholder: "Tidak ada data",
                columns: buildEditColumns(),
                locale: "id",
                langs: {
                    "id": {
                        "pagination": {
                            "first": "Pertama", "last": "Terakhir",
                            "prev": "Sebelumnya", "next": "Selanjutnya", "all": "Semua"
                        }
                    }
                }
            });
        });
    }

    function exitEditMode() {
        isEditMode = false;
        document.getElementById('btn-update-data').textContent = 'Update Data';
        document.getElementById('btn-update-data').classList.replace('bg-gray-500', 'bg-amber-500');
        document.getElementById('btn-update-data').classList.replace('hover:bg-gray-600', 'hover:bg-amber-600');
        document.getElementById('btn-tambah-data').classList.add('hidden');
        loadData(function (data) { initTable(data); });
    }

    // ----- Update Data button -----
    document.getElementById('btn-update-data').addEventListener('click', function () {
        if (!isEditMode) {
            document.getElementById('input-pass-key').value = '';
            document.getElementById('verify-key-error').classList.add('hidden');
            showModal('verifyKeyModal');
        } else {
            exitEditMode();
        }
    });

    document.getElementById('btn-submit-key').addEventListener('click', function() {
        const key = document.getElementById('input-pass-key').value;
        const errorEl = document.getElementById('verify-key-error');

        fetch('/api/verify-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        })
        .then(r => r.json())
        .then(res => {
            if(res.message === 'success') {
                errorEl.classList.add('hidden');
                hideModal('verifyKeyModal');
                enterEditMode();
            } else {
                errorEl.classList.remove('hidden');
                errorEl.textContent = res.error || "Kode kunci tidak sesuai, perubahan tidak diperbolehkan";
            }
        })
        .catch(err => {
            errorEl.classList.remove('hidden');
            errorEl.textContent = "Terjadi kesalahan sistem";
        });
    });

    // ----- Tambah Data button -----
    document.getElementById('btn-tambah-data').addEventListener('click', function () {
        openAddRowModal();
    });

    // ----- Delete Row -----
    function deleteRow(rowData) {
        if (!confirm('Yakin ingin menghapus data: ' + rowData['NAMA'] + '?')) return;
        fetch('/api/pegawai/' + encodeURIComponent(rowData['NO']), { method: 'DELETE' })
            .then(r => r.json())
            .then(res => {
                if (res.message === 'success') {
                    loadData(function (data) {
                        table.setData(data);
                    });
                } else {
                    alert('Gagal menghapus: ' + res.error);
                }
            });
    }

    // ----- Edit Row Modal -----
    function openEditRowModal(rowData) {
        document.getElementById('edit-modal-title').textContent = 'Edit Data: ' + (rowData['NAMA'] || '');
        document.getElementById('edit-modal-no').value = rowData['NO'] || '';

        FIELDS.forEach(def => {
            const el = document.getElementById('edit-field-' + def.field.replace(/\s+/g, '_'));
            if (el) el.value = rowData[def.field] || '';
        });

        showModal('editRowModal');
    }

    document.getElementById('btn-save-edit').addEventListener('click', function () {
        const no = document.getElementById('edit-modal-no').value;
        const payload = {};
        FIELDS.forEach(def => {
            const el = document.getElementById('edit-field-' + def.field.replace(/\s+/g, '_'));
            if (el) payload[def.field] = el.value;
        });

        fetch('/api/pegawai/' + encodeURIComponent(no), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(r => r.json())
            .then(res => {
                if (res.message === 'success') {
                    hideModal('editRowModal');
                    loadData(function (data) { table.setData(data); });
                } else {
                    alert('Gagal menyimpan: ' + res.error);
                }
            });
    });

    // ----- Add Row Modal -----
    function openAddRowModal() {
        document.getElementById('add-form').reset();
        showModal('addRowModal');
    }

    document.getElementById('btn-save-add').addEventListener('click', function () {
        const payload = {};
        FIELDS.forEach(def => {
            const el = document.getElementById('add-field-' + def.field.replace(/\s+/g, '_'));
            if (el) payload[def.field] = el.value;
        });

        fetch('/api/pegawai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(r => r.json())
            .then(res => {
                if (res.message === 'success') {
                    hideModal('addRowModal');
                    loadData(function (data) { table.setData(data); });
                } else {
                    alert('Gagal menambah data: ' + res.error);
                }
            });
    });

    // ----- Global Search -----
    document.getElementById("global-search").addEventListener("input", function () {
        const term = this.value;
        if (table) {
            if (term === "") {
                table.clearFilter();
            } else {
                table.setFilter(function (data) {
                    const matchName = data["NAMA"] && data["NAMA"].toLowerCase().includes(term.toLowerCase());
                    const matchJabatan = data["JABATAN"] && data["JABATAN"].toLowerCase().includes(term.toLowerCase());
                    return matchName || matchJabatan;
                });
            }
        }
    });

    // ----- Export PDF -----
    document.getElementById("download-pdf").addEventListener("click", function () {
        if (table) {
            table.download("pdf", "Data_Pegawai.pdf", {
                orientation: "landscape",
                title: "Daftar Data Pegawai Kemenag Metro"
            });
        }
    });

    // ----- Export Excel -----
    document.getElementById("download-xlsx").addEventListener("click", function () {
        if (table) {
            table.download("xlsx", "Data_Pegawai.xlsx", { sheetName: "Data Pegawai" });
        }
    });

    // ----- Initial Load -----
    loadData();
});
