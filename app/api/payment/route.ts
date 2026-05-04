// File: app/api/payment/route.ts
import { NextResponse } from 'next/server';
import Midtrans from 'midtrans-client';
import { prisma } from '@/app/lib/db';
import { ambilSesi } from '@/app/lib/sesi';

// Inisialisasi Midtrans Snap
let snap = new Midtrans.Snap({
    isProduction: false, // Ubah ke true jika menggunakan Key Production
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
});

export async function POST(request: Request) {
    try {
        const sesi = await ambilSesi();
        if (!sesi || !sesi.penggunaId) {
            return NextResponse.json({ error: "Harap login terlebih dahulu" }, { status: 401 });
        }

        const { pemesananId } = await request.json();

        // 1. Ambil data pemesanan dari database
        const pemesanan = await prisma.pemesanan.findUnique({
            where: { idPemesanan: pemesananId, penggunaId: sesi.penggunaId },
            include: {
                pengguna: true,
                lapangan: true,
                pembayaran: true
            }
        });

        if (!pemesanan) {
            return NextResponse.json({ error: "Pemesanan tidak ditemukan" }, { status: 404 });
        }

        if (pemesanan.status !== "MENUNGGU") {
            return NextResponse.json({ error: "Pemesanan ini sudah tidak dalam status menunggu pembayaran" }, { status: 400 });
        }

        // 2. Siapkan parameter untuk Midtrans
        // Gunakan ID Pembayaran sebagai order_id agar unik
        const orderId = pemesanan.pembayaran?.idPembayaran || `PAY-${pemesanan.idPemesanan}`;

        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": Number(pemesanan.totalHarga)
            },
            "customer_details": {
                "first_name": pemesanan.pengguna.nama,
                "email": pemesanan.pengguna.email,
                "phone": pemesanan.pengguna.nomorHp || undefined
            },
            "item_details": [
                {
                    "id": pemesanan.lapanganId,
                    "price": Number(pemesanan.totalHarga),
                    "quantity": 1,
                    "name": `Sewa ${pemesanan.lapangan.nama}`
                }
            ],
            "callbacks": {
                "finish": `${request.headers.get('origin')}/dashboard/pelanggan/riwayat`,
                "error": `${request.headers.get('origin')}/dashboard/pelanggan/riwayat`,
                "pending": `${request.headers.get('origin')}/dashboard/pelanggan/riwayat`
            }
        };

        // 3. Minta token ke Midtrans
        const transaction = await snap.createTransaction(parameter);

        // 4. Update Pembayaran dengan order_id yang dikirim ke gateway
        if (pemesanan.pembayaran) {
            await prisma.pembayaran.update({
                where: { idPembayaran: pemesanan.pembayaran.idPembayaran },
                data: {
                    idOrderGateway: orderId,
                    responGateway: transaction as any
                }
            });
        }

        return NextResponse.json({
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });

    } catch (error: any) {
        console.error("Midtrans Error:", error);
        return NextResponse.json({
            error: "Gagal membuat transaksi pembayaran",
            details: error.message
        }, { status: 500 });
    }
}
