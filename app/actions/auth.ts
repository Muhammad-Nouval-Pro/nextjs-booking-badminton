"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/db";
import { buatSesi, hapusSesi } from "@/app/lib/sesi";
import {
  SchemaRegistrasi,
  SchemaLogin,
  type StateForm,
} from "@/app/lib/definisi";

// ========================
// Aksi: Registrasi
// ========================
export async function registrasi(
  state: StateForm,
  formData: FormData
): Promise<StateForm> {
  // 1. Validasi field form
  const validasi = SchemaRegistrasi.safeParse({
    nama: formData.get("nama"),
    email: formData.get("email"),
    nomorHp: formData.get("nomorHp"),
    kataSandi: formData.get("kataSandi"),
  });

  if (!validasi.success) {
    return { errors: validasi.error.flatten().fieldErrors };
  }

  const { nama, email, nomorHp, kataSandi } = validasi.data;

  // 2. Cek apakah email sudah digunakan
  const penggunaAda = await prisma.pengguna.findUnique({ where: { email } });
  if (penggunaAda) {
    return { pesan: "Email sudah terdaftar. Silakan gunakan email lain." };
  }

  // 3. Hash kata sandi
  const kataSandiHash = await bcrypt.hash(kataSandi, 12);

  // 4. Simpan pengguna baru ke database
  const pengguna = await prisma.pengguna.create({
    data: {
      nama,
      email,
      nomorHp: nomorHp || null,
      kataSandi: kataSandiHash,
      peran: "PELANGGAN",
    },
  });

  // 5. Kembalikan status berhasil (Tanpa auto-login)
  return { berhasil: true, pesan: "Akun berhasil dibuat! Silakan masuk untuk mulai memesan." };
}

// ========================
// Aksi: Login
// ========================
export async function login(
  state: StateForm,
  formData: FormData
): Promise<StateForm> {
  // 1. Validasi field form
  const validasi = SchemaLogin.safeParse({
    email: formData.get("email"),
    kataSandi: formData.get("kataSandi"),
  });

  if (!validasi.success) {
    return { errors: validasi.error.flatten().fieldErrors };
  }

  const { email, kataSandi } = validasi.data;

  // 2. Cek apakah pengguna ada
  const pengguna = await prisma.pengguna.findUnique({ where: { email } });
  if (!pengguna) {
    return { pesan: "Email atau kata sandi salah." };
  }

  // 3. Verifikasi kata sandi
  const kataSandiCocok = await bcrypt.compare(kataSandi, pengguna.kataSandi);
  if (!kataSandiCocok) {
    return { pesan: "Email atau kata sandi salah." };
  }

  // 4. Cek akun masih aktif
  if (!pengguna.aktif) {
    return { pesan: "Akun Anda telah dinonaktifkan. Hubungi admin." };
  }

  // 5. Buat sesi dan redirect sesuai peran
  await buatSesi(pengguna.id, pengguna.peran);

  if (pengguna.peran === "PEMILIK") redirect("/dashboard/pemilik");
  if (pengguna.peran === "ADMIN") redirect("/dashboard/admin");
  redirect("/dashboard/pelanggan");
}

// ========================
// Aksi: Logout
// ========================
export async function logout() {
  await hapusSesi();
  redirect("/masuk");
}

// ========================
// Aksi: Lupa Password
// ========================
import { SchemaLupaPassword } from "@/app/lib/definisi";

export async function lupaPassword(
  state: StateForm,
  formData: FormData
): Promise<StateForm> {
  // 1. Validasi field form
  const validasi = SchemaLupaPassword.safeParse({
    email: formData.get("email"),
    nomorHp: formData.get("nomorHp"),
    kataSandiBaru: formData.get("kataSandiBaru"),
  });

  if (!validasi.success) {
    return { errors: validasi.error.flatten().fieldErrors };
  }

  const { email, nomorHp, kataSandiBaru } = validasi.data;

  // 2. Cek apakah pengguna ada
  const pengguna = await prisma.pengguna.findUnique({ where: { email } });
  if (!pengguna) {
    return { pesan: "Email atau nomor HP tidak ditemukan." };
  }

  // 3. Verifikasi nomor HP
  if (pengguna.nomorHp !== nomorHp) {
    return { pesan: "Email atau nomor HP tidak ditemukan." };
  }

  // 4. Hash kata sandi baru
  const kataSandiHash = await bcrypt.hash(kataSandiBaru, 12);

  // 5. Update kata sandi di database
  await prisma.pengguna.update({
    where: { email },
    data: { kataSandi: kataSandiHash },
  });

  return { berhasil: true, pesan: "Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru." };
}
