import { ShieldCheck } from 'lucide-react';

export default function GuaranteeSection() {
  return (
    <section className="py-16 bg-white">
      <div className="section-container">
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="heading-md text-neutral-900 mb-3">Garantía 30 días — sin riesgo</h3>
            <p className="text-neutral-700 mb-4">Prueba el método durante 30 días. Si no liberas al menos el doble de lo que pagaste por el libro, te devolvemos tu dinero. Sin preguntas.</p>
            <p className="text-neutral-600">Consulta los detalles en nuestra <a href="/garantia" className="text-primary-600 underline">política de reembolsos</a> o escríbenos a <a href="mailto:contacto@deudafuerapazdentro.com" className="text-primary-600 underline">contacto@deudafuerapazdentro.com</a>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


