"use client";

import { useState } from "react";
import { gantiPassword } from "@/app/actions/pelanggan";

export default function HalamanPengaturan() {
  const [pesan, setPesan] = useState<{ isi: string; sukses: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPesan(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await gantiPassword(formData);
    
    setPesan({ isi: res.message, sukses: res.success });
    if (res.success) {
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <>
      <div className="konten-header">
        <h1>Pengaturan Akun</h1>
      </div>
      <div className="konten-body">
        <div className="kartu" style={{ maxWidth: "500px" }}>
          <div className="kartu-header">
            <h2 className="kartu-judul">Ganti Kata Sandi</h2>
          </div>
          <div className="kartu-body">
            {pesan && (
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1rem",
                background: pesan.sukses ? "#f0fdf4" : "#fef2f2",
                color: pesan.sukses ? "#16a34a" : "var(--merah)",
                border: `1px solid ${pesan.sukses ? "#bbf7d0" : "#fecaca"}`,
              }}>
                {pesan.isi}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-grup">
                <label className="form-label" htmlFor="passwordLama">Kata Sandi Lama</label>
                <input 
                  type="password" 
                  id="passwordLama"
                  name="passwordLama" 
                  className="form-input" 
                  required 
                />
              </div>
              
              <div className="form-grup">
                <label className="form-label" htmlFor="passwordBaru">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  id="passwordBaru"
                  name="passwordBaru" 
                  className="form-input" 
                  required 
                  minLength={8}
                />
              </div>
              
              <button 
                type="submit" 
                className="tombol-primer" 
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
