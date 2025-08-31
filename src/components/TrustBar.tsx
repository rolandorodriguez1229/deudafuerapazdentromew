import { Shield, ThumbsUp, Users } from 'lucide-react';

export default function TrustBar() {
  return (
    <section className="bg-white border-b border-neutral-200">
      <div className="section-container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Users className="h-5 w-5 text-accent-500" />
            <p className="text-sm text-neutral-700"><span className="font-semibold text-neutral-900">5,000+ familias</span> ya aplicaron el sistema</p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <ThumbsUp className="h-5 w-5 text-accent-500" />
            <p className="text-sm text-neutral-700"><span className="font-semibold text-neutral-900">96% satisfacción</span> reportada</p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-5 w-5 text-accent-500" />
            <p className="text-sm text-neutral-700"><span className="font-semibold text-neutral-900">Garantía 30 días</span> sin riesgo</p>
          </div>
        </div>
      </div>
    </section>
  );
}


