export default function GarantiaPage() {
  return (
    <main>
      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <h1 className="heading-lg text-neutral-900 mb-4">Garantía y Reembolsos</h1>
          <p className="text-neutral-700 mb-6">
            Confiamos totalmente en el método y queremos que compres sin riesgo. Por eso ofrecemos una
            garantía clara y sencilla.
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Garantía de 30 días</h2>
              <p className="text-neutral-700">
                Prueba el método durante 30 días. Si no liberas al menos el doble de lo que pagaste por el libro,
                te devolvemos tu dinero. Sin preguntas.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Cómo solicitar un reembolso</h2>
              <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                <li>Escríbenos dentro de los 30 días posteriores a tu compra indicando tu email y número de pedido.</li>
                <li>Procesamos reembolsos por el mismo método de pago (Stripe).</li>
                <li>El abono suele reflejarse en 3–5 días hábiles, dependiendo de tu banco.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Condiciones</h2>
              <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                <li>La garantía aplica a la compra del eBook digital “Deuda Fuera, Paz Dentro”.</li>
                <li>No solicitamos explicaciones, pero agradecemos comentarios para mejorar.</li>
                <li>Si tienes problemas con la descarga o acceso, te asistimos primero para que puedas probarlo.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Contacto</h2>
              <p className="text-neutral-700">
                ¿Necesitas ayuda con tu pedido? Escríbenos a
                <span className="font-medium"> contacto@deudafuerapazdentro.com</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


