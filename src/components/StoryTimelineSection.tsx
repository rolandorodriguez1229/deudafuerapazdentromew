export default function StoryTimelineSection() {
  const items = [
    {
      icon: '💸',
      title: 'Antes',
      text: 'Deuda cercana a $90,000 · $3,900/mes en mínimos · Ansiedad diaria',
    },
    {
      icon: '🔧',
      title: 'Durante',
      text: 'Diagnóstico 360° + IPD · Método Oxígeno para liberar flujo rápido',
    },
    {
      icon: '❤️',
      title: 'Hoy',
      text: 'Paz financiera · Flujo bajo control · Plan claro y sostenible',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="section-container max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.title} className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">{it.icon}</div>
              <h3 className="font-semibold text-neutral-900 mb-1">{it.title}</h3>
              <p className="text-sm text-neutral-700">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


