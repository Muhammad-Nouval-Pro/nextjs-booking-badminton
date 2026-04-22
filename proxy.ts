import { NextRequest, NextResponse } from "next/server";
import { dekripsiSesi } from "@/app/lib/sesi";

// Rute yang hanya bisa diakses jika BELUM login
const rutePublik = ["/masuk", "/daftar"];

// Rute yang membutuhkan peran tertentu
const ruteProteksi: Record<string, string[]> = {
  "/dashboard/pemilik": ["PEMILIK"],
  "/dashboard/admin": ["PEMILIK", "ADMIN"],
  "/dashboard/pelanggan": ["PELANGGAN", "PEMILIK", "ADMIN"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieSesi = req.cookies.get("sesi")?.value;
  const payload = await dekripsiSesi(cookieSesi);
  const sudahLogin = !!payload;

  // Redirect ke dashboard jika sudah login dan mengakses halaman publik
  if (sudahLogin && rutePublik.some((r) => pathname.startsWith(r))) {
    const peran = payload!.peran;
    if (peran === "PEMILIK")
      return NextResponse.redirect(new URL("/dashboard/pemilik", req.url));
    if (peran === "ADMIN")
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    return NextResponse.redirect(new URL("/dashboard/pelanggan", req.url));
  }

  // Proteksi rute dashboard
  const ruteMatch = Object.keys(ruteProteksi).find((r) =>
    pathname.startsWith(r)
  );

  if (ruteMatch) {
    if (!sudahLogin) {
      return NextResponse.redirect(new URL("/masuk", req.url));
    }
    const peranDiizinkan = ruteProteksi[ruteMatch];
    if (!peranDiizinkan.includes(payload!.peran)) {
      return NextResponse.redirect(new URL("/tidak-diizinkan", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/masuk", "/daftar", "/dashboard/:path*"],
};
