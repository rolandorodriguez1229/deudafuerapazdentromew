import { Shield, ThumbsUp, Users } from 'lucide-react';

export default function TrustBar() {
  return (
    <section className="bg-white border-b border-neutral-200">
      <div className="section-container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Users className="h-5 w-5 text-accent-500" />
            <p className="text-sm text-neutral-700"><span className="font-semibold text-neutral-900">Cientos de lectores</span> ya aplican el método IPD</p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <ThumbsUp className="h-5 w-5 text-accent-500" />
            <p className="text-sm text-neutral-700"><span className="font-semibold text-neutral-900">Pago seguro con Stripe</span> · Acceso inmediato</p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-5 w-5 text-accent-500" />
            <p className="text-sm text-neutral-700"><span className="font-semibold text-neutral-900">Garantía 30 días</span> sin preguntas</p>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 text-center mt-3">Cifras basadas en ventas y lectores del programa. Resultados individuales pueden variar.</p>
      </div>
    </section>
  );
}


