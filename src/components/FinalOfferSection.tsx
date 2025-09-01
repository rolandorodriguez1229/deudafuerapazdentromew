"use client";
export default function FinalOfferSection() {
  async function handleCheckout() {
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (_) {}
  }
  return (
    <section className="py-16 bg-white">
      <div className="section-container max-w-3xl">
        <h2 className="heading-lg text-neutral-900 mb-4">Invierte menos que lo que gastas en un café al día y gana tu paz financiera.</h2>
        <p className="text-neutral-700 mb-6">
          No quiero que el precio sea un obstáculo para que recuperes tu libertad. Por eso, hoy puedes obtener <strong>Deuda Fuera, Paz Dentro</strong> con un descuento especial de lanzamiento:
        </p>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-neutral-600">Precio normal</div>
            <div className="line-through text-neutral-400">$19.99</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-neutral-900 font-semibold">Hoy solo</div>
            <div className="text-3xl font-bold text-accent-600">$7.99</div>
          </div>
          <div className="mt-3 text-sm font-medium text-neutral-800">Hoy $7.99 e incluye estos 3 bonos de regalo:</div>
          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-sm">
            <div className="bg-white border border-neutral-200 rounded-lg p-3">🎁 Plantilla IPD 360° (Valorada en $29.99)</div>
            <div className="bg-white border border-neutral-200 rounded-lg p-3">🎁 Checklist 30-60-90 días (Valorada en $19.99)</div>
            <div className="bg-white border border-neutral-200 rounded-lg p-3">🎁 Scripts para negociar con acreedores (Valorados en $24.99)</div>
          </div>
          <div className="mt-2 text-xs text-neutral-600">Valor de los bonos: $74.97 — ¡Llévate el libro y más de $75 en bonos por solo $7.99!</div>
        </div>
        <p className="text-neutral-700 mb-6">
          Piensa en esto: por menos de lo que gastas en dos cafés ☕, tendrás un plan paso a paso para salir de deudas y recuperar tu tranquilidad. Cada día que pospongas esta decisión, sigues pagando intereses a los bancos. Hoy puedes empezar a pagarte a ti mismo.
        </p>
        <div className="text-center">
          <button onClick={handleCheckout} className="btn-urgent text-lg py-4">Sí, quiero mi copia por solo $7.99</button>
          <div className="text-xs text-neutral-500 mt-2">Antes $19.99 · Hoy $7.99 (lanzamiento)</div>
          <p className="text-xs text-neutral-500 mt-3">⚡ Oferta de lanzamiento válida hasta el 1 de noviembre o primeras 100 compras.</p>
        </div>
      </div>
    </section>
  );
}


