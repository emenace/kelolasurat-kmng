# Database Reset and Schema Update Plan

This plan outlines the steps to drop the current `DataPegawai` table, recreate it with the new schema, import the data from `newdata.csv`, and update all parts of the application to use the new field names to prevent errors.

## Proposed Changes

### Database Initialization & Seeding
#### [NEW] [reset_pegawai.js](file:///Users/emenace/Documents/Apps%20/kelolasurat-kmng/scripts/reset_pegawai.js)
- A new script to completely drop the `DataPegawai` table, parse `newdata.csv`, and insert the data.
- It will parse the new headers and map them to the table columns.
- For `FORMATTED NIP`, it will remove the leading `'` character and insert it into the database. Since it will be stored as TEXT, it will prevent losing leading or trailing zeroes.

#### [MODIFY] [database_pegawai.js](file:///Users/emenace/Documents/Apps%20/kelolasurat-kmng/database/logic/database_pegawai.js)
- Update the `CREATE TABLE IF NOT EXISTS` statement to reflect the new schema with all the new field names (`FORMATTED NIP`, `GOLRU`, `TMT GOLRU`, `SATKER`, `THN`, `BLN`, `THN PENDIDIKAN`, `JENIS PENDIDIKAN`, etc.).
- Delete the old column definitions like `TMT KERJA` and `MASA KERJA THN`.

### API Updates
#### [MODIFY] [server.js](file:///Users/emenace/Documents/Apps%20/kelolasurat-kmng/server.js)
- Update the `GET /api/pegawai` query to `SELECT * FROM DataPegawai ORDER BY "NO" ASC` (or strictly the necessary new columns) instead of selecting the old columns, ensuring no SQL errors are thrown when fetching the data.

### Frontend Updates
#### [MODIFY] [data_pegawai.js](file:///Users/emenace/Documents/Apps%20/kelolasurat-kmng/public/data-pegawai/data_pegawai.js)
- Update the Tabulator column definitions to use the new fields:
  - Remove `TMT KERJA` as it is deleted.
  - Change `Pangkat` to `PANGKAT`
  - Change `PANGKAT GOL/RUANG` to `GOLRU`
  - Change `T M T GOLRUANG` to `TMT GOLRU` (if displayed)
  - Add `SATKER`
  - Ensure correct mappings for `THN` and `BLN`.

#### [MODIFY] [surat_tugas.js](file:///Users/emenace/Documents/Apps%20/kelolasurat-kmng/public/surat-tugas/surat_tugas.js)
- Update the Autocomplete suggestion mapping where old fields like `p.Pangkat` and `p["PANGKAT GOL/RUANG"]` were being used, converting them to `p.PANGKAT` and `p.GOLRU`.

#### [MODIFY] [sk_cuti.js](file:///Users/emenace/Documents/Apps%20/kelolasurat-kmng/public/sk-cuti/sk_cuti.js)
- Update the autocomplete mappings for Pegawai/Atasan to correctly reference `p.PANGKAT` and `p.GOLRU` instead of the old names.

## Open Questions
- You mentioned `TMT KERJA` was deleted. I will remove it from the "Data Pegawai" table view on the frontend. Is this correct?
- Do you want to display the new `SATKER` column in the Data Pegawai table?

## Verification Plan
1. Run `node scripts/reset_pegawai.js` to seed the new database.
2. Open the application and verify the Data Pegawai table loads correctly without errors.
3. Test the autocomplete in "Surat Tugas" and "SK Cuti" modules to confirm field population (Pangkat, Golongan) works seamlessly.
