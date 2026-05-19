"use client";

import { useActionState } from "react";
import Link from "next/link";
import { lupaPassword } from "@/app/actions/auth";
import type { StateForm } from "@/app/lib/definisi";
import BadmintonAnimasi from "@/app/komponen/BadmintonAnimasi";

export default function HalamanLupaPassword() {
  const [state, aksi, loading] = useActionState<StateForm, FormData>(
    lupaPassword,
    undefined
  );

  return (
    <div className="auth-wrapper">
      <div className="auth-kiri">
        <BadmintonAnimasi jumlah={14} />
        <div className="auth-logo">
          {/* <div className="auth-logo-ikon">🏸</div> */}
          <span className="auth-logo-teks">GOR Garuda Nusantara</span>
        </div>
        <div className="auth-kiri-konten">
          <h1>Lupa Kata Sandi? </h1>
          <p>Jangan khawatir, reset kata sandi Anda dengan memasukkan email dan nomor HP yang terdaftar.</p>
        </div>
      </div>

      <div className="auth-kanan">
        <div className="auth-kartu">
          <div className="auth-kartu-judul">
            <h2>Reset Kata Sandi</h2>
            <p>Masukkan data akun Anda</p>
          </div>

          {state?.pesan && (
            <div className={state.berhasil ? "form-pesan-sukses" : "form-pesan-error"} role="alert" style={state.berhasil ? { background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", color: "#16a34a", borderRadius: "8px", marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" } : {}}>
              <span>{state.berhasil ? "✅" : "⚠️"}</span> {state.pesan}
            </div>
          )}

          {!state?.berhasil ? (
            <form action={aksi} noValidate>
              <div className="form-grup">
                <label htmlFor="email-lupa" className="form-label">
                  Email
                </label>
                <input
                  id="email-lupa"
                  name="email"
                  type="email"
                  placeholder="Masukkan Email"
                  className={`form-input ${state?.errors?.email ? "error" : ""}`}
                  required
                />
                {state?.errors?.email && (
                  <p className="form-error" role="alert">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              <div className="form-grup">
                <label htmlFor="hp-lupa" className="form-label">
                  Nomor HP (Verifikasi)
                </label>
                <input
                  id="hp-lupa"
                  name="nomorHp"
                  type="tel"
                  placeholder="Masukkan Nomor HP Anda"
                  className={`form-input ${state?.errors?.nomorHp ? "error" : ""}`}
                  required
                />
                {state?.errors?.nomorHp && (
                  <p className="form-error" role="alert">
                    {state.errors.nomorHp[0]}
                  </p>
                )}
              </div>

              <div className="form-grup">
                <label htmlFor="sandi-baru" className="form-label">
                  Kata Sandi Baru
                </label>
                <input
                  id="sandi-baru"
                  name="kataSandiBaru"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  className={`form-input ${state?.errors?.kataSandiBaru ? "error" : ""}`}
                  required
                />
                {state?.errors?.kataSandiBaru && (
                  <p className="form-error" role="alert">
                    {state.errors.kataSandiBaru[0]}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="tombol-primer"
                disabled={loading}
                style={{ marginTop: "0.5rem" }}
              >
                {loading ? "Memproses..." : "Ubah Kata Sandi"}
              </button>
            </form>
          ) : (
            <Link href="/masuk" className="tombol-primer" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Kembali ke Login
            </Link>
          )}

          <p className="auth-link">
            Ingat kata sandi?{" "}
            <Link href="/masuk">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
