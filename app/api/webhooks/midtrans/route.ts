import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. Verifikasi Signature Key (Opsional tapi disarankan)
        const serverKey = process.env.MIDTRANS_SERVER_KEY!;
        const signature = crypto.createHash('sha512')
            .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
            .digest('hex');

        if (signature !== body.signature_key) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const transactionStatus = body.transaction_status;
        const fraudStatus = body.fraud_status;
        const orderId = body.order_id;

        console.log(`Webhook received for Order ID: ${orderId}, Status: ${transactionStatus}`);

        // 2. Logic Handler Status Midtrans
        let statusPembayaran: "LUNAS" | "GAGAL" | "MENUNGGU" = "MENUNGGU";
        let statusPemesanan: "DIKONFIRMASI" | "DIBATALKAN" | "MENUNGGU" = "MENUNGGU";

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                statusPembayaran = "MENUNGGU";
            } else if (fraudStatus === 'accept') {
                statusPembayaran = "LUNAS";
                statusPemesanan = "DIKONFIRMASI";
            }
        } else if (transactionStatus === 'settlement') {
            statusPembayaran = "LUNAS";
            statusPemesanan = "DIKONFIRMASI";
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            statusPembayaran = "GAGAL";
            statusPemesanan = "DIBATALKAN";
        } else if (transactionStatus === 'pending') {
            statusPembayaran = "MENUNGGU";
        }

        // 3. Update Status di Database
        const realPaymentId = orderId.split('-')[0];
        const pembayaran = await prisma.pembayaran.findUnique({
            where: { idPembayaran: realPaymentId }
        });

        if (!pembayaran) {
            return NextResponse.json({ error: "Pembayaran tidak ditemukan" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            // Update Pembayaran
            await tx.pembayaran.update({
                where: { idPembayaran: pembayaran.idPembayaran },
                data: {
                    status: statusPembayaran,
                    idTransaksiGateway: body.transaction_id,
                    metodeBayar: body.payment_type,
                    dibayarPada: statusPembayaran === "LUNAS" ? new Date() : null
                }
            });

            // Update Pemesanan
            await tx.pemesanan.update({
                where: { idPemesanan: pembayaran.pemesananId },
                data: {
                    status: statusPemesanan
                }
            });

            // Jika dibatalkan, kembalikan slot waktu
            if (statusPemesanan === "DIBATALKAN") {
                const p = await tx.pemesanan.findUnique({ where: { idPemesanan: pembayaran.pemesananId } });
                if (p?.slotWaktuId) {
                    await tx.slotwaktu.update({
                        where: { idSlotwaktu: p.slotWaktuId },
                        data: { sudahDipesan: false }
                    });
                }
            }
        });

        return NextResponse.json({ status: "OK" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
