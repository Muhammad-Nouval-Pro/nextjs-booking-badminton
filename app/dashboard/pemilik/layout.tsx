import { redirect } from "next/navigation";
import { ambilSesi } from "@/app/lib/sesi";
import { prisma } from "@/app/lib/db";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

export default async function PemilikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesi = await ambilSesi();
  if (!sesi || sesi.peran !== "PEMILIK") redirect("/masuk");

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
          <p className="sidebar-label">Monitoring</p>
          <Link href="/dashboard/pemilik" className="sidebar-item">
            <span className="sidebar-ikon">🏠</span> Dashboard
          </Link>
          <Link href="/dashboard/pemilik/laporan-booking" className="sidebar-item">
            <span className="sidebar-ikon">📋</span> Laporan Booking
          </Link>
          <Link href="/dashboard/pemilik/laporan-pendapatan" className="sidebar-item">
            <span className="sidebar-ikon">💰</span> Laporan Pendapatan
          </Link>
          <Link href="/dashboard/pemilik/pelanggan" className="sidebar-item">
            <span className="sidebar-ikon">👤</span> Kelola Pelanggan
          </Link>
          <p className="sidebar-label" style={{ marginTop: "1rem" }}>Petugas</p>
          <Link href="/dashboard/pemilik/admin" className="sidebar-item">
            <span className="sidebar-ikon">👥</span> Kelola Admin
          </Link>
        </nav>
        <div className="sidebar-bawah">
          <div className="sidebar-pengguna">
            <div className="sidebar-avatar">{inisial}</div>
            <div className="sidebar-info">
              <p className="sidebar-nama">{pengguna.nama}</p>
              <p className="sidebar-peran">Pemilik</p>
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
