"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { ambilSesi } from "@/app/lib/sesi";
import { redirect } from "next/navigation";

export async function buatPesanan(slotId: string, totalHarga: number) {
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) return { sukses: false, pesan: "Harap login" };

  try {
    // Pastikan slot waktu masih tersedia
    const slot = await prisma.slotwaktu.findUnique({ where: { idSlotwaktu: slotId } });
    if (!slot || slot.sudahDipesan || slot.diblokir) {
      return { sukses: false, pesan: "Slot waktu sudah tidak tersedia" };
    }

    // Buat pemesanan dan pembayaran
    const kodeUnik = `BK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
    
    // Gunakan transaksi
    const pesanan = await prisma.$transaction(async (tx) => {
      // 1. Tandai slot sudah dipesan
      await tx.slotwaktu.update({
        where: { idSlotwaktu: slotId },
        data: { sudahDipesan: true }
      });

      // 2. Buat record pemesanan
      const p = await tx.pemesanan.create({
        data: {
          kodePemesanan: kodeUnik,
          penggunaId: sesi.penggunaId,
          lapanganId: slot.lapanganId,
          slotWaktuId: slotId,
          totalHarga: totalHarga,
          status: "MENUNGGU",
        }
      });

      // 3. Buat tagihan pembayaran
      await tx.pembayaran.create({
        data: {
          pemesananId: p.idPemesanan,
          jumlah: totalHarga,
          status: "MENUNGGU",
          metodeBayar: "Transfer Manual"
        }
      });

      return p;
    });

    revalidatePath("/dashboard/pelanggan/pesan");
    return { sukses: true, pesananId: pesanan.idPemesanan };
  } catch (error) {
    console.error("Booking err:", error);
    return { sukses: false, pesan: "Terjadi kesalahan sistem, silakan coba lagi." };
  }
}

export async function hapusPesananBatal(pemesananId: string) {
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) return { sukses: false, pesan: "Harap login" };

  try {
    const pesanan = await prisma.pemesanan.findUnique({
      where: { idPemesanan: pemesananId, penggunaId: sesi.penggunaId }
    });

    if (!pesanan) return { sukses: false, pesan: "Pesanan tidak ditemukan" };

    if (pesanan.status !== "MENUNGGU") {
      return { sukses: false, pesan: "Pesanan tidak dapat dibatalkan" };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Hapus pembayaran terlebih dahulu
      await tx.pembayaran.deleteMany({
        where: { pemesananId: pemesananId }
      });

      // 2. Hapus pemesanan
      await tx.pemesanan.delete({
        where: { idPemesanan: pemesananId }
      });

      // 3. Set slotwaktu menjadi tidak dipesan
      await tx.slotwaktu.update({
        where: { idSlotwaktu: pesanan.slotWaktuId },
        data: { sudahDipesan: false }
      });
    });

    revalidatePath("/dashboard/pelanggan/pesan");
    return { sukses: true };
  } catch (error) {
    console.error("Gagal menghapus pesanan batal:", error);
    return { sukses: false, pesan: "Gagal membatalkan pesanan" };
  }
}

// Upload bukti bayar secara manual mock (simulasi ubah bayar)
export async function bayarPesanan(pembayaranId: string) {
  try {
    await prisma.pembayaran.update({
      where: { idPembayaran: pembayaranId },
      data: { status: "MENUNGGU" } // Tetap menunggu verifikasi admin, namun bisa kita buat log / notif
    });
    // Jika upload berhasil
    revalidatePath("/dashboard/pelanggan/riwayat");
    return { sukses: true };
  } catch(e) {
    return { sukses: false };
  }
}

export async function beriRating(pemesananId: string, rating: number, ulasan: string) {
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) return { sukses: false, pesan: "Harap login" };

  try {
    await prisma.pemesanan.update({
      where: { idPemesanan: pemesananId, penggunaId: sesi.penggunaId },
      data: { rating, ulasan }
    });
    revalidatePath("/dashboard/pelanggan/riwayat");
    revalidatePath("/dashboard/pelanggan/rating");
    return { sukses: true };
  } catch(e) {
    console.error("Gagal beri rating:", e);
    return { sukses: false, pesan: "Terjadi kesalahan" };
  }
}

import bcrypt from "bcryptjs";

export async function gantiPassword(formData: FormData) {
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) return { success: false, message: "Harap login" };

  const passwordLama = formData.get("passwordLama") as string;
  const passwordBaru = formData.get("passwordBaru") as string;

  if (!passwordLama || !passwordBaru) return { success: false, message: "Lengkapi form" };

  try {
    const pengguna = await prisma.pengguna.findUnique({ where: { idPengguna: sesi.penggunaId } });
    if (!pengguna) return { success: false, message: "Pengguna tidak ditemukan" };

    const cocok = await bcrypt.compare(passwordLama, pengguna.kataSandi);
    if (!cocok) return { success: false, message: "Kata sandi lama salah" };

    const kataSandiHash = await bcrypt.hash(passwordBaru, 12);
    await prisma.pengguna.update({
      where: { idPengguna: sesi.penggunaId },
      data: { kataSandi: kataSandiHash }
    });

    return { success: true, message: "Kata sandi berhasil diubah" };
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan sistem" };
  }
}

export async function reschedulePesanan(pemesananId: string, slotBaruId: string) {
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) return { sukses: false, pesan: "Harap login" };

  try {
    const pesanan = await prisma.pemesanan.findUnique({
      where: { idPemesanan: pemesananId, penggunaId: sesi.penggunaId },
      include: { slotWaktu: true }
    });

    if (!pesanan) return { sukses: false, pesan: "Pesanan tidak ditemukan" };
    if (pesanan.status !== "DIKONFIRMASI" && pesanan.status !== "MENUNGGU") {
      return { sukses: false, pesan: "Status pesanan tidak memungkinkan untuk reschedule" };
    }

    const slotBaru = await prisma.slotwaktu.findUnique({ where: { idSlotwaktu: slotBaruId } });
    if (!slotBaru || slotBaru.sudahDipesan || slotBaru.diblokir) {
      return { sukses: false, pesan: "Slot baru sudah tidak tersedia" };
    }

    // Eksekusi pemindahan slot
    await prisma.$transaction([
      // 1. Lepas slot lama
      prisma.slotwaktu.update({
        where: { idSlotwaktu: pesanan.slotWaktuId },
        data: { sudahDipesan: false }
      }),
      // 2. Ambil slot baru
      prisma.slotwaktu.update({
        where: { idSlotwaktu: slotBaruId },
        data: { sudahDipesan: true }
      }),
      // 3. Update data pemesanan
      prisma.pemesanan.update({
        where: { idPemesanan: pemesananId },
        data: { 
          slotWaktuId: slotBaruId,
          lapanganId: slotBaru.lapanganId 
        }
      })
    ]);

    revalidatePath("/dashboard/pelanggan/riwayat");
    return { sukses: true };
  } catch (error) {
    console.error("Reschedule err:", error);
    return { sukses: false, pesan: "Terjadi kesalahan sistem." };
  }
}
