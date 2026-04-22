-- CreateEnum
CREATE TYPE "Peran" AS ENUM ('PEMILIK', 'ADMIN', 'PELANGGAN');

-- CreateEnum
CREATE TYPE "StatusLapangan" AS ENUM ('TERSEDIA', 'PERAWATAN', 'TUTUP');

-- CreateEnum
CREATE TYPE "StatusPemesanan" AS ENUM ('MENUNGGU', 'DIKONFIRMASI', 'DIBATALKAN', 'SELESAI');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('MENUNGGU', 'LUNAS', 'GAGAL');

-- CreateEnum
CREATE TYPE "TipeNotifikasi" AS ENUM ('BOOKING_DIKONFIRMASI', 'PEMBAYARAN_BERHASIL', 'BOOKING_DIBATALKAN', 'PENGINGAT');

-- CreateTable
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kataSandi" TEXT NOT NULL,
    "nomorHp" TEXT,
    "peran" "Peran" NOT NULL DEFAULT 'PELANGGAN',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lapangan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "hargaPerJam" DECIMAL(10,2) NOT NULL,
    "urlFoto" TEXT,
    "status" "StatusLapangan" NOT NULL DEFAULT 'TERSEDIA',
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lapangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_waktu" (
    "id" TEXT NOT NULL,
    "lapanganId" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
    "sudahDipesan" BOOLEAN NOT NULL DEFAULT false,
    "diblokir" BOOLEAN NOT NULL DEFAULT false,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slot_waktu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemesanan" (
    "id" TEXT NOT NULL,
    "kodePemesanan" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "lapanganId" TEXT NOT NULL,
    "slotWaktuId" TEXT NOT NULL,
    "totalHarga" DECIMAL(10,2) NOT NULL,
    "status" "StatusPemesanan" NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pemesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" TEXT NOT NULL,
    "pemesananId" TEXT NOT NULL,
    "jumlah" DECIMAL(10,2) NOT NULL,
    "metodeBayar" TEXT,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'MENUNGGU',
    "idOrderGateway" TEXT,
    "idTransaksiGateway" TEXT,
    "responGateway" JSONB,
    "dibayarPada" TIMESTAMP(3),
    "kadaluarsaPada" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "penggunaId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" "TipeNotifikasi" NOT NULL,
    "sudahDibaca" BOOLEAN NOT NULL DEFAULT false,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "slot_waktu_lapanganId_tanggal_jamMulai_key" ON "slot_waktu"("lapanganId", "tanggal", "jamMulai");

-- CreateIndex
CREATE UNIQUE INDEX "pemesanan_kodePemesanan_key" ON "pemesanan"("kodePemesanan");

-- CreateIndex
CREATE UNIQUE INDEX "pemesanan_slotWaktuId_key" ON "pemesanan"("slotWaktuId");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_pemesananId_key" ON "pembayaran"("pemesananId");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_idOrderGateway_key" ON "pembayaran"("idOrderGateway");

-- AddForeignKey
ALTER TABLE "slot_waktu" ADD CONSTRAINT "slot_waktu_lapanganId_fkey" FOREIGN KEY ("lapanganId") REFERENCES "lapangan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanan" ADD CONSTRAINT "pemesanan_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanan" ADD CONSTRAINT "pemesanan_lapanganId_fkey" FOREIGN KEY ("lapanganId") REFERENCES "lapangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pemesanan" ADD CONSTRAINT "pemesanan_slotWaktuId_fkey" FOREIGN KEY ("slotWaktuId") REFERENCES "slot_waktu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_pemesananId_fkey" FOREIGN KEY ("pemesananId") REFERENCES "pemesanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
