import { redirect } from "next/navigation";
import { ambilSesi } from "@/app/lib/sesi";
import { prisma } from "@/app/lib/db";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

export default async function PelangganLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesi = await ambilSesi();
  if (!sesi || sesi.peran !== "PELANGGAN") redirect("/masuk");

  const pengguna = await prisma.pengguna.findUnique({
    where: { idPengguna: sesi.penggunaId },
    select: { nama: true },
  });

  if (!pengguna) redirect("/masuk");

  const inisial = pengguna.nama.charAt(0).toUpperCase();

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <input type="checkbox" id="burger-toggle" className="burger-checkbox" />
        <div className="sidebar-header-mobile">
          <span className="sidebar-logo-mobile">Garuda Nusantara</span>
          <label htmlFor="burger-toggle" className="burger-label">☰</label>
        </div>
        <div className="sidebar-logo">
          <span className="sidebar-logo-teks">GOR Garuda Nusantara</span>
        </div>
        <nav className="sidebar-nav">
          <p className="sidebar-label">Menu Member</p>
          <Link href="/dashboard/pelanggan" className="sidebar-item">
            <span className="sidebar-ikon">🏠</span> Beranda
          </Link>
          <Link href="/dashboard/pelanggan/pesan" className="sidebar-item">
            <span className="sidebar-ikon">🏸</span> Pesan Lapangan
          </Link>
          <Link href="/dashboard/pelanggan/riwayat" className="sidebar-item">
            <span className="sidebar-ikon">🧾</span> Riwayat & Tagihan
          </Link>
          <Link href="/dashboard/pelanggan/rating" className="sidebar-item">
            <span className="sidebar-ikon">⭐</span> Ulasan & Rating
          </Link>
          <Link href="/dashboard/pelanggan/pengaturan" className="sidebar-item">
            <span className="sidebar-ikon">⚙️</span> Pengaturan Akun
          </Link>
        </nav>
        <div className="sidebar-bawah">
          <div className="sidebar-pengguna">
            <div className="sidebar-avatar">{inisial}</div>
            <div className="sidebar-info">
              <p className="sidebar-nama">{pengguna.nama}</p>
              <p className="sidebar-peran">Member Aktif</p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="sidebar-item" style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--merah)",
              marginTop: "0.25rem",
            }}>
              <span className="sidebar-ikon">🚪</span> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="konten-utama">
        {children}
      </div>
    </div>
  );
}
