"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rescheduleBookingOlehAdmin } from "@/app/actions/admin";

export function ListRescheduleAdmin({
  jadwalLapangan,
  pemesananId
}: {
  jadwalLapangan: any[];
  pemesananId: string;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleReschedule = async (slotId: string) => {
    if (!confirm("Apakah Anda yakin ingin memindahkan jadwal booking ini?")) return;

    setLoadingId(slotId);
    const hasil = await rescheduleBookingOlehAdmin(pemesananId, slotId);
    
    if (hasil.sukses) {
      alert("Jadwal booking berhasil dipindahkan oleh admin!");
      router.push("/dashboard/admin/booking");
      router.refresh();
    } else {
      alert(hasil.pesan || "Gagal melakukan reschedule");
    }
    setLoadingId(null);
  };

  if (jadwalLapangan.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "1rem", color: "var(--abu-500)", border: "1px solid var(--abu-200)" }}>
        Tidak ada jadwal tersedia pada tanggal ini.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
      {jadwalLapangan.map((j) => (
        <div 
          key={j.idSlotwaktu} 
          className="kartu" 
          style={{ 
            padding: "1.5rem", 
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "space-between",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default",
            background: "white",
            border: "1px solid var(--abu-200)"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{j.lapangan.nama}</div>
              <span className="badge badge-biru" style={{ background: "var(--hijau-bg)", color: "var(--hijau-600)" }}>Tersedia</span>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
              {j.jamMulai} - {j.jamSelesai}
            </div>
            <div style={{ color: "var(--abu-500)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Durasi: 1 Jam
            </div>
          </div>
          
          <button 
            className="tombol-primer" 
            style={{ 
              width: "100%", 
              background: "linear-gradient(135deg, var(--biru-primer), var(--biru-muda))",
              boxShadow: "var(--bayangan-biru)"
            }}
            disabled={loadingId === j.idSlotwaktu}
            onClick={() => handleReschedule(j.idSlotwaktu)}
          >
            {loadingId === j.idSlotwaktu ? "Memproses..." : "Pindahkan Ke Jadwal Ini"}
          </button>
        </div>
      ))}
    </div>
  );
}
