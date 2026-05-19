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

          <p className="auth-link">
            Belum punya akun?{" "}
            <Link href="/daftar">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
