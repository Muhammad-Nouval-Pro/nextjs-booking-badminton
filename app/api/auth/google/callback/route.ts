import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { buatSesi } from "@/app/lib/sesi";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/masuk?error=code_missing", request.url));
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("Google Client ID atau Client Secret tidak ada.");
    return NextResponse.redirect(new URL("/masuk?error=config_missing", request.url));
  }

  try {
    // 1. Exchange auth code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData);
      return NextResponse.redirect(new URL("/masuk?error=token_error", request.url));
    }

    const { access_token } = tokenData;

    // 2. Ambil profil user dari Google
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const googleUser = await userinfoResponse.json();

    if (!googleUser.email) {
      console.error("Gagal mendapatkan email dari Google.");
      return NextResponse.redirect(new URL("/masuk?error=email_missing", request.url));
    }

    const { name, email } = googleUser;

    // 3. Cari atau daftarkan user di database
    let pengguna = await prisma.pengguna.findUnique({
      where: { email },
    });

    if (!pengguna) {
      // Jika belum terdaftar, buat akun baru
      // Karena password/kataSandi di skema required, buat random hash
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedRandomPassword = await bcrypt.hash(randomPassword, 12);

      pengguna = await prisma.pengguna.create({
        data: {
          nama: name || "Pengguna Google",
          email,
          kataSandi: hashedRandomPassword,
          peran: "PELANGGAN",
          aktif: true,
        },
      });
    }

    // 4. Cek apakah akun aktif
    if (!pengguna.aktif) {
      return NextResponse.redirect(
        new URL("/masuk?error=account_disabled", request.url)
      );
    }

    // 5. Buat sesi
    await buatSesi(pengguna.idPengguna, pengguna.peran);

    // 6. Redirect ke dashboard yang sesuai
    if (pengguna.peran === "PEMILIK") {
      return NextResponse.redirect(new URL("/dashboard/pemilik", request.url));
    } else if (pengguna.peran === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/pelanggan", request.url));
    }

  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    return NextResponse.redirect(new URL("/masuk?error=auth_failed", request.url));
  }
}
