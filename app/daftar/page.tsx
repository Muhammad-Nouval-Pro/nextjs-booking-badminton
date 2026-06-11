"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrasi } from "@/app/actions/auth";
import type { StateForm } from "@/app/lib/definisi";
import BadmintonAnimasi from "@/app/komponen/BadmintonAnimasi";

export default function HalamanDaftar() {
  const [state, aksi, loading] = useActionState<StateForm, FormData>(
    registrasi,
    undefined
  );

  return (
    <div className="auth-wrapper">
      {/* Panel Kiri */}
      <div className="auth-kiri">
        <BadmintonAnimasi jumlah={14} />
        <div className="auth-logo">
          {/* <div className="auth-logo-ikon">🏸</div> */}
          <span className="auth-logo-teks">GOR Garuda Nusantara </span>
        </div>
        <div className="auth-kiri-konten">
          <h1>Gabung Sekarang!</h1>
          <p>Buat akun gratis dan mulai pesan lapangan badminton favorit Anda.</p>
          <ul className="auth-fitur-list">
            <li>
              <span>✓</span>
              <span>Registrasi gratis & mudah</span>
            </li>
            <li>
              <span>✓</span>
              <span>5 lapangan pilihan tersedia</span>
            </li>
            <li>
              <span>✓</span>
              <span>Jam operasional 09:00–22:00</span>
            </li>
            <li>
              <span>✓</span>
              <span>Konfirmasi booking instan</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Panel Kanan */}
      <div className="auth-kanan">
        <div className="auth-kartu">
          <div className="auth-kartu-judul">
            <h2>Buat Akun</h2>
            <p>Isi data di bawah ini untuk mendaftar</p>
          </div>

          {/* Pesan Berhasil atau Error Global */}
          {state?.pesan && (
            <div className={state.berhasil ? "form-pesan-sukses" : "form-pesan-error"} role="alert">
              <span>{state.berhasil ? "✅" : "⚠️"}</span> {state.pesan}
            </div>
          )}

          {!state?.berhasil ? (
            <>
              <form action={aksi} noValidate>
              {/* Nama */}
              <div className="form-grup">
                <label htmlFor="nama-daftar" className="form-label">
                  Nama Lengkap
                </label>
                <input
                  id="nama-daftar"
                  name="nama"
                  type="text"
                  placeholder="Nama lengkap Anda"
                  className={`form-input ${state?.errors?.nama ? "error" : ""}`}
                  autoComplete="name"
                  required
                />
                {state?.errors?.nama && (
                  <p className="form-error" role="alert">
                    {state.errors.nama[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="form-grup">
                <label htmlFor="email-daftar" className="form-label">
                  Email
                </label>
                <input
                  id="email-daftar"
                  name="email"
                  type="email"
                  placeholder="contoh@gmail.com"
                  className={`form-input ${state?.errors?.email ? "error" : ""}`}
                  autoComplete="email"
                  required
                />
                {state?.errors?.email && (
                  <p className="form-error" role="alert">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Nomor HP */}
              <div className="form-grup">
                <label htmlFor="nomorHp-daftar" className="form-label">
                  Nomor HP <span style={{ color: "var(--abu-500)", fontWeight: 400 }}></span>
                </label>
                <input
                  id="nomorHp-daftar"
                  name="nomorHp"
                  type="tel"
                  placeholder="Nomor HP Anda"
                  className={`form-input ${state?.errors?.nomorHp ? "error" : ""}`}
                  autoComplete="tel"
                />
                {state?.errors?.nomorHp && (
                  <p className="form-error" role="alert">
                    {state.errors.nomorHp[0]}
                  </p>
                )}
              </div>

              {/* Kata Sandi */}
              <div className="form-grup">
                <label htmlFor="kataSandi-daftar" className="form-label">
                  Kata Sandi
                </label>
                <input
                  id="kataSandi-daftar"
                  name="kataSandi"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  className={`form-input ${state?.errors?.kataSandi ? "error" : ""}`}
                  autoComplete="new-password"
                  required
                />
                {state?.errors?.kataSandi && (
                  <p className="form-error" role="alert">
                    {state.errors.kataSandi[0]}
                  </p>
                )}
              </div>

              <button
                id="tombol-daftar"
                type="submit"
                className="tombol-primer"
                disabled={loading}
                style={{ marginTop: "0.5rem" }}
              >
                {loading ? "Memproses..." : "Buat Akun"}
              </button>
            </form>

            <div className="auth-divider">atau</div>

            <Link href="/api/auth/google" className="tombol-google">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.05c2.37-2.18 3.73-5.39 3.73-8.75z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3a4.78 4.78 0 0 1-7.9 0l-4 3.1A11.95 11.95 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.19 14.9a7.15 7.15 0 0 1 0-4.8l-4-3.1a11.98 11.98 0 0 0 0 11l4-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.95 11.95 0 0 0 2.22 3.8l4 3.1a7.15 7.15 0 0 1 5.78-2.15z"
                />
              </svg>
              <span>Daftar dengan Google</span>
            </Link>
          </>
        ) : (
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/masuk" className="tombol-primer" style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
                Masuk ke Akun
              </Link>
            </div>
          )}


          <p className="auth-link">
            Sudah punya akun?{" "}
            <Link href="/masuk">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
