export default function TerminosPage() {
  return (
    <main>
      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <h1 className="heading-lg text-neutral-900 mb-4">Términos y Condiciones</h1>
          <p className="text-neutral-700 mb-6">Estos términos regulan el uso del sitio y la compra de nuestros productos digitales.</p>

          <div className="space-y-6 text-neutral-700">
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Acceso y licencia</h2>
              <p>El acceso al eBook y materiales es personal e intransferible. No se permite su redistribución.</p>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Propiedad intelectual</h2>
              <p>El método IPD™ y todos los contenidos están protegidos por derechos de autor. Queda prohibida su copia o uso comercial sin autorización.</p>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Pagos y reembolsos</h2>
              <p>Los pagos se procesan mediante Stripe. Consulta nuestra <a href="/reembolsos" className="text-primary-600 underline">política de reembolsos</a>.</p>
            </div>

            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">Contacto</h2>
              <p>Soporte: <a href="mailto:contacto@deudafuerapazdentro.com" className="text-primary-600 underline">contacto@deudafuerapazdentro.com</a></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


