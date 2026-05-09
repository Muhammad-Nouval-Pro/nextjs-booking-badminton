"use client";

import { useActionState, useState } from "react";
import { autoGenerateJadwal, ubahStatusJadwal, hapusJadwal, bookingLangsung } from "@/app/actions/admin";

export function FormGenerateJadwal({ lapanganParams }: { lapanganParams: any[] }) {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  const submitGenerate = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setPesan("");

    const formData = new FormData(e.target);
    const tanggal = formData.get("tanggal") as string;
    const lapanganId = formData.get("lapanganId") as string;

    const res = await autoGenerateJadwal(tanggal, lapanganId);
    setPesan(res.sukses || res.pesan || "");
    setLoading(false);
  };

  return (
    <div className="kartu" style={{ marginBottom: "2rem" }}>
      <div className="kartu-header">
        <span className="kartu-judul">⚙️ Generate Jadwal Otomatis (09:00 - 22:00)</span>
      </div>
      <div className="kartu-body">
        {pesan && <div className="form-pesan-error" style={pesan.includes("Berhasil") ? { background: "var(--biru-bg)", color: "var(--biru-primer)", borderColor: "var(--biru-border)" } : {}}>
          {pesan}
        </div>}

        <form onSubmit={submitGenerate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Tanggal</label>
            <input name="tanggal" type="date" className="form-input" required />
          </div>
          <div className="form-grup" style={{ marginBottom: 0 }}>
            <label className="form-label">Pilih Lapangan</label>
            <select name="lapanganId" className="form-input" required>
              {lapanganParams.map(l => (
                <option key={l.idLapangan} value={l.idLapangan}>{l.nama}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="tombol-primer" disabled={loading} style={{ height: "45px" }}>
            {loading ? "Memproses..." : "Generate Jadwal"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function TabelJadwal({ jadwal }: { jadwal: any[] }) {
  return (
    <div className="kartu">
      <div className="kartu-header">
        <span className="kartu-judul">Daftar Jadwal Lapangan</span>
      </div>
      <div className="tabel-wrapper">
        <table className="tabel">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Lapangan</th>
              <th>Jam</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--abu-500)" }}>Belum ada jadwal</td>
              </tr>
            ) : (
              jadwal.map((j) => (
                <tr key={j.idSlotwaktu}>
                  <td style={{ fontWeight: 600 }}>{j.tanggal.toLocaleDateString("id-ID")}</td>
                  <td>{j.lapangan.nama}</td>
                  <td>
                    {j.jamMulai} - {j.jamSelesai}
                  </td>
                  <td>
                    {j.diblokir ? (
                      <span className="badge badge-merah">Sesi Ditutup</span>
                    ) : j.sudahDipesan ? (
                      <span className="badge badge-kuning">Sudah Dipesan</span>
                    ) : (
                      <span className="badge badge-biru">Tersedia</span>
                    )}
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => ubahStatusJadwal(j.idSlotwaktu, !j.diblokir)}
                      style={{
                        padding: "0.4rem 0.75rem",
                        background: "var(--abu-100)",
                        color: "var(--abu-900)",
                        border: "1px solid var(--abu-200)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}>
                      {j.diblokir ? "Buka Sesi" : "Tutup Sesi"}
                    </button>
                    {!j.diblokir && !j.sudahDipesan && (
                      <button
                        onClick={async () => {
                          const nama = prompt("Masukkan NAMA CUSTOMER (Wajib diisi):");
                          
                          if (nama === null) return; // User klik Cancel
                          
                          if (!nama.trim()) {
                            alert("Nama pemesan tidak boleh kosong!");
                            return;
                          }

                          const res = await bookingLangsung(j.idSlotwaktu, nama);
                          if (res.sukses) alert("Booking berhasil disimpan!");
                          else alert(res.pesan);
                        }}
                        style={{
                          padding: "0.4rem 0.75rem",
                          background: "var(--biru-primer)",
                          color: "white",
                          border: "none",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          fontWeight: 600
                        }}>
                        Booking Langsung
                      </button>
                    )}
                    {!j.sudahDipesan && (
                      <button
                        onClick={() => {
                          if (confirm("Hapus slot waktu ini?")) hapusJadwal(j.idSlotwaktu);
                        }}
                        style={{
                          padding: "0.4rem 0.75rem",
                          background: "#fee2e2",
                          color: "var(--merah)",
                          border: "none",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}>
                        Hapus
                      </button>
                    )}
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
