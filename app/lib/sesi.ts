import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { PayloadSesi } from "@/app/lib/definisi";

const kunciRahasia = process.env.SESSION_SECRET;
const kunciEncoded = new TextEncoder().encode(kunciRahasia);

// Enkripsi payload menjadi JWT
export async function enkripsiSesi(payload: PayloadSesi): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(kunciEncoded);
}

// Dekripsi JWT menjadi payload
export async function dekripsiSesi(
  sesi: string | undefined = ""
): Promise<PayloadSesi | null> {
  try {
    const { payload } = await jwtVerify(sesi, kunciEncoded, {
      algorithms: ["HS256"],
    });
    return payload as unknown as PayloadSesi;
  } catch {
    return null;
  }
}

// Buat sesi baru setelah login/registrasi
export async function buatSesi(
  penggunaId: string,
  peran: PayloadSesi["peran"]
) {
  const kadaluarsaPada = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sesi = await enkripsiSesi({ penggunaId, peran, kadaluarsaPada });
  const cookieStore = await cookies();

  cookieStore.set("sesi", sesi, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: kadaluarsaPada,
    sameSite: "lax",
    path: "/",
  });
}

// Ambil data sesi yang sedang aktif
export async function ambilSesi(): Promise<PayloadSesi | null> {
  const cookieStore = await cookies();
  const sesi = cookieStore.get("sesi")?.value;
  if (!sesi) return null;
  return dekripsiSesi(sesi);
}

// Hapus sesi saat logout
export async function hapusSesi() {
  const cookieStore = await cookies();
  cookieStore.delete("sesi");
}
