"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SchemaAdmin = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  kataSandi: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export async function tambahAdmin(prevState: any, formData: FormData) {
  const data = {
    nama: formData.get("nama"),
    email: formData.get("email"),
    kataSandi: formData.get("kataSandi"),
  };

  const validasi = SchemaAdmin.safeParse(data);

  if (!validasi.success) {
    return { errors: validasi.error.flatten().fieldErrors };
  }

  const { nama, email, kataSandi } = validasi.data;

  try {
    // Cek email duplikat
    const ada = await prisma.pengguna.findUnique({ where: { email } });
    if (ada) return { pesan: "Email sudah digunakan" };

    const hash = await bcrypt.hash(kataSandi, 12);

    await prisma.pengguna.create({
      data: {
        nama,
        email,
        kataSandi: hash,
        peran: "ADMIN",
        aktif: true,
      },
    });

    revalidatePath("/dashboard/pemilik/admin");
    return { sukses: "Admin berhasil ditambahkan" };
  } catch (error) {
    return { pesan: "Gagal menambahkan admin" };
  }
}

export async function hapusAdmin(id: string) {
  try {
    await prisma.pengguna.delete({
      where: { idPengguna: id, peran: "ADMIN" }
    });
    revalidatePath("/dashboard/pemilik/admin");
    return { sukses: true };
  } catch (error) {
    return { sukses: false, pesan: "Gagal menghapus admin" };
  }
}
