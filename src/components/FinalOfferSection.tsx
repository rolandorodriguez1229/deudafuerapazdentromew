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
            <div className="line-through text-neutral-400">$14.99</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-neutral-900 font-semibold">Hoy solo</div>
            <div className="text-3xl font-bold text-accent-600">$7.99</div>
          </div>
        </div>
        <p className="text-neutral-700 mb-6">
          Piensa en esto: por menos de lo que gastas en dos cafés ☕, tendrás un plan paso a paso para salir de deudas y recuperar tu tranquilidad. Cada día que pospongas esta decisión, sigues pagando intereses a los bancos. Hoy puedes empezar a pagarte a ti mismo.
        </p>
        <div className="text-center">
          <button onClick={handleCheckout} className="btn-urgent text-lg py-4">Sí, quiero mi copia por solo $7.99</button>
          <p className="text-xs text-neutral-500 mt-3">⚡ Oferta válida solo durante la semana de lanzamiento o hasta agotar las primeras 100 copias digitales.</p>
        </div>
      </div>
    </section>
  );
}


