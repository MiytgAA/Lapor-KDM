import Link from 'next/link';
import { Shield, ArrowRight, Edit3, CheckCircle, Navigation, MessageCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--canvas)' }}>
      {/* Navbar */}
      <nav style={{ padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid var(--hairline)' }}>
            <img src="/kdm-bg.png" alt="Logo KDM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>Lapor KDM</span>
            <span style={{ fontSize: 11, color: 'var(--mute)' }}>Sistem Pengaduan Masyarakat</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" className="btn btn-secondary">Masuk</Link>
          <Link href="/register" className="btn btn-primary">Daftar</Link>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 5%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Background Image Watermark */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '120%',
            backgroundImage: 'url("/kdm-bg.png")',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.08,
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', color: 'var(--accent-info)', padding: '6px 16px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, marginBottom: 32 }}>
              <Shield size={14} />
              Sistem Pelayanan Pengaduan Publik Resmi
            </div>

            <h1 className="display-xl" style={{ marginBottom: 24, letterSpacing: '-0.02em' }}>
              Sampaikan Aspirasi & Pengaduan Anda <span style={{ color: 'var(--accent-info)' }}>Secara Terbuka</span>
            </h1>

            <p className="body-lg" style={{ color: 'var(--body-mid)', maxWidth: 700, margin: '0 auto 40px', lineHeight: 1.6 }}>
              Suara Anda adalah langkah awal perubahan pelayanan publik yang lebih baik. Laporkan permasalahan di sekitar Anda secara cepat, transparan, dan terpercaya.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ minWidth: 200 }}>
                Laporkan Sekarang <ArrowRight size={18} />
              </Link>
              <a href="#cara-kerja" className="btn btn-secondary btn-lg" style={{ minWidth: 200 }}>
                Pelajari Alur Kerja
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '40px 5%', borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', background: '#fafafa' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
            <div style={{ borderRight: '1px solid var(--hairline)' }}>
              <h2 className="display-lg" style={{ color: 'var(--accent-info)' }}>1K</h2>
              <p className="body-sm" style={{ marginTop: 8 }}>Total Pengaduan</p>
            </div>
            <div style={{ borderRight: '1px solid var(--hairline)' }}>
              <h2 className="display-lg" style={{ color: 'var(--accent-green)' }}>98%</h2>
              <p className="body-sm" style={{ marginTop: 8 }}>Laporan Selesai</p>
            </div>
            <div style={{ borderRight: '1px solid var(--hairline)' }}>
              <h2 className="display-lg" style={{ color: 'var(--accent-purple)' }}>24 Jam</h2>
              <p className="body-sm" style={{ marginTop: 8 }}>Respon Tanggap</p>
            </div>
            <div>
              <h2 className="display-lg" style={{ color: 'var(--accent-orange)' }}>100%</h2>
              <p className="body-sm" style={{ marginTop: 8 }}>Transparan & Valid</p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="cara-kerja" style={{ padding: '80px 5%', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="display-md" style={{ marginBottom: 12 }}>Bagaimana Sistem Bekerja?</h2>
            <p className="body-md" style={{ color: 'var(--mute)' }}>4 alur sederhana sistem dalam memproses pengaduan masyarakat untuk ditindaklanjuti.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {/* Card 1 */}
            <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: '#eff6ff', color: 'var(--accent-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
                1
              </div>
              <h3 className="display-xs" style={{ marginBottom: 12 }}>Tulis Laporan</h3>
              <p className="body-sm" style={{ marginBottom: 24, flex: 1 }}>
                Laporkan keluhan atau aspirasi Anda secara lengkap beserta lokasi spesifik dan bukti foto yang valid.
              </p>
              <Link href="/register" style={{ color: 'var(--accent-info)', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                Mulai Melaporkan <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: '#fffbeb', color: 'var(--status-pending)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
                2
              </div>
              <h3 className="display-xs" style={{ marginBottom: 12 }}>Proses Verifikasi</h3>
              <p className="body-sm" style={{ marginBottom: 24, flex: 1 }}>
                Petugas administrator akan memverifikasi kesesuaian berkas dan bukti laporan Anda dalam waktu singkat.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--status-pending)' }}>
                Status Menunggu <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--status-pending)' }}></span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: '#f0fdf4', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
                3
              </div>
              <h3 className="display-xs" style={{ marginBottom: 12 }}>Tindak Lanjut</h3>
              <p className="body-sm" style={{ marginBottom: 24, flex: 1 }}>
                Instansi pemerintah terkait akan langsung mengambil tindakan fisik guna menyelesaikan masalah di lapangan.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>
                Status Disetujui <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent-green)' }}></span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-full)', background: '#f3e8ff', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>
                4
              </div>
              <h3 className="display-xs" style={{ marginBottom: 12 }}>Kolom Diskusi</h3>
              <p className="body-sm" style={{ marginBottom: 24, flex: 1 }}>
                Pelapor dan administrator dapat saling berkomunikasi secara dua arah melalui kolom komentar interaktif.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent-purple)' }}>
                Diskusi Terbuka <MessageCircle size={14} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--hairline)', padding: '40px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent-info)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="white" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>Lapor KDM</span>
              <span style={{ fontSize: 11, color: 'var(--mute)' }}>Layanan Aspirasi & Pengaduan Lintas Instansi</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--mute)', fontWeight: 500 }}>
            <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Tentang Kami</Link>
            <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Kebijakan Privasi</Link>
            <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Syarat Ketentuan</Link>
            <Link href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Hubungi Kami</Link>
          </div>

          <div style={{ fontSize: 12, color: 'var(--mute)' }}>
            © {new Date().getFullYear()} Lapor KDM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
