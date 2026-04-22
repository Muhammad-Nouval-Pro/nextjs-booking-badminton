import { prisma } from "@/app/lib/db";
import { ambilSesi } from "@/app/lib/sesi";
import Link from "next/link";

export default async function DashboardPelanggan() {
  const sesi = await ambilSesi();
  const userId = sesi?.penggunaId;

  // Tagihan yang Menunggu
  const tagihanMenunggu = await prisma.pembayaran.count({
    where: {
      status: "MENUNGGU",
      pemesanan: { penggunaId: userId }
    }
  });

  const riwayatMain = await prisma.pemesanan.count({
    where: {
      penggunaId: userId,
      status: "SELESAI"
    }
  });

  // Ambil semua rating dan ulasan
  const ulasanPelanggan = await prisma.pemesanan.findMany({
    where: {
      rating: { not: null },
      AND: [
        { ulasan: { not: null } },
        { ulasan: { not: "" } }
      ]
    },
    include: {
      pengguna: {
        select: { nama: true }
      }
    },
    orderBy: { dibuatPada: "desc" },
    take: 6
  });

  return (
    <>
      <div className="konten-header">
        <h1>Dashboard Member</h1>
      </div>
      <div className="konten-body">
        {/* Banner GOR */}
        <div style={{
          marginBottom: "1rem",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
        }}>
          <img
            src="/Garuda Nusantara.png"
            alt="GOR Garuda Nusantara"
            style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
          />
        </div>

        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--abu-900)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
            Garuda Nusantara Badminton Center
          </h2>
          {/* <p style={{ color: "var(--abu-500)", fontSize: "0.95rem" }}>
            Modern Multi-Sport Facility & Badminton Court
          </p> */}
        </div>

        {/* <div className="grid-statistik">
          <div className="kartu-statistik">
            <div className="kartu-statistik-atas">
              <span className="kartu-statistik-label">Tagihan Belum Dibayar</span>
              <div className="kartu-statistik-ikon ikon-merah">💳</div>
            </div>
            <div className="kartu-statistik-nilai">{tagihanMenunggu}</div>
            <div className="kartu-statistik-sub">Harap lunasi untuk main</div>
          </div>
          <div className="kartu-statistik">
            <div className="kartu-statistik-atas">
              <span className="kartu-statistik-label">Sesi Selesai</span>
              <div className="kartu-statistik-ikon ikon-biru">🏸</div>
            </div>
            <div className="kartu-statistik-nilai">{riwayatMain}</div>
            <div className="kartu-statistik-sub">Kali main tercatat</div>
          </div>
        </div> */}

        {/* Lokasi Venue */}
        <div className="kartu" style={{
          marginTop: "2rem",
          padding: "0",
          overflow: "hidden",
          display: "flex",
          flexWrap: "wrap",
          background: "white",
          border: "1px solid var(--abu-200)"
        }}>
          <div style={{ flex: "1 1 300px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 700 }}>Lokasi Venue</h3>
            <p style={{ margin: 0, color: "var(--abu-600)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Jl. Pintu Satu Senayan, Gelora, <br />
              Kecamatan Tanah Abang, Kota Jakarta Pusat, <br />
              DKI Jakarta 10270
            </p>
          </div>
          <div style={{
            flex: "1 1 250px",
            minHeight: "200px",
            backgroundImage: "url('/peta.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}>
            <a
              href="https://maps.google.com/?q=Istora+Senayan"
              target="_blank"
              style={{
                background: "white",
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--merah)",
                textDecoration: "none",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              📍 Buka Peta
            </a>
          </div>
        </div>

        {/* Fasilitas Section */}
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--abu-900)" }}>Fasilitas</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem"
          }}>
            {[
              // { ikon: "🍴", label: "Cafe & Resto" },
              { ikon: "🌭", label: "Jual Makanan Ringan" },
              { ikon: "🥤", label: "Jual Minuman" },
              { ikon: "🚗", label: "Parkir Mobil" },
              { ikon: "🏍️", label: "Parkir Motor" },
              { ikon: "🚿", label: "Ruang Ganti" },
            ].map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--abu-100)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem"
                }}>
                  {f.ikon}
                </div>
                <span style={{ fontWeight: 600, color: "var(--abu-800)", fontSize: "0.95rem" }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Paket Member Section */}
        <div style={{ marginTop: "3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--abu-900)" }}>Paket Member</h3>
              <p style={{ margin: "0.25rem 0 0", color: "var(--abu-500)", fontSize: "0.85rem" }}>Pilih paket hemat untuk bermain rutin</p>
            </div>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem"
          }}>
            {[
              {
                nama: "Paket Member 1",
                harga: "Rp 150.000",
                durasi: "/bulan",
                fitur: ["4x Main / Bulan", "Diskon 5% Booking Tambahan", "Booking Prioritas H-2"],
                warna: "linear-gradient(135deg, #A87E43, #D9B382)",
                bayangan: "0 10px 15px -3px rgba(168, 126, 67, 0.2)"
              },
              {
                nama: "Paket Member 2",
                harga: "Rp 275.000",
                durasi: "/bulan",
                fitur: ["8x Main / Bulan", "Diskon 10% Booking Tambahan", "Booking Prioritas H-3", "Gratis 2 Botol Air Mineral"],
                warna: "linear-gradient(135deg, #71717A, #A1A1AA)",
                bayangan: "0 10px 15px -3px rgba(113, 113, 122, 0.2)",
                populer: true
              },
              {
                nama: "Paket Member 3",
                harga: "Rp 500.000",
                durasi: "/bulan",
                fitur: ["16x Main / Bulan", "Diskon 20% Booking Tambahan", "Booking Prioritas H-7", "Gratis Sewa Raket & Sepatu", "Free Coffee at Cafe"],
                warna: "linear-gradient(135deg, #B59410, #FACC15)",
                bayangan: "0 10px 15px -3px rgba(181, 148, 16, 0.3)"
              },
            ].map((p) => (
              <div key={p.nama} className="kartu-premium" style={{
                position: "relative",
                background: "white",
                borderRadius: "1rem",
                padding: "2rem",
                border: p.populer ? "2px solid var(--biru-primer)" : "1px solid var(--abu-200)",
                boxShadow: p.populer ? "var(--bayangan-biru)" : "0 4px 6px -1px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease"
              }}>
                {p.populer && (
                  <div style={{
                    position: "absolute",
                    top: "-12px",
                    right: "20px",
                    background: "var(--biru-primer)",
                    color: "white",
                    padding: "2px 12px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}>
                    PALING POPULER
                  </div>
                )}
                <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: p.warna, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", boxShadow: p.bayangan }}>
                  <span style={{ fontSize: "1.5rem" }}>🏆</span>
                </div>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", fontWeight: 800 }}>{p.nama}</h4>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "1.5rem" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--abu-900)" }}>{p.harga}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--abu-500)" }}>{p.durasi}</span>
                </div>
                <div style={{ flexGrow: 1, marginBottom: "2rem" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
                    {p.fitur.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.9rem", color: "var(--abu-600)" }}>
                        <span style={{ color: "var(--hijau-500)", fontWeight: 800 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`https://wa.me/6283194228713?text=Halo%20Admin%20GOR%20Garuda%20Nusantara,%20saya%20tertarik%20untuk%20bergabung%20dengan%20Paket%20Member%20${p.nama}.%20Mohon%20informasi%20selanjutnya.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    background: p.populer ? "var(--biru-primer)" : "var(--abu-50)",
                    color: p.populer ? "white" : "var(--abu-900)",
                    border: p.populer ? "none" : "1.5px solid var(--abu-200)",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "all 0.2s"
                  }}
                >
                  Pilih Paket
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Pelanggan Section */}
        <div style={{ marginTop: "4rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--abu-900)" }}>Rating Pelanggan</h3>
              <p style={{ margin: "0.25rem 0 0", color: "var(--abu-500)", fontSize: "0.85rem" }}>Rating asli yang diberikan oleh pelanggan kami</p>
            </div>
            {ulasanPelanggan.length > 0 && (
              <Link href="#" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--biru-primer)", textDecoration: "none" }}>Lihat Semua →</Link>
            )}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: ulasanPelanggan.length > 0 ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr",
            gap: "1.5rem"
          }}>
            {ulasanPelanggan.length > 0 ? ulasanPelanggan.map((u) => (
              <div key={u.id} style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "1rem",
                border: "1px solid var(--abu-100)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--biru-bg)", color: "var(--biru-primer)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                      {u.pengguna?.nama?.[0] || "U"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--abu-900)" }}>{u.pengguna?.nama}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--abu-400)" }}>Pelanggan Terverifikasi</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: i < (u.rating || 0) ? "#FACC15" : "#E5E7EB", fontSize: "0.85rem" }}>⭐</span>
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--abu-600)", lineHeight: 1.6, fontStyle: "italic" }}>
                  &quot;{u.ulasan}&quot;
                </p>
              </div>
            )) : (
              <div style={{
                textAlign: "center",
                padding: "3rem",
                background: "var(--abu-50)",
                borderRadius: "1rem",
                border: "2px dashed var(--abu-200)",
                color: "var(--abu-500)"
              }}>
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "1rem" }}>💬</span>
                <p style={{ fontWeight: 600 }}>Belum ada ulasan dari pelanggan.</p>
                <p style={{ fontSize: "0.85rem" }}>Jadilah yang pertama memberikan ulasan setelah bermain!</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: "3rem", display: "flex", gap: "1rem", paddingBottom: "3rem" }}>
          <Link href="/dashboard/pelanggan/pesan" className="tombol-primer" style={{ textDecoration: "none", display: "inline-block" }}>
            Pesan Jadwal Sekarang
          </Link>
          {tagihanMenunggu > 0 && (
            <Link href="/dashboard/pelanggan/riwayat" className="tombol-outline" style={{ textDecoration: "none", display: "inline-block" }}>
              Cek Tagihan
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
