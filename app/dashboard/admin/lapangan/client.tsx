"use client";

import { useActionState } from "react";
import { tambahLapangan, hapusLapangan } from "@/app/actions/admin";
import { useEffect, useState } from "react";

// Karena ini Client Component yang butuh manggil data, 
// tapi untuk kemudahan Next.js kita bisa terima data dari props kalau di split ke komponen,
// Untuk sekarang pakai Fetch API sederhana atau pindahkan pengambilan data ke Server Component & props data ke Client Component.

// Biar lebih mudah, kita buat layout client + server:

// Ini Komponen Form (Client)
export function FormTambahLapangan() {
  const [state, aksi, loading] = useActionState(tambahLapangan, undefined);

  return (
    <div className="kartu" style={{ marginBottom: "2rem" }}>
      <div className="kartu-header">
        <span className="kartu-judul">Tambah Lapangan Baru</span>
      </div>
      <div className="kartu-body">
        {state?.pesan && <div className="form-pesan-error">⚠️ {state.pesan}</div>}
        {state?.sukses && <div className="form-pesan-error" style={{ background: "var(--biru-bg)", color: "var(--biru-primer)", borderColor: "var(--biru-border)" }}>✅ {state.sukses}</div>}

        <form action={aksi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Lapangan</label>
            <input name="nama" type="text" className="form-input" placeholder="Masukkan Nama Lapangan" required />
          </div>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Tipe Lantai</label>
            <select name="tipe" className="form-input" required>
              <option value="VINYL">Vinyl</option>
              <option value="KARPET">Karpet</option>
              <option value="BETON">Beton</option>
            </select>
          </div>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Harga Per Jam (Rp)</label>
            <input name="hargaPerJam" type="number" className="form-input" placeholder="Masukkan Harga Per Jam" min="1000" required />
          </div>
          <button type="submit" className="tombol-primer" disabled={loading} style={{ height: "45px" }}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Ini Komponen Tabel (Client for delete action)
export function TabelLapangan({ daftarLapangan }: { daftarLapangan: any[] }) {
  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  const toTitleCase = (str: string) => str ? str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : "";

  return (
    <div className="kartu">
      <div className="kartu-header">
        <span className="kartu-judul">🏸 Daftar Lapangan</span>
      </div>
      <div className="tabel-wrapper">
        <table className="tabel">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Lapangan</th>
              <th>Tipe</th>
              <th>Harga/Jam</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarLapangan.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--abu-500)" }}>Belum ada data lapangan</td>
              </tr>
            ) : (
              daftarLapangan.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontSize: "0.8rem", color: "var(--abu-500)" }}>{l.id.slice(0, 8)}</td>
                  <td style={{ fontWeight: 600 }}>{toTitleCase(l.nama)}</td>
                  <td><span className="badge badge-abu">{toTitleCase(l.deskripsi) || "Lantai Vinyl"}</span></td>
                  <td style={{ color: "var(--biru-primer)", fontWeight: 600 }}>{formatRupiah(Number(l.hargaPerJam))}</td>
                  <td>
                    <button
                      onClick={() => {
                        if (confirm("Yakin ingin menghapus lapangan ini?")) {
                          hapusLapangan(l.id);
                        }
                      }}
                      style={{
                        padding: "0.4rem 0.75rem",
                        background: "#fee2e2",
                        color: "var(--merah)",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: 600
                      }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Dummy Wrapper untuk load awal, nanti kita fix dengan server component untuk halamannya
export default function KelolaLapanganWrapper({ data }: any) {
  // Akan di-wrap oleh server component yang terpisah, atau gunakan React Server Components secara langsung
  return null;
}
