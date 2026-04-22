import { prisma } from "@/app/lib/db";
import { TabelPembayaranClient } from "./client";

export default async function VerifikasiPembayaran() {
  const pembayaran = await prisma.pembayaran.findMany({
    orderBy: [
      { status: "asc" }, // MENUNGGU dulu karena secara abjad M diurutkan duluan jika GAGAL/LUNAS, wait MENUNGGU, LUNAS, GAGAL
      { dibuatPada: "desc" }
    ]
  });

  // Karena enum urutan belum tentu yang M di atas, kita filter "MENUNGGU" di client/API,
  // untuk simplenya kita order by dibuatPada descending.
  const pembayaranFix = await prisma.pembayaran.findMany({
    orderBy: { 
      dibuatPada: "desc"
    }
  });

  // Sort manual agar "MENUNGGU" ada di bagian atas tabel.
  const pembayaranSortedRaw = [
    ...pembayaranFix.filter((p) => p.status === "MENUNGGU"),
    ...pembayaranFix.filter((p) => p.status !== "MENUNGGU"),
  ];

  // Map Prisma Decimal ke native number menghindari serialisasi obj
  const pembayaranSorted = pembayaranSortedRaw.map((p) => ({
    ...p,
    jumlah: Number(p.jumlah)
  }));

  return (
    <>
      <div className="konten-header">
        <h1>Verifikasi Pembayaran</h1>
      </div>
      <div className="konten-body">
        <TabelPembayaranClient pembayaran={pembayaranSorted} />
      </div>
    </>
  );
}
