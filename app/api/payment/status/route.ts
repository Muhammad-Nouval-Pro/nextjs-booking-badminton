import { NextResponse } from 'next/server';
import Midtrans from 'midtrans-client';
import { prisma } from '@/app/lib/db';
import { ambilSesi } from '@/app/lib/sesi';

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
});

export async function POST(request: Request) {
    try {
        const sesi = await ambilSesi();
        if (!sesi || !sesi.penggunaId) {
            return NextResponse.json({ error: "Harap login" }, { status: 401 });
        }

        const { pemesananId } = await request.json();

        const pemesanan = await prisma.pemesanan.findUnique({
            where: { idPemesanan: pemesananId, penggunaId: sesi.penggunaId },
            include: { pembayaran: true }
        });

        if (!pemesanan || !pemesanan.pembayaran || !pemesanan.pembayaran.idOrderGateway) {
            return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });
        }

        // Ambil status langsung dari Midtrans menggunakan orderIdGateway
        // @ts-ignore
        const status = await snap.transaction.status(pemesanan.pembayaran.idOrderGateway);

        // Update database berdasarkan status terbaru (sama seperti logic webhook)
        let statusPembayaran: "LUNAS" | "GAGAL" | "MENUNGGU" = "MENUNGGU";
        let statusPemesanan: "DIKONFIRMASI" | "DIBATALKAN" | "MENUNGGU" = "MENUNGGU";

        if (status.transaction_status === 'settlement' || status.transaction_status === 'capture') {
            if (status.fraud_status === 'accept' || !status.fraud_status) {
                statusPembayaran = "LUNAS";
                statusPemesanan = "DIKONFIRMASI";
            }
        } else if (status.transaction_status === 'cancel' || status.transaction_status === 'deny' || status.transaction_status === 'expire') {
            statusPembayaran = "GAGAL";
            statusPemesanan = "DIBATALKAN";
        }

        // Update database
        await prisma.$transaction(async (tx) => {
            await tx.pembayaran.update({
                where: { idPembayaran: pemesanan.pembayaran!.idPembayaran },
                data: {
                    status: statusPembayaran,
                    idTransaksiGateway: status.transaction_id,
                    metodeBayar: status.payment_type,
                    dibayarPada: statusPembayaran === "LUNAS" ? new Date() : null
                }
            });

            await tx.pemesanan.update({
                where: { idPemesanan: pemesanan.idPemesanan },
                data: { status: statusPemesanan }
            });

            if (statusPemesanan === "DIBATALKAN") {
                await tx.slotwaktu.update({
                    where: { idSlotwaktu: pemesanan.slotWaktuId },
                    data: { sudahDipesan: false }
                });
            }
        });

        return NextResponse.json({ status: statusPembayaran, message: "Status diperbarui" });

    } catch (error: any) {
        console.error("Status Check Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
