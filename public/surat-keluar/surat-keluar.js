document.addEventListener('DOMContentLoaded', function () {
    // Set default date to today
    document.getElementById('tanggal_surat').valueAsDate = new Date();

    // Auto-fill nomor surat based on nomor urut
    document.getElementById('nomor_urut').addEventListener('input', function() {
        document.getElementById('nomor_surat').value = `B-${this.value}`;
    });

    // Auto-fill Keterangan based on checkbox
    document.getElementById('keterangan_manual').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('keterangan').value = "Input Manual";
        } else {
            if (document.getElementById('keterangan').value === "Input Manual") {
                document.getElementById('keterangan').value = "";
            }
        }
    });

    // Custom formatter for action buttons
    var actionFormatter = function (cell, formatterParams, onRendered) {
        return `<button class="btn-edit px-2 py-1 rounded bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition mr-1" title="Edit"><i class="bi bi-pencil"></i> Edit</button>
                <button class="btn-delete px-2 py-1 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition" title="Hapus"><i class="bi bi-trash"></i> Hapus</button>`;
    };

    // Initialize Tabulator
    var table = new Tabulator("#table-surat-keluar", {
        ajaxURL: "/api/surat-keluar",
        ajaxResponse: function (url, params, response) {
            let maxNo = 0;
            if (response.data && response.data.length > 0) {
                response.data.forEach(row => {
                    let num = parseInt(row.nomor_urut);
                    if (!isNaN(num) && num > maxNo) {
                        maxNo = num;
                    }
                });
            }
            const nextUrut = maxNo + 1;
            document.getElementById('nomor_urut').value = nextUrut;
            document.getElementById('nomor_surat').value = `B-${nextUrut}`;
            return response.data;
        },
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [10, 50, 100, true], // Add pagination size selector
        movableColumns: false,
        columns: [
            { title: "Nomor Urut", field: "nomor_urut", headerFilter: "input", width: 120 },
            {
                title: "Aksi", formatter: actionFormatter, hozAlign: "center", headerSort: false, cellClick: function (e, cell) {
                    var id = cell.getRow().getData().id;
                    var target = e.target.closest('button');
                    if (target && target.classList.contains('btn-edit')) {
                        editData(cell.getRow().getData());
                    } else if (target && target.classList.contains('btn-delete')) {
                        deleteData(id);
                    }
                }
            },
            { title: "Tanggal", field: "tanggal_surat", headerFilter: "input", width: 120 },
            { title: "Nomor Surat", field: "nomor_surat", headerFilter: "input", width: 150 },
            { title: "Asal Surat", field: "asal_surat", headerFilter: "input" },
            { title: "Tujuan", field: "tujuan", headerFilter: "input" },
            { title: "Isi Surat", field: "isi_surat", headerFilter: "input" },
            { title: "Keterangan", field: "keterangan", headerFilter: "input" },

        ],
    });

    // Global Search
    document.getElementById("global-search").addEventListener("keyup", function () {
        if (this.value) {
            table.setFilter(customFilter, this.value);
        } else {
            table.clearFilter();
        }
    });

    function customFilter(data, filterParams) {
        var value = filterParams.toLowerCase();
        for (var key in data) {
            if (String(data[key]).toLowerCase().includes(value)) {
                return true;
            }
        }
        return false;
    }

    // Handle form submission
    document.getElementById('formSuratKeluar').addEventListener('submit', function (e) {
        e.preventDefault();

        const id_surat = document.getElementById('id_surat').value;
        const data = {
            nomor_urut: document.getElementById('nomor_urut').value,
            tanggal_surat: document.getElementById('tanggal_surat').value,
            nomor_surat: document.getElementById('nomor_surat').value,
            asal_surat: document.getElementById('asal_surat').value,
            tujuan: document.getElementById('tujuan').value,
            isi_surat: document.getElementById('isi_surat').value,
            keterangan: document.getElementById('keterangan').value
        };

        const method = id_surat ? 'PUT' : 'POST';
        const url = id_surat ? '/api/surat-keluar/' + id_surat : '/api/surat-keluar';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'success') {
                    alert('Data berhasil disimpan!');
                    resetForm();
                    table.setData();
                } else {
                    alert('Gagal menyimpan data: ' + data.error);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menyimpan data.');
            });
    });

    function editData(data) {
        document.getElementById('id_surat').value = data.id;
        document.getElementById('nomor_urut').value = data.nomor_urut;
        document.getElementById('tanggal_surat').value = data.tanggal_surat;
        document.getElementById('nomor_surat').value = data.nomor_surat;
        document.getElementById('asal_surat').value = data.asal_surat;
        document.getElementById('tujuan').value = data.tujuan;
        document.getElementById('isi_surat').value = data.isi_surat;
        document.getElementById('keterangan').value = data.keterangan;

        document.getElementById('btn-submit').innerHTML = '<i class="bi bi-save"></i> Update Data';
        document.getElementById('btn-submit').classList.replace('bg-kemenag', 'bg-amber-500');
        document.getElementById('btn-submit').classList.replace('hover:bg-kemenag-dark', 'hover:bg-amber-600');
        document.getElementById('btn-cancel-edit').classList.remove('hidden');
    }

    function deleteData(id) {
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            fetch('/api/surat-keluar/' + id, { method: 'DELETE' })
                .then(res => res.json())
                .then(res => {
                    if (res.message === 'success') {
                        table.setData();
                    } else {
                        alert('Gagal menghapus data');
                    }
                });
        }
    }

    function resetForm() {
        document.getElementById('formSuratKeluar').reset();
        document.getElementById('id_surat').value = '';
        document.getElementById('tanggal_surat').valueAsDate = new Date();
        document.getElementById('btn-submit').innerHTML = '<i class="bi bi-save"></i> Simpan Data';
        document.getElementById('btn-submit').classList.replace('bg-amber-500', 'bg-kemenag');
        document.getElementById('btn-submit').classList.replace('hover:bg-amber-600', 'hover:bg-kemenag-dark');
        document.getElementById('btn-cancel-edit').classList.add('hidden');
    }

    document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);

    // Export actions
    document.getElementById("download-pdf").addEventListener("click", function () {
        table.download("pdf", "data-surat-keluar.pdf", {
            orientation: "landscape", //set page orientation to landscape since there are many columns
            title: "Data Surat Keluar", //add title to report
        });
    });

    document.getElementById("download-xlsx").addEventListener("click", function () {
        table.download("xlsx", "data-surat-keluar.xlsx", { sheetName: "Surat Keluar" });
    });
});
