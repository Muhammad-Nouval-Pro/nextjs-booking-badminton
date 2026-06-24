"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ClientPrintBtn() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="no-print" style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button 
          onClick={() => window.print()} 
          style={{ padding: "0.75rem 1.5rem", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: "600", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
        >
          <span style={{ fontSize: "1.25rem" }}>🖨️</span> Cetak Struk
        </button>
        <Link 
          href="/dashboard/pelanggan/riwayat"
          style={{ padding: "0.75rem 1.5rem", backgroundColor: "#ffffff", color: "#374151", fontWeight: "600", borderRadius: "8px", border: "1px solid #d1d5db", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", textDecoration: "none" }}
        >
          <span>🔙</span> Kembali ke Riwayat
        </Link>
      </div>
    </>
  );
}
