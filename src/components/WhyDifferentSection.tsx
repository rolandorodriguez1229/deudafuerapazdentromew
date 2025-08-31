export default function WhyDifferentSection() {
  return (
    <section className="py-16 bg-white">
      <div className="section-container max-w-5xl">
        <h2 className="heading-lg text-neutral-900 mb-4">¿Por qué este método es diferente?</h2>
        <p className="text-neutral-700 mb-6">Los métodos tradicionales hablan de Bola de Nieve o Avalancha. Aquí además tienes el Método Oxígeno Rápido para cuando tu IPD es alto y necesitas flujo inmediato.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-2">IPD alto</h3>
            <p className="text-neutral-700">Oxígeno Rápido (flujo primero)</p>
          </div>
          <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-2">IPD medio</h3>
            <p className="text-neutral-700">Bola de Nieve (motivación)</p>
          </div>
          <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-2">IPD bajo</h3>
            <p className="text-neutral-700">Avalancha (eficiencia)</p>
          </div>
        </div>
        <div className="mt-8">
          <a href="/plantilla-gratuita" className="btn-urgent">Descubre tu GPS Anti-Deuda</a>
        </div>
      </div>
    </section>
  );
}


