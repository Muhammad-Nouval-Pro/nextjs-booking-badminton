"use client";

import { useState } from "react";
import { beriRating } from "@/app/actions/pelanggan";
import { useRouter } from "next/navigation";

type PemesananRating = {
  idPemesanan: string;
  kodePemesanan: string;
  rating: number | null;
  ulasan: string | null;
  dibuatPada: string;
  diperbaruiPada: string;
  lapanganNama: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  totalHarga: number;
};

function BintangInteraktif({
  nilai,
  onChange,
  disabled,
}: {
  nilai: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-bintang-wrapper">
      {[1, 2, 3, 4, 5].map((b) => (
        <button
          key={b}
          type="button"
          className={`rating-bintang-btn ${b <= (hover || nilai) ? "rating-bintang-aktif" : ""}`}
          onClick={() => !disabled && onChange(b)}
          onMouseEnter={() => !disabled && setHover(b)}
          onMouseLeave={() => setHover(0)}
          disabled={disabled}
          aria-label={`Rating ${b} bintang`}
        >
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill={b <= (hover || nilai) ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function BintangStatis({ nilai }: { nilai: number }) {
  return (
    <div className="rating-bintang-wrapper">
      {[1, 2, 3, 4, 5].map((b) => (
        <span
          key={b}
          className={`rating-bintang-statis ${b <= nilai ? "rating-bintang-aktif" : ""}`}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill={b <= nilai ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

function KartuBelumRating({ data }: { data: PemesananRating }) {
  const [rating, setRating] = useState(0);
  const [ulasan, setUlasan] = useState("");
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);
  const router = useRouter();

  const kirimRating = async () => {
    if (rating === 0) {
      alert("Pilih rating terlebih dahulu!");
      return;
    }
    setLoading(true);
    const res = await beriRating(data.idPemesanan, rating, ulasan);
    if (res.sukses) {
      setSukses(true);
      setTimeout(() => router.refresh(), 1500);
    } else {
      alert(res.pesan || "Gagal mengirim ulasan");
    }
    setLoading(false);
  };

  if (sukses) {
    return (
      <div className="rating-kartu rating-kartu-sukses">
        <div className="rating-kartu-sukses-ikon">✅</div>
        <h3>Terima kasih!</h3>
        <p>Ulasan Anda berhasil dikirim untuk {data.lapanganNama}</p>
      </div>
    );
  }

  return (
    <div className="rating-kartu">
      <div className="rating-kartu-header-info">
        <div className="rating-lap-ikon">🏸</div>
        <div className="rating-lap-info">
          <h3>{data.lapanganNama}</h3>
          <span className="rating-waktu">
            {data.tanggal} &bull; {data.jamMulai} - {data.jamSelesai}
          </span>
        </div>
        <span
          className="badge badge-abu"
          style={{ fontFamily: "monospace", flexShrink: 0 }}
        >
          {data.kodePemesanan}
        </span>
      </div>

      <div className="rating-form-section">
        <label className="rating-form-label">Bagaimana pengalaman Anda?</label>
        <BintangInteraktif nilai={rating} onChange={setRating} disabled={loading} />
        {rating > 0 && (
          <span className="rating-teks-level">
            {rating === 1 && "Sangat Buruk 😞"}
            {rating === 2 && "Kurang Baik 😕"}
            {rating === 3 && "Cukup Baik 😐"}
            {rating === 4 && "Baik 😊"}
            {rating === 5 && "Sangat Memuaskan 🤩"}
          </span>
        )}
      </div>

      <div className="rating-form-section">
        <label className="rating-form-label" htmlFor={`ulasan-${data.idPemesanan}`}>
          Tulis ulasan Anda (opsional)
        </label>
        <textarea
          id={`ulasan-${data.idPemesanan}`}
          className="rating-textarea"
          placeholder="Ceritakan pengalaman bermain Anda di sini..."
          rows={3}
          value={ulasan}
          onChange={(e) => setUlasan(e.target.value)}
          disabled={loading}
          maxLength={500}
        />
        <span className="rating-char-count">{ulasan.length}/500</span>
      </div>

      <button
        className="tombol-primer rating-tombol-kirim"
        onClick={kirimRating}
        disabled={loading || rating === 0}
      >
        {loading ? (
          <span className="rating-loading">
            <span className="rating-spinner" /> Mengirim...
          </span>
        ) : (
          <>⭐ Kirim Ulasan</>
        )}
      </button>
    </div>
  );
}

function KartuSudahRating({ data }: { data: PemesananRating }) {
  return (
    <div className="rating-kartu rating-kartu-selesai">
      <div className="rating-kartu-header-info">
        <div className="rating-lap-ikon rating-lap-ikon-selesai">🏸</div>
        <div className="rating-lap-info">
          <h3>{data.lapanganNama}</h3>
          <span className="rating-waktu">
            {data.tanggal} &bull; {data.jamMulai} - {data.jamSelesai}
          </span>
        </div>
        <span
          className="badge badge-abu"
          style={{ fontFamily: "monospace", flexShrink: 0 }}
        >
          {data.kodePemesanan}
        </span>
      </div>
      <div className="rating-result-section">
        <BintangStatis nilai={data.rating!} />
        {data.ulasan && (
          <div className="rating-ulasan-tampil">
            <span className="rating-ulasan-ikon">&ldquo;</span>
            {data.ulasan}
          </div>
        )}
      </div>
    </div>
  );
}

export function KontenRating({
  belumDirating,
  sudahDirating,
}: {
  belumDirating: PemesananRating[];
  sudahDirating: PemesananRating[];
}) {
  const [tab, setTab] = useState<"belum" | "sudah">("belum");

  return (
    <div>
      {/* Tab Switcher */}
      <div className="rating-tab-wrapper">
        <button
          className={`rating-tab ${tab === "belum" ? "rating-tab-aktif" : ""}`}
          onClick={() => setTab("belum")}
        >
          Belum Diulas
          {belumDirating.length > 0 && (
            <span className="rating-tab-count">{belumDirating.length}</span>
          )}
        </button>
        <button
          className={`rating-tab ${tab === "sudah" ? "rating-tab-aktif" : ""}`}
          onClick={() => setTab("sudah")}
        >
          Riwayat Ulasan
          {sudahDirating.length > 0 && (
            <span className="rating-tab-count rating-tab-count-selesai">
              {sudahDirating.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {tab === "belum" && (
        <div className="rating-list">
          {belumDirating.length === 0 ? (
            <div className="rating-empty">
              <div className="rating-empty-ikon">🎉</div>
              <h3>Semua pemesanan sudah diulas!</h3>
              <p>
                Terima kasih atas partisipasi Anda. Ulasan Anda membantu kami
                meningkatkan layanan.
              </p>
            </div>
          ) : (
            belumDirating.map((p) => <KartuBelumRating key={p.idPemesanan} data={p} />)
          )}
        </div>
      )}

      {tab === "sudah" && (
        <div className="rating-list">
          {sudahDirating.length === 0 ? (
            <div className="rating-empty">
              <div className="rating-empty-ikon">📝</div>
              <h3>Belum ada ulasan</h3>
              <p>
                Anda belum memberikan ulasan. Selesaikan pemesanan dan bagikan
                pengalaman Anda!
              </p>
            </div>
          ) : (
            sudahDirating.map((p) => <KartuSudahRating key={p.idPemesanan} data={p} />)
          )}
        </div>
      )}
    </div>
  );
}
