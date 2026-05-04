import { prisma } from "@/app/lib/db";
import { ambilSesi } from "@/app/lib/sesi";
import { redirect } from "next/navigation";
import { RiwayatDanTagihan } from "./client";
import Midtrans from "midtrans-client";

// Inisialisasi Midtrans untuk pengecekan status otomatis
const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
});

export default async function HalamanRiwayat() {
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) redirect("/masuk");

  // Ambil pemesanan raw
  const riwayatPemesananRaw = await prisma.pemesanan.findMany({
    where: {
      penggunaId: sesi.penggunaId
    },
    include: {
      slotWaktu: {
        include: { lapangan: true }
      },
      pembayaran: true
    },
    orderBy: {
      dibuatPada: "desc"
    }
  });

  // Otomatisasi 1: Sinkronisasi Status Pembayaran dari Midtrans (Sangat berguna jika webhook tidak masuk / localhost)
  await Promise.all(riwayatPemesananRaw.map(async (p) => {
    if (p.status === "MENUNGGU" && p.pembayaran?.idOrderGateway) {
      try {
        // @ts-ignore
        const status = await snap.transaction.status(p.pembayaran.idOrderGateway);
        
        let statusBaruPembayaran: any = "MENUNGGU";
        let statusBaruPemesanan: any = "MENUNGGU";

        if (status.transaction_status === 'settlement' || status.transaction_status === 'capture') {
          if (status.fraud_status === 'accept' || !status.fraud_status) {
            statusBaruPembayaran = "LUNAS";
            statusBaruPemesanan = "DIKONFIRMASI";
          }
        } else if (['cancel', 'deny', 'expire'].includes(status.transaction_status)) {
          statusBaruPembayaran = "GAGAL";
          statusBaruPemesanan = "DIBATALKAN";
        }

        if (statusBaruPemesanan !== p.status) {
          await prisma.$transaction([
            prisma.pembayaran.update({
              where: { idPembayaran: p.pembayaran.idPembayaran },
              data: { 
                status: statusBaruPembayaran,
                idTransaksiGateway: status.transaction_id,
                metodeBayar: status.payment_type,
                dibayarPada: statusBaruPembayaran === "LUNAS" ? new Date() : null
              }
            }),
            prisma.pemesanan.update({
              where: { idPemesanan: p.idPemesanan },
              data: { status: statusBaruPemesanan }
            })
          ]);
          // Update data lokal agar UI langsung berubah
          p.status = statusBaruPemesanan;
        }
      } catch (err) {
        // Abaikan jika order_id belum terdaftar di Midtrans (pelanggan baru klik 'Bayar' tapi belum pilih metode)
      }
    }
  }));

  // Otomatisasi 2: Update status menjadi SELESAI jika waktu main sudah lewat
  const sekarang = new Date();
  
  await Promise.all(riwayatPemesananRaw.map(async (p) => {
    if (p.status === "DIKONFIRMASI" && p.slotWaktu) {
      // Konstruksi tanggal selesai
      // p.slotWaktu.tanggal adalah Date (00:00:00), jamSelesai string "20:00"
      const [jam, menit] = p.slotWaktu.jamSelesai.split(":").map(Number);
      const waktuSelesai = new Date(p.slotWaktu.tanggal);
      waktuSelesai.setHours(jam, menit, 0, 0);

      if (sekarang > waktuSelesai) {
        await prisma.pemesanan.update({
          where: { idPemesanan: p.idPemesanan },
          data: { status: "SELESAI" }
        });
        // Update status di object lokal agar langsung tampil sebagai SELESAI
        p.status = "SELESAI";
      }
    }
  }));


  const riwayatPemesanan = riwayatPemesananRaw.map(p => ({
    ...p,
    totalHarga: Number(p.totalHarga),
    slotWaktu: p.slotWaktu ? {
      ...p.slotWaktu,
      lapangan: {
        ...p.slotWaktu.lapangan,
        hargaPerJam: Number(p.slotWaktu.lapangan.hargaPerJam)
      }
    } : null,
    pembayaran: p.pembayaran ? {
      ...p.pembayaran,
      jumlah: Number(p.pembayaran.jumlah)
    } : null
  }));

  return (
    <>
      <div className="konten-header">
        <h1>Riwayat & Tagihan Pemesanan</h1>
      </div>
      <div className="konten-body">
        <RiwayatDanTagihan dataPemesanan={riwayatPemesanan} />
      </div>
    </>
  );
}
