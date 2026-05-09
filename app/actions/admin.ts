"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import { z } from "zod";

// =======================
// Aksi Lapangan
// =======================
const FormLapangan = z.object({
  nama: z.string().min(1, "Nama lapangan wajib diisi"),
  tipe: z.enum(["VINYL", "KARPET", "KAYU", "BETON"]),
  hargaPerJam: z.coerce.number().min(1000, "Harga tidak valid"),
});

export async function tambahLapangan(prevState: any, formData: FormData) {
  const data = {
    nama: formData.get("nama"),
    tipe: formData.get("tipe")?.toString().toUpperCase(),
    hargaPerJam: formData.get("hargaPerJam"),
  };

  const validasi = FormLapangan.safeParse(data);

  if (!validasi.success) {
    return { pesan: "Data tidak valid" };
  }

  try {
    const caps = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    
    await prisma.lapangan.create({
      data: {
        nama: validasi.data.nama,
        deskripsi: `Lantai ${caps(validasi.data.tipe)}`,
        hargaPerJam: validasi.data.hargaPerJam,
      },
    });
    revalidatePath("/dashboard/admin/lapangan");
    return { sukses: "Lapangan berhasil ditambahkan" };
  } catch (error) {
    console.error("DEBUG PRISMA CREATE ERROR:", error);
    return { pesan: "Gagal menyimpan ke database" };
  }
}

export async function hapusLapangan(id: string) {
  try {
    await prisma.lapangan.delete({ where: { idLapangan: id } });
    revalidatePath("/dashboard/admin/lapangan");
  } catch (error) {
    // Abaikan jika error constraint
    console.error(error);
  }
}

export async function ubahStatusLapangan(id: string, status: "TERSEDIA" | "PERAWATAN" | "TUTUP") {
  try {
    await prisma.lapangan.update({
      where: { idLapangan: id },
      data: { status },
    });
    revalidatePath("/dashboard/admin/lapangan");
    return { sukses: true };
  } catch (error) {
    console.error(error);
    return { sukses: false };
  }
}

// =======================
// Aksi Jadwal (Slot waktu)
// =======================
export async function tambahJadwalKhusus(
  lapanganId: string,
  tanggal: Date,
  jamMulai: string, // Format "09:00"
  jamSelesai: string // Format "10:00"
) {
  try {
    await prisma.slotwaktu.create({
      data: {
        lapanganId,
        tanggal,
        jamMulai,
        jamSelesai,
        sudahDipesan: false,
        diblokir: false,
      },
    });
    revalidatePath("/dashboard/admin/jadwal");
    return { sukses: true };
  } catch (error) {
    return { sukses: false, pesan: "Gagal membuat jadwal" };
  }
}

export async function autoGenerateJadwal(tanggalStr: string, lapanganId: string) {
  // Generate jadwal otomatis dari jam 09:00 - 22:00
  try {
    const tgl = new Date(`${tanggalStr}T00:00:00.000Z`);
    
    // Looping dari jam 9 sampai 21 (untuk selesainya jam 22)
    const promises = [];
    for (let i = 9; i < 22; i++) {
      const jMulaiStr = `${i.toString().padStart(2, "0")}:00`;
      const jSelesaiStr = `${(i + 1).toString().padStart(2, "0")}:00`;

      // Cek apakah sudah ada untuk menghindari duplikat
      promises.push(
        prisma.slotwaktu.upsert({
          where: {
            lapanganId_tanggal_jamMulai: {
              lapanganId,
              tanggal: tgl,
              jamMulai: jMulaiStr,
            }
          },
          update: {},
          create: {
            lapanganId,
            tanggal: tgl,
            jamMulai: jMulaiStr,
            jamSelesai: jSelesaiStr,
            sudahDipesan: false,
            diblokir: false,
          }
        })
      );
    }

    await Promise.all(promises);
    revalidatePath("/dashboard/admin/jadwal");
    return { sukses: "Berhasil membuat jadwal" };
  } catch (error) {
    console.error(error);
    return { pesan: "Gagal membuat jadwal" };
  }
}

export async function ubahStatusJadwal(id: string, diblokir: boolean) {
  await prisma.slotwaktu.update({
    where: { idSlotwaktu: id },
    data: { diblokir },
  });
  revalidatePath("/dashboard/admin/jadwal");
}

export async function hapusJadwal(id: string) {
  await prisma.slotwaktu.delete({ where: { idSlotwaktu: id } });
  revalidatePath("/dashboard/admin/jadwal");
}

// =======================
// Aksi Verifikasi Pembayaran
// =======================
export async function konfirmasiPembayaran(pembayaranId: string, pemesananId: string) {
  try {
    // Set pembayaran LUNAS
    await prisma.pembayaran.update({
      where: { idPembayaran: pembayaranId },
      data: { status: "LUNAS", dibayarPada: new Date() },
    });

    // Set pemesanan DIKONFIRMASI
    await prisma.pemesanan.update({
      where: { idPemesanan: pemesananId },
      data: { status: "DIKONFIRMASI" },
    });

    revalidatePath("/dashboard/admin/pembayaran");
    revalidatePath("/dashboard/admin/booking");
    return { sukses: true };
  } catch (e) {
    return { sukses: false };
  }
}

export async function tolakPembayaran(pembayaranId: string, pemesananId: string) {
  try {
    // Set pembayaran GAGAL
    await prisma.pembayaran.update({
      where: { idPembayaran: pembayaranId },
      data: { status: "GAGAL" },
    });

    // Set pemesanan DIBATALKAN
    await prisma.pemesanan.update({
      where: { idPemesanan: pemesananId },
      data: { status: "DIBATALKAN" },
    });

    // Kembalikan ketersediaan slotwaktu
    const pesanan = await prisma.pemesanan.findUnique({
      where: { idPemesanan: pemesananId },
      include: { slotWaktu: true },
    });

    if (pesanan && pesanan.slotWaktu) {
      await prisma.slotwaktu.update({
        where: { idSlotwaktu: pesanan.slotWaktu.idSlotwaktu },
        data: { sudahDipesan: false },
      });
    }

    revalidatePath("/dashboard/admin/pembayaran");
    return { sukses: true };
  } catch (e) {
    return { sukses: false };
  }
}

export async function selesaikanBooking(pemesananId: string) {
  try {
    await prisma.pemesanan.update({
      where: { idPemesanan: pemesananId },
      data: { status: "SELESAI" },
    });
    revalidatePath("/dashboard/admin/booking");
    revalidatePath("/dashboard/pelanggan/riwayat");
    return { sukses: true };
  } catch (e) {
    return { sukses: false };
  }
}

export async function bookingLangsung(slotId: string, namaCustomer: string) {
  if (!namaCustomer || namaCustomer.trim() === "") {
    return { sukses: false, pesan: "Nama customer wajib diisi" };
  }
  try {
    const slot = await prisma.slotwaktu.findUnique({
      where: { idSlotwaktu: slotId },
      include: { lapangan: true }
    });

    if (!slot || slot.sudahDipesan || slot.diblokir) {
      return { sukses: false, pesan: "Slot tidak tersedia" };
    }

    // Cari atau buat user "Guest" untuk offline booking
    let userGuest = await prisma.pengguna.findFirst({
      where: { email: "guest@gor.com" }
    });

    if (!userGuest) {
      userGuest = await prisma.pengguna.create({
        data: {
          nama: "Customer Offline",
          email: "guest@gor.com",
          kataSandi: "offline-booking-no-password", // Tidak bisa login
          peran: "PELANGGAN",
          aktif: true
        }
      });
    }

    const kodeUnik = `OFF-${Date.now().toString().slice(-6)}`;

    await prisma.$transaction(async (tx) => {
      // 1. Update slot
      await tx.slotwaktu.update({
        where: { idSlotwaktu: slotId },
        data: { sudahDipesan: true }
      });

      // 2. Buat Pemesanan (Langsung DIKONFIRMASI)
      const p = await tx.pemesanan.create({
        data: {
          kodePemesanan: kodeUnik,
          penggunaId: userGuest.idPengguna,
          lapanganId: slot.lapanganId,
          slotWaktuId: slotId,
          totalHarga: slot.lapangan.hargaPerJam,
          status: "DIKONFIRMASI",
          ulasan: `Booking Langsung: ${namaCustomer}`
        }
      });

      // 3. Buat Pembayaran (Langsung LUNAS)
      await tx.pembayaran.create({
        data: {
          pemesananId: p.idPemesanan,
          jumlah: slot.lapangan.hargaPerJam,
          status: "LUNAS",
          metodeBayar: "Tunai (Offline)",
          dibayarPada: new Date()
        }
      });
    });

    revalidatePath("/dashboard/admin/jadwal");
    revalidatePath("/dashboard/admin/booking");
    return { sukses: true };
  } catch (error) {
    console.error(error);
    return { sukses: false, pesan: "Terjadi kesalahan sistem" };
  }
}
