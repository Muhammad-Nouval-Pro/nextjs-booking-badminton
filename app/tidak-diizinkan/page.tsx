import Link from "next/link";

export default function HalamanTidakDiizinkan() {
  return (
    <div className="halaman-tengah">
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🚫</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        Akses Ditolak
      </h1>
      <p style={{ color: "var(--abu-500)", marginBottom: "2rem" }}>
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link href="/" style={{
        padding: "0.75rem 2rem",
        background: "linear-gradient(135deg, var(--biru-primer), var(--biru-muda))",
        color: "white",
        borderRadius: "var(--radius-sm)",
        fontWeight: 700,
      }}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
