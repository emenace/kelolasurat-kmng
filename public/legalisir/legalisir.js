document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('tanggal_surat').valueAsDate = new Date();

    // Custom formatter for action buttons
    var actionFormatter = function(cell, formatterParams, onRendered){
        return `<button class="btn btn-sm btn-primary btn-edit me-1" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-danger btn-delete" title="Hapus"><i class="bi bi-trash"></i></button>`;
    };

    // Initialize Tabulator
    var table = new Tabulator("#table-legalisir", {
        ajaxURL: "/api/legalisir", 
        ajaxResponse: function(url, params, response) {
            let maxNo = 0;
            if (response.data && response.data.length > 0) {
                response.data.forEach(row => {
                    let num = parseInt(row.nomor_urut);
                    if (!isNaN(num) && num > maxNo) {
                        maxNo = num;
                    }
                });
            }
            document.getElementById('nomor_urut').placeholder = maxNo + 1;
            return response.data; 
        },
        pagination: "local",       
        paginationSize: 10,
        paginationSizeSelector: [10, 50, 100, true], // Add pagination size selector
        movableColumns: true,      
        columns: [
            {title: "Nomor Urut", field: "nomor_urut", headerFilter: "input", width: 120},
            {title: "Tanggal", field: "tanggal_surat", headerFilter: "input", width: 120},
            {title: "Nomor Legalisir", field: "nomor_legalisir", headerFilter: "input", width: 180},
            {title: "Nama / NIP", field: "nama_nip", headerFilter: "input"},
            {title: "Yang Menandatangani", field: "yang_menandatangani", headerFilter: "input"},
            {title: "Keterangan", field: "keterangan", headerFilter: "input"},
            {title: "Aksi", formatter: actionFormatter, width: 100, hozAlign: "center", headerSort: false, cellClick: function(e, cell){
                var id = cell.getRow().getData().id;
                var target = e.target.closest('button');
                if(target && target.classList.contains('btn-edit')) {
                    editData(cell.getRow().getData());
                } else if(target && target.classList.contains('btn-delete')) {
                    deleteData(id);
                }
            }}
        ],
    });

    // Global Search
    document.getElementById("global-search").addEventListener("keyup", function(){
        if(this.value) {
            table.setFilter(customFilter, this.value);
        } else {
            table.clearFilter();
        }
    });

    function customFilter(data, filterParams){
        var value = filterParams.toLowerCase();
        for(var key in data){
            if(String(data[key]).toLowerCase().includes(value)){
                return true;
            }
        }
        return false;
    }

    // Handle form submission
    document.getElementById('formLegalisir').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id_legalisir = document.getElementById('id_legalisir').value;
        const data = {
            nomor_urut: document.getElementById('nomor_urut').value,
            tanggal_surat: document.getElementById('tanggal_surat').value,
            nomor_legalisir: document.getElementById('nomor_legalisir').value,
            nama_nip: document.getElementById('nama_nip').value,
            yang_menandatangani: document.getElementById('yang_menandatangani').value,
            keterangan: document.getElementById('keterangan').value
        };

        const method = id_legalisir ? 'PUT' : 'POST';
        const url = id_legalisir ? '/api/legalisir/' + id_legalisir : '/api/legalisir';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if(data.message === 'success') {
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
        document.getElementById('id_legalisir').value = data.id;
        document.getElementById('nomor_urut').value = data.nomor_urut;
        document.getElementById('tanggal_surat').value = data.tanggal_surat;
        document.getElementById('nomor_legalisir').value = data.nomor_legalisir;
        document.getElementById('nama_nip').value = data.nama_nip;
        document.getElementById('yang_menandatangani').value = data.yang_menandatangani;
        document.getElementById('keterangan').value = data.keterangan;

        document.getElementById('btn-submit').innerHTML = '<i class="bi bi-save me-2"></i>Update Data';
        document.getElementById('btn-submit').classList.replace('btn-kemenag', 'btn-warning');
        document.getElementById('btn-cancel-edit').classList.remove('d-none');
    }

    function deleteData(id) {
        if(confirm("Apakah Anda yakin ingin menghapus data ini?")) {
            fetch('/api/legalisir/' + id, { method: 'DELETE' })
            .then(res => res.json())
            .then(res => {
                if(res.message === 'success') {
                    table.setData();
                } else {
                    alert('Gagal menghapus data');
                }
            });
        }
    }

    function resetForm() {
        document.getElementById('formLegalisir').reset();
        document.getElementById('id_legalisir').value = '';
        document.getElementById('tanggal_surat').valueAsDate = new Date();
        document.getElementById('btn-submit').innerHTML = '<i class="bi bi-save me-2"></i>Simpan Data';
        document.getElementById('btn-submit').classList.replace('btn-warning', 'btn-kemenag');
        document.getElementById('btn-cancel-edit').classList.add('d-none');
    }

    document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);

    // Export actions
    document.getElementById("download-pdf").addEventListener("click", function(){
        table.download("pdf", "data-legalisir.pdf", {
            orientation:"landscape", //set page orientation to landscape since there are many columns
            title:"Data Legalisir", //add title to report
        });
    });

    document.getElementById("download-xlsx").addEventListener("click", function(){
        table.download("xlsx", "data-legalisir.xlsx", {sheetName:"Legalisir"});
    });
});
