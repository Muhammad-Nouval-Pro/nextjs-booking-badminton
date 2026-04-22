"use client";

import { useRouter } from "next/navigation";
import { bayarPesanan } from "@/app/actions/pelanggan";
import { useState } from "react";

export function RiwayatDanTagihan({ dataPemesanan }: { dataPemesanan: any[] }) {
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const router = useRouter();
  const [prosesId, setProsesId] = useState<string | null>(null);

  const aksiBayar = async (pemesananId: string) => {
    setProsesId(pemesananId);
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pemesananId }),
      });

      const data = await response.json();

      if (data.token) {
        (window as any).snap.pay(data.token, {
          onSuccess: function (result: any) {
            alert("Pembayaran berhasil!");
            router.refresh();
          },
          onPending: function (result: any) {
            alert("Menunggu pembayaran Anda.");
            router.refresh();
          },
          onError: function (result: any) {
            alert("Pembayaran gagal!");
          },
          onClose: function () {
            alert("Anda belum menyelesaikan pembayaran.");
          },
        });
      } else {
        alert(data.error || "Gagal mendapatkan token pembayaran");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setProsesId(null);
    }
  };

  return (
    <div className="grid-statistik">
      {dataPemesanan.map(p => (
        <div key={p.id} className="kartu" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <span style={{ fontFamily: "monospace", color: "var(--abu-500)", fontWeight: 600 }}>#{p.kodePemesanan}</span>
            {p.status === "MENUNGGU" && <span className="badge badge-kuning">Belum Dibayar</span>}
            {p.status === "DIKONFIRMASI" && <span className="badge badge-biru">Menunggu Jadwal Main</span>}
            {p.status === "SELESAI" && <span className="badge badge-biru">Selesai</span>}
            {p.status === "DIBATALKAN" && <span className="badge badge-merah">Pesanan Terbatalkan</span>}
          </div>
          
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.5rem 0" }}>{p.slotWaktu?.lapangan?.nama || "Lapangan Dihapus"}</h3>
            <div style={{ fontSize: "0.9rem", color: "var(--abu-500)" }}>
              {p.slotWaktu ? `${p.slotWaktu.tanggal.toLocaleDateString('id-ID')} | ${p.slotWaktu.jamMulai} - ${p.slotWaktu.jamSelesai}` : "Data Waktu Hilang"}
            </div>
          </div>

          <div style={{ padding: "1rem", background: "var(--abu-100)", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--abu-500)", marginBottom: "0.25rem" }}>Total Tagihan</div>
            <div style={{ fontWeight: 700, color: "var(--merah)", fontSize: "1.2rem" }}>
              {formatRupiah(Number(p.totalHarga))}
            </div>
          </div>

          {p.status === "MENUNGGU" && p.pembayaran && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                className="tombol-primer" 
                style={{ width: "100%" }}
                disabled={prosesId === p.id}
                onClick={() => aksiBayar(p.id)}
              >
                {prosesId === p.id ? "Memproses..." : "Bayar Sekarang (Midtrans)"}
              </button>
              
              <button 
                className="tombol-outline" 
                style={{ width: "100%", fontSize: "0.85rem", padding: "0.5rem" }}
                disabled={prosesId === `cek-${p.id}`}
                onClick={async () => {
                   setProsesId(`cek-${p.id}`);
                   try {
                     const res = await fetch("/api/payment/status", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ pemesananId: p.id })
                     });
                     const data = await res.json();
                     if (data.status === "LUNAS") {
                       alert("Pembayaran terkonfirmasi LUNAS!");
                       router.refresh();
                     } else {
                       alert("Pembayaran belum diterima / masih diproses.");
                     }
                   } catch (err) {
                     alert("Gagal mengecek status.");
                   } finally {
                     setProsesId(null);
                   }
                }}
              >
                {prosesId === `cek-${p.id}` ? "Mengecek..." : "🔄 Cek Status Pembayaran"}
              </button>
            </div>
          )}
          
          {p.status === "SELESAI" && (
            <div style={{ marginTop: "1rem" }}>
              {p.rating ? (
                <div style={{ padding: "1rem", background: "var(--biru-bg)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontWeight: 600, color: "var(--biru-primer)", marginBottom: "0.25rem" }}>
                    Terima kasih atas ulasan Anda!
                  </div>
                  <div>{"⭐".repeat(p.rating)}</div>
                  {p.ulasan && <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "var(--abu-700)", fontStyle: "italic" }}>"{p.ulasan}"</div>}
                </div>
              ) : (
                <button 
                  className="tombol-primer" 
                  style={{ width: "100%", background: "var(--biru-primer)" }} 
                  disabled={prosesId === p.id}
                  onClick={async () => {
                    const ratingStr = prompt("Beri rating 1-5:");
                    if (!ratingStr) return;
                    const rating = parseInt(ratingStr);
                    if (isNaN(rating) || rating < 1 || rating > 5) {
                      alert("Rating harus angka 1-5");
                      return;
                    }
                    const ulasan = prompt("Berikan ulasan Anda (opsional):") || "";
                    setProsesId(p.id);
                    const { beriRating } = await import("@/app/actions/pelanggan");
                    const res = await beriRating(p.id, rating, ulasan);
                    if (res.sukses) alert("Terima kasih atas ulasan Anda!");
                    else alert("Gagal mengirim ulasan");
                    setProsesId(null);
                  }}
                >
                  {prosesId === p.id ? "Mengirim..." : "Beri Ulasan & Rating"}
                </button>
              )}
            </div>
          )}

          {p.status === "DIBATALKAN" && (
            <button className="tombol-outline" style={{ width: "100%", opacity: 0.5 }} disabled>Pesanan Dibatalkan</button>
          )}

          {p.status === "DIKONFIRMASI" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button className="tombol-primer" style={{ width: "100%", background: "var(--hijau-500)", border: "none", color: "white", opacity: 0.8 }} disabled>Sudah Lunas</button>
              <button 
                className="tombol-outline" 
                style={{ width: "100%", borderColor: "var(--biru-primer)", color: "var(--biru-primer)" }}
                onClick={() => router.push(`/dashboard/pelanggan/riwayat/reschedule/${p.id}`)}
              >
                🔄 Reschedule Jadwal
              </button>
            </div>
          )}
        </div>
      ))}
      {dataPemesanan.length === 0 && (
        <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", background: "white", borderRadius: "1rem" }}>
          Anda belum memiliki riwayat pemesanan lapangan.
        </div>
      )}
    </div>
  );
}
