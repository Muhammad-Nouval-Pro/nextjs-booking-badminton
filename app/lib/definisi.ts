// Tipe-tipe dan validasi form menggunakan Zod

import { z } from "zod";

// ========================
// Schema Registrasi
// ========================
export const SchemaRegistrasi = z.object({
  nama: z
    .string()
    .min(2, { message: "Nama minimal 2 karakter." })
    .trim(),
  email: z
    .string()
    .email({ message: "Format email tidak valid." })
    .trim(),
  nomorHp: z
    .string()
    .min(10, { message: "Nomor HP minimal 10 digit." })
    .optional()
    .or(z.literal("")),
  kataSandi: z
    .string()
    .min(8, { message: "Kata sandi minimal 8 karakter." })
    .trim(),
});

// ========================
// Schema Login
// ========================
export const SchemaLogin = z.object({
  email: z
    .string()
    .email({ message: "Format email tidak valid." })
    .trim(),
  kataSandi: z
    .string()
    .min(1, { message: "Kata sandi tidak boleh kosong." })
    .trim(),
});

// ========================
// Schema Lupa Password
// ========================
export const SchemaLupaPassword = z.object({
  email: z
    .string()
    .email({ message: "Format email tidak valid." })
    .trim(),
  nomorHp: z
    .string()
    .min(10, { message: "Nomor HP minimal 10 digit." })
    .trim(),
  kataSandiBaru: z
    .string()
    .min(8, { message: "Kata sandi baru minimal 8 karakter." })
    .trim(),
});

// ========================
// Tipe State Form
// ========================
export type StateForm =
  | {
      errors?: {
        nama?: string[];
        email?: string[];
        nomorHp?: string[];
        kataSandi?: string[];
        kataSandiBaru?: string[];
      };
      pesan?: string;
      berhasil?: boolean;
    }
  | undefined;

// ========================
// Tipe Payload Sesi
// ========================
export type PayloadSesi = {
  penggunaId: string;
  peran: "PEMILIK" | "ADMIN" | "PELANGGAN";
  kadaluarsaPada: Date;
};
