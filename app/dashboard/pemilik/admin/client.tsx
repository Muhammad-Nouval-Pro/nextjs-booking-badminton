"use client";

import { useActionState } from "react";
import { tambahAdmin, hapusAdmin } from "@/app/actions/pemilik";

export function FormTambahAdmin() {
  const [state, aksi, loading] = useActionState(tambahAdmin, undefined);

  return (
    <div className="kartu" style={{ marginBottom: "2rem" }}>
      <div className="kartu-header">
        <span className="kartu-judul">Tambah Admin Baru</span>
      </div>
      <div className="kartu-body">
        {state?.pesan && <div className="form-pesan-error">⚠️ {state.pesan}</div>}
        {state?.sukses && <div className="form-pesan-error" style={{ background: "var(--biru-bg)", color: "var(--biru-primer)", borderColor: "var(--biru-border)" }}>✅ {state.sukses}</div>}
        
        <form action={aksi} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Admin</label>
            <input name="nama" type="text" className="form-input" placeholder="Nama Lengkap" required />
            {state?.errors?.nama && <p className="form-error">{state.errors.nama[0]}</p>}
          </div>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Admin</label>
            <input name="email" type="email" className="form-input" placeholder="email@contoh.com" required />
            {state?.errors?.email && <p className="form-error">{state.errors.email[0]}</p>}
          </div>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Kata Sandi Default</label>
            <input name="kataSandi" type="password" className="form-input" placeholder="Minimal 6 karakter" required />
            {state?.errors?.kataSandi && <p className="form-error">{state.errors.kataSandi[0]}</p>}
          </div>
          <button type="submit" className="tombol-primer" disabled={loading} style={{ height: "45px" }}>
            {loading ? "Menyimpan..." : "Simpan Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function TabelAdmin({ daftarAdmin }: { daftarAdmin: any[] }) {
  return (
    <div className="kartu">
      <div className="kartu-header">
        <span className="kartu-judul">👥 Daftar Admin GOR</span>
      </div>
      <div className="tabel-wrapper">
        <table className="tabel">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Admin</th>
              <th>Email</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftarAdmin.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2.5rem", color: "var(--abu-500)" }}>Belum ada admin terdaftar.</td>
              </tr>
            ) : (
              daftarAdmin.map((a) => (
                <tr key={a.idPengguna}>
                  <td style={{ fontSize: "0.8rem", color: "var(--abu-500)" }}>{a.idPengguna.slice(0, 8)}</td>
                  <td style={{ fontWeight: 600 }}>{a.nama}</td>
                  <td>{a.email}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={async () => {
                        if (confirm(`Yakin ingin menghapus admin ${a.nama}?`)) {
                          const res = await hapusAdmin(a.idPengguna);
                          if (!res.sukses) alert(res.pesan);
                        }
                      }}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "#fee2e2",
                        color: "var(--merah)",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
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
