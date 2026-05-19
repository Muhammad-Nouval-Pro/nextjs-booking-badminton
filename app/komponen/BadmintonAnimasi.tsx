"use client";

import { useEffect, useState } from "react";

// ============================================
// SVG komponen badminton
// ============================================

function SvgKok({ ukuran = 32, style }: { ukuran?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 64 64"
      fill="none"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Kepala kok (gabus) */}
      <ellipse cx="32" cy="16" rx="10" ry="8" fill="rgba(255,255,255,0.9)" />
      {/* Bulu-bulu kok */}
      <path d="M22 16 L12 52 L20 48 L22 16Z" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <path d="M27 18 L18 54 L25 50 L27 18Z" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <path d="M32 19 L32 56 L32 56 L32 19Z" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <path d="M37 18 L46 54 L39 50 L37 18Z" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      <path d="M42 16 L52 52 L44 48 L42 16Z" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
      {/* Lingkaran dasar bulu */}
      <ellipse cx="32" cy="52" rx="20" ry="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </svg>
  );
}

function SvgRaket({ ukuran = 40, style }: { ukuran?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 64 64"
      fill="none"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Kepala raket (oval) */}
      <ellipse cx="32" cy="22" rx="16" ry="20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
      {/* Senar horizontal */}
      <line x1="18" y1="14" x2="46" y2="14" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      <line x1="17" y1="19" x2="47" y2="19" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      <line x1="17" y1="24" x2="47" y2="24" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      <line x1="18" y1="29" x2="46" y2="29" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      {/* Senar vertikal */}
      <line x1="24" y1="3" x2="24" y2="40" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      <line x1="29" y1="2" x2="29" y2="41" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      <line x1="35" y1="2" x2="35" y2="41" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      <line x1="40" y1="3" x2="40" y2="40" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
      {/* Gagang raket */}
      <rect x="29" y="42" width="6" height="18" rx="3" fill="rgba(255,255,255,0.5)" />
      {/* Grip */}
      <line x1="29" y1="48" x2="35" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="29" y1="52" x2="35" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line x1="29" y1="56" x2="35" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </svg>
  );
}

function SvgNet({ ukuran = 48, style }: { ukuran?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={ukuran}
      height={ukuran * 0.6}
      viewBox="0 0 80 48"
      fill="none"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tiang */}
      <rect x="2" y="4" width="3" height="40" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <rect x="75" y="4" width="3" height="40" rx="1.5" fill="rgba(255,255,255,0.5)" />
      {/* Garis atas net */}
      <line x1="5" y1="6" x2="75" y2="6" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      {/* Garis horizontal net */}
      <line x1="5" y1="14" x2="75" y2="14" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="5" y1="22" x2="75" y2="22" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="5" y1="30" x2="75" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <line x1="5" y1="38" x2="75" y2="38" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      {/* Garis vertikal net */}
      <line x1="19" y1="6" x2="19" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <line x1="33" y1="6" x2="33" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <line x1="47" y1="6" x2="47" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
      <line x1="61" y1="6" x2="61" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
    </svg>
  );
}

function SvgBintang({ ukuran = 16, style }: { ukuran?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="rgba(255,255,255,0.4)"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L14.09 8.26L20.18 8.63L15.64 12.64L17.09 18.63L12 15.27L6.91 18.63L8.36 12.64L3.82 8.63L9.91 8.26L12 2Z" />
    </svg>
  );
}

// ============================================
// Tipe data untuk elemen animasi
// ============================================
interface ElemenAnimasi {
  id: number;
  tipe: "kok" | "raket" | "net" | "bintang";
  x: number;
  y: number;
  ukuran: number;
  durasi: number;
  delay: number;
  rotasi: number;
  opacity: number;
}

// ============================================
// Komponen utama
// ============================================
export default function BadmintonAnimasi({ jumlah = 12 }: { jumlah?: number }) {
  const [elemen, setElemen] = useState<ElemenAnimasi[]>([]);

  useEffect(() => {
    const tipeTipe: ElemenAnimasi["tipe"][] = ["kok", "raket", "net", "bintang"];
    const elemenBaru: ElemenAnimasi[] = [];

    for (let i = 0; i < jumlah; i++) {
      elemenBaru.push({
        id: i,
        tipe: tipeTipe[Math.floor(Math.random() * tipeTipe.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        ukuran: 20 + Math.random() * 30,
        durasi: 15 + Math.random() * 25,
        delay: Math.random() * -30,
        rotasi: Math.random() * 360,
        opacity: 0.08 + Math.random() * 0.15,
      });
    }

    setElemen(elemenBaru);
  }, [jumlah]);

  if (elemen.length === 0) return null;

  return (
    <div className="badminton-animasi-container" aria-hidden="true">
      {elemen.map((el) => {
        const animasiNama =
          el.tipe === "kok"
            ? "badmintonMelayang1"
            : el.tipe === "raket"
            ? "badmintonMelayang2"
            : el.tipe === "net"
            ? "badmintonMelayang3"
            : "badmintonBerkilau";

        const gaya: React.CSSProperties = {
          position: "absolute",
          left: `${el.x}%`,
          top: `${el.y}%`,
          opacity: el.opacity,
          transform: `rotate(${el.rotasi}deg)`,
          animation: `${animasiNama} ${el.durasi}s ease-in-out ${el.delay}s infinite`,
          pointerEvents: "none",
          willChange: "transform, opacity",
        };

        return (
          <div key={el.id} style={gaya}>
            {el.tipe === "kok" && <SvgKok ukuran={el.ukuran} />}
            {el.tipe === "raket" && <SvgRaket ukuran={el.ukuran} />}
            {el.tipe === "net" && <SvgNet ukuran={el.ukuran} />}
            {el.tipe === "bintang" && <SvgBintang ukuran={el.ukuran} />}
          </div>
        );
      })}
    </div>
  );
}
