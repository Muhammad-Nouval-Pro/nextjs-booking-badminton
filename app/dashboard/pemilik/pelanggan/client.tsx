"use client";

export function TabelPelanggan({ daftarPelanggan }: { daftarPelanggan: any[] }) {
  return (
    <div className="kartu">
      <div className="tabel-wrapper">
        <table className="tabel">
          <thead>
            <tr>
              <th>Nama Pelanggan</th>
              <th>Email</th>
              <th>No. WhatsApp</th>
              <th>Terdaftar Pada</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {daftarPelanggan.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--abu-500)" }}>Belum ada pelanggan terdaftar.</td>
              </tr>
            ) : (
              daftarPelanggan.map((p) => (
                <tr key={p.idPengguna}>
                  <td style={{ fontWeight: 600 }}>{p.nama}</td>
                  <td>{p.email}</td>
                  <td>{p.nomorHp || "-"}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--abu-500)" }}>{p.dibuatPada}</td>
                  <td>
                    {p.aktif ? (
                      <span className="badge badge-biru">Aktif</span>
                    ) : (
                      <span className="badge badge-merah">Dinonaktifkan</span>
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
