import Link from "next/link";
import { redirect } from "next/navigation";
import { ambilSesi } from "@/app/lib/sesi";

export default async function HalamanUtama() {
  // Redirect jika sudah login
  const sesi = await ambilSesi();
  if (sesi) {
    if (sesi.peran === "PEMILIK") redirect("/dashboard/pemilik");
    if (sesi.peran === "ADMIN") redirect("/dashboard/admin");
    redirect("/dashboard/pelanggan");
  }

  return (
    <main>
      {/* Navbar */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "white",
        borderBottom: "1px solid var(--abu-200)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* <span style={{ fontSize: "1.5rem" }}>🏸</span> */}
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>GOR Garuda Nusantara</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/masuk" style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            border: "1.5px solid var(--abu-200)",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "var(--abu-700)",
            transition: "all var(--transisi)",
          }}>
            Masuk
          </Link>
          <Link href="/daftar" style={{
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, var(--biru-primer), var(--biru-muda))",
            color: "white",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}>
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "5rem 2rem",
        textAlign: "center",
        background: "linear-gradient(180deg, var(--biru-bg) 0%, white 100%)",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--biru-bg)",
            border: "1px solid var(--biru-border)",
            borderRadius: "999px",
            padding: "0.35rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--biru-primer)",
            marginBottom: "1.5rem",
          }}>
            🏸 Tersedia 5 Lapangan Badminton
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.15,
            marginBottom: "1.25rem",
            color: "var(--abu-900)",
          }}>
            Pesan Lapangan Badminton{" "}
            <span style={{ color: "var(--biru-primer)" }}>Lebih Mudah</span>
          </h1>
          <p style={{
            fontSize: "1.1rem",
            color: "var(--abu-500)",
            maxWidth: "520px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}>
            Cek ketersediaan lapangan, pilih slot waktu, dan bayar secara online.
            Jam operasional 09:00–22:00 setiap hari.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/daftar" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.9rem 2rem",
              background: "linear-gradient(135deg, var(--biru-primer), var(--biru-muda))",
              color: "white",
              borderRadius: "var(--radius-sm)",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "var(--bayangan-biru)",
            }}>
              Mulai Pesan Sekarang →
            </Link>
            <Link href="/masuk" style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.9rem 2rem",
              border: "1.5px solid var(--abu-200)",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              color: "var(--abu-700)",
              background: "white",
            }}>
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section style={{
        padding: "6rem 2rem",
        background: "white",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "850px", margin: "0 auto" }}>
          <span style={{
            fontSize: "4rem",
            color: "var(--biru-bg)",
            lineHeight: 0,
            display: "block",
            marginBottom: "1.5rem",
            fontFamily: "serif"
          }}>&ldquo;</span>
          <p style={{
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 700,
            color: "var(--abu-900)",
            lineHeight: 1.5,
            fontStyle: "italic",
            marginBottom: "2rem",
            letterSpacing: "-0.01em"
          }}>
            &quot;Berikan aku 1.000 orang tua, niscaya akan kucabut Semeru dari akar-akarnya. Berikan aku 10 pemuda, niscaya akan kuguncangkan dunia&quot;
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <div style={{ width: "40px", height: "1px", background: "var(--abu-200)" }}></div>
            <span style={{
              fontWeight: 700,
              color: "var(--biru-primer)",
              fontSize: "0.95rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em"
            }}>Ir. Soekarno</span>
            <div style={{ width: "40px", height: "1px", background: "var(--abu-200)" }}></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--abu-200)",
        padding: "2rem",
        textAlign: "center",
        color: "var(--abu-500)",
        fontSize: "0.875rem",
      }}>
        GOR Garuda Nusantara
      </footer>
    </main>
  );
}
