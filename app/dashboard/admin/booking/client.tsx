"use client";

import { useState } from "react";
import { selesaikanBooking, batalkanBookingOlehAdmin } from "@/app/actions/admin";
import Link from "next/link";

export function TombolSelesai({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm("Tandai pesanan ini sebagai SELESAI? Pelanggan akan bisa memberikan rating.")) {
          await selesaikanBooking(id);
        }
      }}
      style={{
        padding: "0.25rem 0.5rem",
        background: "var(--biru-primer)",
        color: "white",
        border: "none",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.75rem",
        cursor: "pointer",
        marginTop: "0.5rem",
      }}
    >
      Selesaikan
    </button>
  );
}

// ─── Tabel Booking dengan Pencarian ────────────────────────────────────────────

type Pemesanan = {
  idPemesanan: string;
  kodePemesanan: string;
  status: string;
  totalHarga: number | string;
  dibuatPada: string;
  ulasan?: string | null;
  pengguna: { nama: string; nomorHp?: string | null };
  slotWaktu?: {
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    lapangan: { nama: string };
  } | null;
};

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

export function TabelBooking({ pemesanan }: { pemesanan: Pemesanan[] }) {
  const [query, setQuery] = useState("");

  const filtered = pemesanan.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;

    const isOffline = p.ulasan?.includes("Booking Langsung:");
    const nama = isOffline
      ? p.ulasan!.replace("Booking Langsung: ", "").toLowerCase()
      : p.pengguna.nama.toLowerCase();

    const kode = p.kodePemesanan.toLowerCase();
    return kode.includes(q) || nama.includes(q);
  });

  return (
    <>
      {/* Search Bar */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--abu-200)",
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
        }}
      >
        <div style={{ position: "relative", maxWidth: "400px" }}>
          {/* Icon */}
          <span
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--abu-400)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            id="search-booking"
            type="text"
            placeholder="Cari nama pemesan atau kode pesanan…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 2.2rem 0.55rem 2.2rem",
              border: "1.5px solid var(--abu-300)",
              borderRadius: "8px",
              fontSize: "0.875rem",
              outline: "none",
              background: "var(--putih)",
              color: "var(--abu-900)",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--biru-primer)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--abu-300)")}
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              style={{
                position: "absolute",
                right: "0.6rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--abu-400)",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {query && (
          <p style={{ fontSize: "0.78rem", color: "var(--abu-500)", margin: 0 }}>
            Menampilkan <strong>{filtered.length}</strong> dari{" "}
            <strong>{pemesanan.length}</strong> pesanan
          </p>
        )}
      </div>

      {/* Table */}
      <div className="tabel-wrapper">
        <table className="tabel">
          <thead>
            <tr>
              <th>ID Pesanan</th>
              <th>Pemesan</th>
              <th>Jadwal &amp; Lapangan</th>
              <th>Total Tagihan</th>
              <th>Status</th>
              <th>Tanggal Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "2rem", color: "var(--abu-500)" }}
                >
                  {query
                    ? `Tidak ada hasil untuk "${query}"`
                    : "Belum ada data pemesanan"}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const isOffline = p.ulasan?.includes("Booking Langsung:");
                const namaTampil = isOffline
                  ? p.ulasan!.replace("Booking Langsung: ", "")
                  : p.pengguna.nama;

                const tanggalDibuat = new Date(p.dibuatPada).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                const tanggalSlot = p.slotWaktu
                  ? new Date(p.slotWaktu.tanggal).toLocaleDateString("id-ID")
                  : null;

                return (
                  <tr key={p.idPemesanan}>
                    <td
                      style={{
                        fontWeight: 700,
                        color: "var(--abu-900)",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.kodePemesanan}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{namaTampil}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--abu-500)" }}>
                        {isOffline ? "Offline (Walk-in)" : p.pengguna.nomorHp || "-"}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {p.slotWaktu ? (
                        <>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--biru-primer)",
                            }}
                          >
                            {p.slotWaktu.lapangan.nama}
                          </div>
                          <div>{tanggalSlot}</div>
                          <div style={{ color: "var(--abu-500)" }}>
                            {p.slotWaktu.jamMulai} - {p.slotWaktu.jamSelesai}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatRupiah(Number(p.totalHarga))}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        {p.status === "MENUNGGU" && (
                          <span className="badge badge-kuning">Menunggu</span>
                        )}
                        {p.status === "DIKONFIRMASI" && (
                          <span className="badge badge-biru">Dikonfirmasi</span>
                        )}
                        {p.status === "SELESAI" && (
                          <span
                            className="badge badge-biru"
                            style={{
                              background: "var(--hijau-bg)",
                              color: "var(--hijau-primer)",
                              borderColor: "var(--hijau-border)",
                            }}
                          >
                            Selesai
                          </span>
                        )}
                        {p.status === "DIBATALKAN" && (
                          <span className="badge badge-merah">Dibatalkan</span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--abu-500)" }}>
                      {tanggalDibuat}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.25rem", flexDirection: "column", minWidth: "100px" }}>
                        {p.status === "DIKONFIRMASI" && (
                          <TombolSelesai id={p.idPemesanan} />
                        )}
                        {(p.status === "DIKONFIRMASI" || p.status === "MENUNGGU") && (
                          <>
                            <Link
                              href={`/dashboard/admin/booking/reschedule/${p.idPemesanan}`}
                              style={{
                                padding: "0.25rem 0.5rem",
                                background: "var(--abu-100)",
                                color: "var(--abu-900)",
                                border: "1px solid var(--abu-200)",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                textDecoration: "none",
                                textAlign: "center",
                                fontWeight: 600
                              }}
                            >
                              Reschedule
                            </Link>
                            <button
                              onClick={async () => {
                                if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
                                  const res = await batalkanBookingOlehAdmin(p.idPemesanan);
                                  if (res.sukses) alert("Booking berhasil dibatalkan!");
                                  else alert(res.pesan);
                                }
                              }}
                              style={{
                                padding: "0.25rem 0.5rem",
                                background: "#fee2e2",
                                color: "var(--merah)",
                                border: "none",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: 600
                              }}
                            >
                              Batalkan
                            </button>
                          </>
                        )}
                        {p.status === "SELESAI" && (
                          <span style={{ fontSize: "0.75rem", color: "var(--abu-500)", fontStyle: "italic" }}>
                            Selesai
                          </span>
                        )}
                        {p.status === "DIBATALKAN" && (
                          <span style={{ fontSize: "0.75rem", color: "var(--abu-500)", fontStyle: "italic" }}>
                            Batal
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
