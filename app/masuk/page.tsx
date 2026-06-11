"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import type { StateForm } from "@/app/lib/definisi";
import BadmintonAnimasi from "@/app/komponen/BadmintonAnimasi";

export default function HalamanMasuk() {
  const [state, aksi, loading] = useActionState<StateForm, FormData>(
    login,
    undefined
  );

  return (
    <div className="auth-wrapper">
      {/* Panel Kiri */}
      <div className="auth-kiri">
        <BadmintonAnimasi jumlah={14} />
        <div className="auth-logo">
          {/* <div className="auth-logo-ikon">🏸</div> */}
          <span className="auth-logo-teks">GOR Garuda Nusantara</span>
        </div>
        <div className="auth-kiri-konten">
          <h1>Lahirnya Para Juara </h1>
          <p>Masuk untuk mengelola booking lapangan badminton Anda dengan mudah.</p>
          <ul className="auth-fitur-list">
            <li>
              <span>✓</span>
              <span>Pesan lapangan kapan saja</span>
            </li>
            <li>
              <span>✓</span>
              <span>Lihat jadwal secara real time</span>
            </li>
            <li>
              <span>✓</span>
              <span>Pembayaran terintegrasi</span>
            </li>
            <li>
              <span>✓</span>
              <span>Riwayat booking lengkap</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Panel Kanan */}
      <div className="auth-kanan">
        <div className="auth-kartu">
          <div className="auth-kartu-judul">
            <h2>Masuk</h2>
            <p>Masukkan email dan kata sandi Anda</p>
          </div>

          {/* Pesan Error Global */}
          {state?.pesan && (
            <div className="form-pesan-error" role="alert">
              <span>⚠️</span> {state.pesan}
            </div>
          )}

          <form action={aksi} noValidate>
            {/* Email */}
            <div className="form-grup">
              <label htmlFor="email-masuk" className="form-label">
                Email
              </label>
              <input
                id="email-masuk"
                name="email"
                type="email"
                placeholder="Masukkan Email Anda"
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

            {/* Kata Sandi */}
            <div className="form-grup">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <label htmlFor="kataSandi-masuk" className="form-label" style={{ marginBottom: 0 }}>
                  Kata Sandi
                </label>
                <Link href="/lupa-password" style={{ fontSize: "0.8rem", color: "var(--biru-primer)", fontWeight: 600 }}>Lupa password?</Link>
              </div>
              <input
                id="kataSandi-masuk"
                name="kataSandi"
                type="password"
                placeholder="Masukkan kata sandi"
                className={`form-input ${state?.errors?.kataSandi ? "error" : ""}`}
                autoComplete="current-password"
                required
              />
              {state?.errors?.kataSandi && (
                <p className="form-error" role="alert">
                  {state.errors.kataSandi[0]}
                </p>
              )}
            </div>

            <button
              id="tombol-masuk"
              type="submit"
              className="tombol-primer"
              disabled={loading}
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? "Memproses..." : "Masuk"}
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
            <span>Masuk dengan Google</span>
          </Link>

          <p className="auth-link">
            Belum punya akun?{" "}
            <Link href="/daftar">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
