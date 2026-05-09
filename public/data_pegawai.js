document.addEventListener('DOMContentLoaded', function() {
    let table;

    // Inisialisasi Tabulator
    function initTable(data) {
        table = new Tabulator("#table-pegawai", {
            data: data,
            layout: "fitData", // Enable horizontal scrolling when columns are too wide
            pagination: "local",
            paginationSize: 10,
            paginationSizeSelector: [10, 25, 50, 100, true],
            placeholder: "Tidak ada data",
            columns: [
                {
                    title: "No", 
                    formatter: "rownum", 
                    hozAlign: "center", 
                    width: 60,
                    headerSort: false
                },
                { title: "Nama", field: "NAMA", sorter: "string", minWidth: 150 },
                { title: "NIP", field: "NIP BARU", sorter: "string", minWidth: 150 },
                { title: "TMT Kerja", field: "TMT KERJA", sorter: "string", minWidth: 100 },
                { title: "Pangkat", field: "Pangkat", sorter: "string", minWidth: 120 },
                { title: "Pangkat Gol/Ruang", field: "PANGKAT GOL/RUANG", sorter: "string", minWidth: 100 },
                { title: "Jabatan", field: "JABATAN", sorter: "string", minWidth: 150 },
                { title: "Tanggal Lahir", field: "TGL LAHIR", sorter: "string", minWidth: 120 },
                { title: "TMT Pensiun", field: "TMT PENSIUN", sorter: "string", minWidth: 120 }
            ],
            locale: "id",
            langs: {
                "id": {
                    "pagination": {
                        "first": "Pertama",
                        "first_title": "Halaman Pertama",
                        "last": "Terakhir",
                        "last_title": "Halaman Terakhir",
                        "prev": "Sebelumnya",
                        "prev_title": "Halaman Sebelumnya",
                        "next": "Selanjutnya",
                        "next_title": "Halaman Selanjutnya",
                        "all": "Semua",
                    }
                }
            }
        });
    }

    // Load data from API
    function loadData() {
        fetch('/api/pegawai')
            .then(response => response.json())
            .then(data => {
                if(data.message === "success") {
                    initTable(data.data);
                } else {
                    console.error("Gagal mengambil data:", data.error);
                }
            })
            .catch(error => {
                console.error("Error loading data:", error);
            });
    }

    // Global Search
    const searchInput = document.getElementById("global-search");
    searchInput.addEventListener("input", function () {
        const term = searchInput.value;
        if(table) {
            if (term === "") {
                table.clearFilter();
            } else {
                table.setFilter(function(data) {
                    const matchName = data["NAMA"] && data["NAMA"].toLowerCase().includes(term.toLowerCase());
                    const matchJabatan = data["JABATAN"] && data["JABATAN"].toLowerCase().includes(term.toLowerCase());
                    return matchName || matchJabatan;
                });
            }
        }
    });

    // Export PDF
    document.getElementById("download-pdf").addEventListener("click", function(){
        if(table) {
            table.download("pdf", "Data_Pegawai.pdf", {
                orientation: "landscape",
                title: "Daftar Data Pegawai Kemenag Metro"
            });
        }
    });

    // Export Excel
    document.getElementById("download-xlsx").addEventListener("click", function(){
        if(table) {
            table.download("xlsx", "Data_Pegawai.xlsx", {sheetName: "Data Pegawai"});
        }
    });

    // Initial Load
    loadData();
});
