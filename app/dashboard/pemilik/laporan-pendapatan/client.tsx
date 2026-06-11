"use client";

export function TombolExportExcel({ data }: { data: any[] }) {
  const downloadExcel = () => {
    // 1. Definisikan header CSV
    const headers = ["ID Validasi", "Tanggal Dibayar", "Customer", "Metode", "Nominal Masuk", "Status Dana"];
    
    // 2. Pemetaan data ke baris CSV
    const rows = data.map((p) => [
      p.idPembayaran?.split("-")[0] || "",
      p.dibayarPada ? new Date(p.dibayarPada).toLocaleDateString("id-ID") : new Date(p.dibuatPada).toLocaleDateString("id-ID"),
      p.pemesanan?.pengguna?.nama || "Unknown",
      p.metodeBayar || "Manual",
      p.jumlah,
      "Lunas"
    ]);

    // 3. Gabungkan header dan baris menjadi format CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // 4. Buat file Blob dan trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Pendapatan_${new Date().toLocaleDateString("id-ID")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadExcel} 
      className="tombol-outline" 
      style={{ 
        width: "auto", 
        padding: "0.5rem 1rem", 
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        border: "1.5px solid var(--biru-border)",
        color: "var(--biru-primer)",
        fontWeight: 600,
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        background: "white"
      }}
    >
      📂 Export ke Excel (CSV)
    </button>
  );
}
