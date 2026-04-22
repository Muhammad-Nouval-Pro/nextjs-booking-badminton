import { prisma } from "@/app/lib/db";
import { FormTambahLapangan, TabelLapangan } from "./client";

export default async function KelolaLapangan() {
  const daftarLapanganRaw = await prisma.lapangan.findMany({
    orderBy: { dibuatPada: "asc" },
  });

  const daftarLapangan = daftarLapanganRaw.map((l) => ({
    ...l,
    hargaPerJam: Number(l.hargaPerJam)
  }));

  return (
    <>
      <div className="konten-header">
        <h1>Kelola Lapangan</h1>
      </div>
      <div className="konten-body">
        <FormTambahLapangan />
        <TabelLapangan daftarLapangan={daftarLapangan} />
      </div>
    </>
  );
}
