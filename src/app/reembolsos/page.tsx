export default function ReembolsosPage() {
  return (
    <main>
      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <h1 className="heading-lg text-neutral-900 mb-4">Política de Reembolsos</h1>
          <p className="text-neutral-700 mb-6">Garantía de satisfacción de 30 días para el eBook digital &quot;Deuda Fuera, Paz Dentro&quot;.</p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Garantía de 30 días</h2>
              <p className="text-neutral-700">Prueba el método durante 30 días. Si no estás satisfecho, te devolvemos tu dinero.</p>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Cómo solicitar el reembolso</h2>
              <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                <li>Escribe a <a href="mailto:contacto@deudafuerapazdentro.com" className="text-primary-600 underline">contacto@deudafuerapazdentro.com</a> dentro de los 30 días desde tu compra.</li>
                <li>Incluye tu email de compra y número de pedido.</li>
                <li>Procesamos el reembolso por Stripe; se refleja en 3–5 días hábiles.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Alcance</h2>
              <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                <li>Aplica a productos digitales de pago adquiridos en este sitio.</li>
                <li>No solicitamos explicaciones, pero agradecemos tus comentarios para mejorar.</li>
              </ul>
            </div>
          </div>

          <p className="text-neutral-700 mt-6">Consulta también nuestros <a href="/terminos" className="text-primary-600 underline">Términos y Condiciones</a> y <a href="/privacidad" className="text-primary-600 underline">Política de Privacidad</a>.</p>
        </div>
      </section>
    </main>
  );
}


