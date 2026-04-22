import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Deuda Fuera, Paz Dentro — Método para salir de deudas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'linear-gradient(135deg, #0b1e52 0%, #1e3a8a 55%, #4338ca 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            opacity: 0.85,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Libro · Rolando Rodríguez
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 1040,
          }}
        >
          Deuda Fuera,
          <br />
          <span style={{ color: '#facc15' }}>Paz Dentro.</span>
        </div>
        <div
          style={{
            fontSize: 34,
            opacity: 0.9,
            marginTop: 28,
            maxWidth: 1000,
          }}
        >
          El método que me sacó de $90,000 — haz tu plan en 15 minutos.
        </div>
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 26,
          }}
        >
          <div
            style={{
              background: '#facc15',
              color: '#0b1e52',
              padding: '12px 24px',
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Solo $7.99
          </div>
          <div style={{ opacity: 0.85 }}>Garantía de 30 días · Acceso inmediato</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
