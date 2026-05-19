"use client";

import { useEffect, useState } from "react";

// SVG Kok (Shuttlecock) untuk landing page — warna gelap/biru
function SvgKokLanding({ ukuran = 28, style }: { ukuran?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 64 64"
      fill="none"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="16" rx="10" ry="8" fill="rgba(37,99,235,0.15)" />
      <path d="M22 16 L12 52 L20 48 L22 16Z" fill="rgba(37,99,235,0.08)" />
      <path d="M27 18 L18 54 L25 50 L27 18Z" fill="rgba(37,99,235,0.06)" />
      <path d="M37 18 L46 54 L39 50 L37 18Z" fill="rgba(37,99,235,0.06)" />
      <path d="M42 16 L52 52 L44 48 L42 16Z" fill="rgba(37,99,235,0.08)" />
    </svg>
  );
}

function SvgRaketLanding({ ukuran = 36, style }: { ukuran?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 64 64"
      fill="none"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="22" rx="16" ry="20" fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="2.5" />
      <line x1="18" y1="14" x2="46" y2="14" stroke="rgba(37,99,235,0.06)" strokeWidth="0.8" />
      <line x1="17" y1="19" x2="47" y2="19" stroke="rgba(37,99,235,0.06)" strokeWidth="0.8" />
      <line x1="17" y1="24" x2="47" y2="24" stroke="rgba(37,99,235,0.06)" strokeWidth="0.8" />
      <line x1="18" y1="29" x2="46" y2="29" stroke="rgba(37,99,235,0.06)" strokeWidth="0.8" />
      <line x1="24" y1="3" x2="24" y2="40" stroke="rgba(37,99,235,0.05)" strokeWidth="0.8" />
      <line x1="29" y1="2" x2="29" y2="41" stroke="rgba(37,99,235,0.05)" strokeWidth="0.8" />
      <line x1="35" y1="2" x2="35" y2="41" stroke="rgba(37,99,235,0.05)" strokeWidth="0.8" />
      <line x1="40" y1="3" x2="40" y2="40" stroke="rgba(37,99,235,0.05)" strokeWidth="0.8" />
      <rect x="29" y="42" width="6" height="18" rx="3" fill="rgba(37,99,235,0.1)" />
    </svg>
  );
}

interface ElemenHero {
  id: number;
  tipe: "kok" | "raket";
  x: number;
  y: number;
  ukuran: number;
  durasi: number;
  delay: number;
  rotasi: number;
  opacity: number;
}

export default function BadmintonHeroAnimasi() {
  const [elemen, setElemen] = useState<ElemenHero[]>([]);

  useEffect(() => {
    const elemenBaru: ElemenHero[] = [];
    const tipeTipe: ElemenHero["tipe"][] = ["kok", "raket"];

    for (let i = 0; i < 8; i++) {
      elemenBaru.push({
        id: i,
        tipe: tipeTipe[Math.floor(Math.random() * tipeTipe.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        ukuran: 24 + Math.random() * 28,
        durasi: 18 + Math.random() * 20,
        delay: Math.random() * -20,
        rotasi: Math.random() * 360,
        opacity: 0.4 + Math.random() * 0.4,
      });
    }

    setElemen(elemenBaru);
  }, []);

  if (elemen.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {elemen.map((el) => {
        const animasiNama = el.tipe === "kok" ? "badmintonMelayang1" : "badmintonMelayang2";

        return (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: `${el.x}%`,
              top: `${el.y}%`,
              opacity: el.opacity,
              transform: `rotate(${el.rotasi}deg)`,
              animation: `${animasiNama} ${el.durasi}s ease-in-out ${el.delay}s infinite`,
              pointerEvents: "none",
              willChange: "transform, opacity",
            }}
          >
            {el.tipe === "kok" && <SvgKokLanding ukuran={el.ukuran} />}
            {el.tipe === "raket" && <SvgRaketLanding ukuran={el.ukuran} />}
          </div>
        );
      })}
    </div>
  );
}
