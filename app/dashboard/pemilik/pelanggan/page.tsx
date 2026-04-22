import { prisma } from "@/app/lib/db";
import { TabelPelanggan } from "@/app/dashboard/pemilik/pelanggan/client";

export default async function KelolaPelanggan() {
  const daftarPelangganRaw = await prisma.pengguna.findMany({
    where: { peran: "PELANGGAN" },
    orderBy: { dibuatPada: "desc" },
  });

  const daftarPelanggan = daftarPelangganRaw.map((p) => ({
    id: p.id,
    nama: p.nama,
    email: p.email,
    nomorHp: p.nomorHp,
    aktif: p.aktif,
    dibuatPada: p.dibuatPada.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
  }));

  return (
    <>
      <div className="konten-header">
        <h1>Daftar Pelanggan Terdaftar</h1>
      </div>
      <div className="konten-body">
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ color: "var(--abu-500)" }}>
            Daftar ini menampilkan semua pengguna yang mendaftar sebagai pelanggan.
          </p>
        </div>
        <TabelPelanggan daftarPelanggan={daftarPelanggan} />
      </div>
    </>
  );
}
