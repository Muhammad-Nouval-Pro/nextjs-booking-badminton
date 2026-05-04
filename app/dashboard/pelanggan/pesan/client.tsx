"use client";

import { useState } from "react";
import { buatPesanan } from "@/app/actions/pelanggan";
import { useRouter } from "next/navigation";

export function ListJadwalTersedia({ jadwalLapangan }: { jadwalLapangan: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const aksiPilih = async (slotId: string, harga: number) => {
    if (!confirm("Anda yakin ingin memesan lapangan di jam ini?")) return;

    setLoadingId(slotId);
    const result = await buatPesanan(slotId, harga);
    if (result.sukses && result.pesananId) {
      try {
        const response = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pemesananId: result.pesananId }),
        });

        const data = await response.json();

        if (data.token) {
          (window as any).snap.pay(data.token, {
            onSuccess: function () {
              alert("Pesanan & Pembayaran Berhasil!");
              router.push("/dashboard/pelanggan/riwayat");
            },
            onPending: function () {
              alert("Pesanan dibuat, silakan selesaikan pembayaran.");
              router.push("/dashboard/pelanggan/riwayat");
            },
            onClose: function () {
              alert("Pesanan disimpan. Silakan bayar di menu Riwayat.");
              router.push("/dashboard/pelanggan/riwayat");
            },
          });
        } else {
          alert("Pesanan berhasil dibuat! Silakan bayar di riwayat.");
          router.push("/dashboard/pelanggan/riwayat");
        }
      } catch (err) {
        router.push("/dashboard/pelanggan/riwayat");
      }
    } else {
      alert(result.pesan);
      setLoadingId(null);
    }
  };


  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
      {jadwalLapangan.map((s) => (
        <div
          key={s.idSlotwaktu}
          className="kartu"
          style={{
            padding: "0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--bayangan-lg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--bayangan-sm)";
          }}
        >
          {/* Header Image */}
          <div style={{
            height: "140px",
            width: "100%",
            position: "relative",
            backgroundImage: `url(${s.lapangan.deskripsi?.toLowerCase().includes("beton") ? "/beton.png" :
              s.lapangan.deskripsi?.toLowerCase().includes("karpet") ? "/karpet.png" :
                s.lapangan.deskripsi?.toLowerCase().includes("vinyl") ? "/vinyl.png" :
                  // s.lapangan.deskripsi?.toLowerCase().includes("kayu") ? "/kayu.png" :
                  "/lapangan.png"
              })`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))",
              display: "flex",
              alignItems: "flex-end",
              padding: "1rem"
            }}>
              <h3 style={{ color: "white", margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
                {toTitleCase(s.lapangan.nama)}
              </h3>
            </div>
            <div style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255,255,255,0.9)",
              padding: "0.25rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: "700",
              color: "var(--biru-primer)"
            }}>
              {s.jamMulai} - {s.jamSelesai}
            </div>
          </div>

          <div style={{ padding: "1.25rem" }}>
            <p style={{
              margin: "0 0 1rem 0",
              color: "var(--abu-500)",
              fontSize: "0.85rem",
              lineHeight: "1.4",
              height: "2.8rem",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical"
            }}>
              {toTitleCase(s.lapangan.deskripsi || "Lantai Berkualitas Standar Profesional")}
            </p>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--abu-100)"
            }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--abu-500)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.05em" }}>Harga Sewa</span>
                <span style={{ fontWeight: "800", color: "var(--abu-900)", fontSize: "0.95rem" }}>
                  {formatRupiah(Number(s.lapangan.hargaPerJam))}
                  <small style={{ fontWeight: "400", fontSize: "0.7rem", color: "var(--abu-500)", marginLeft: "2px" }}>/jam</small>
                </span>
              </div>

              <button
                type="button"
                className="tombol-primer"
                style={{
                  width: "auto",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  background: s.sudahDipesan || s.diblokir ? "var(--abu-200)" : "linear-gradient(135deg, var(--biru-primer), var(--biru-muda))"
                }}
                disabled={s.sudahDipesan || s.diblokir || loadingId === s.idSlotwaktu}
                onClick={() => aksiPilih(s.idSlotwaktu, Number(s.lapangan.hargaPerJam))}
              >
                {loadingId === s.idSlotwaktu ? "..." : (s.diblokir ? "Tutup" : s.sudahDipesan ? "Penuh" : "Pilih")}
              </button>
            </div>
          </div>
        </div>
      ))}

      {jadwalLapangan.length === 0 && (
        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", background: "white", borderRadius: "1.5rem", border: "2px dashed var(--abu-200)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
          <h3 style={{ color: "var(--abu-900)", marginBottom: "0.5rem" }}>Belum Ada Jadwal</h3>
          <p style={{ color: "var(--abu-500)" }}>Maaf, belum ada jadwal yang diterbitkan oleh Admin untuk tanggal ini.</p>
        </div>
      )}
    </div>
  );
}
