const faqs = [
  {
    q: '¿Y si gano poco dinero?',
    a: 'El método se adapta a tu realidad. Primero liberamos flujo (Oxígeno) para que puedas respirar, sin importar tu nivel de ingresos.'
  },
  {
    q: '¿Esto es diferente a la bola de nieve o avalancha?',
    a: 'Sí. Incluye ambos, pero además un tercero: Oxígeno Rápido, diseñado para cuando la presión es alta y necesitas resultados inmediatos.'
  },
  {
    q: '¿Necesito conocimientos financieros?',
    a: 'No. Está explicado de forma simple y práctica. Si sabes leer, puedes aplicar el sistema paso a paso.'
  },
  {
    q: '¿Cómo accedo al libro?',
    a: 'Al comprar con Stripe, se crea tu acceso privado. Recibirás un email con instrucciones para entrar a tu cuenta (usuario: tu correo; podrás configurar contraseña en el primer acceso) y tendrás los enlaces de descarga y materiales de apoyo.'
  },
  {
    q: '¿Cuánto tiempo tardaré en ver resultados?',
    a: 'Muchos ven claridad inmediata y cambios de flujo en el primer mes. En 30–90 días consolidan hábitos y progreso.'
  },
  {
    q: '¿Y si no tengo dinero extra?',
    a: 'El método empieza liberando flujo desde el primer mes con la estrategia Oxígeno Rápido. Ordenamos tus deudas por ROI de flujo para recuperar efectivo sin depender de ganar más.'
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-neutral-900 mb-4">Preguntas Frecuentes</h2>
          <p className="text-neutral-600">Resolvamos tus dudas antes de comprar</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-white rounded-lg border border-neutral-200 p-6">
              <summary className="cursor-pointer font-semibold text-neutral-900 marker:hidden flex items-center justify-between">
                {f.q}
                <span className="text-primary-600 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="mt-2 text-neutral-700">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


