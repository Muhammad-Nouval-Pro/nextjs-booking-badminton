"use client";

import { selesaikanBooking } from "@/app/actions/admin";

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
        marginTop: "0.5rem"
      }}
    >
      Selesaikan
    </button>
  );
}
