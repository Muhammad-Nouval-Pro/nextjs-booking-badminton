import { prisma } from "@/app/lib/db";
import { FormTambahAdmin, TabelAdmin } from "@/app/dashboard/pemilik/admin/client";

export default async function KelolaAdmin() {
  const daftarAdminRaw = await prisma.pengguna.findMany({
    where: { peran: "ADMIN" },
    orderBy: { nama: "asc" },
  });

  const daftarAdmin = daftarAdminRaw.map((a) => ({
    idPengguna: a.idPengguna,
    nama: a.nama,
    email: a.email,
  }));

  return (
    <>
      <div className="konten-header">
        <h1>Kelola Admin</h1>
      </div>
      <div className="konten-body">
        <FormTambahAdmin />
        <TabelAdmin daftarAdmin={daftarAdmin} />
      </div>
    </>
  );
}
