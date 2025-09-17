export default function PrivacidadPage() {
  return (
    <main>
      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <h1 className="heading-lg text-neutral-900 mb-4">Política de Privacidad</h1>
          <p className="text-neutral-700 mb-6">Tu privacidad es importante. Esta política explica qué datos recopilamos y cómo los usamos.</p>

          <div className="space-y-6 text-neutral-700">
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Datos que recopilamos</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nombre y correo cuando te suscribes o compras.</li>
                <li>Datos de pago procesados de forma segura por Stripe (no almacenamos tu tarjeta).</li>
                <li>Métricas anónimas de uso del sitio para mejorar la experiencia.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Cómo usamos tus datos</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Entregar tus compras y materiales.</li>
                <li>Comunicaciones esenciales sobre tu pedido o acceso.</li>
                <li>Enviar contenido útil si te suscribes (puedes darte de baja en cualquier momento).</li>
              </ul>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Terceros</h2>
              <p>Usamos Stripe para pagos. Consulta su seguridad en <a href="https://stripe.com" className="text-primary-600 underline" target="_blank" rel="noopener noreferrer">stripe.com</a>.</p>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Contacto</h2>
              <p>Para cualquier solicitud de privacidad, escribe a <a href="mailto:contacto@deudafuerapazdentro.com" className="text-primary-600 underline">contacto@deudafuerapazdentro.com</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


