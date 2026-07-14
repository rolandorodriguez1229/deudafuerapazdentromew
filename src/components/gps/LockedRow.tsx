import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

/** La fila bloqueada que ve el plan Free: que vea lo que no tiene. */
export default function LockedRow() {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-accent-300 bg-accent-50 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent-700" />
          </div>
          <div>
            <div className="font-bold text-accent-900">Tu deuda objetivo: 🔒</div>
            <div className="text-sm text-accent-700">
              El plan Full te dice exactamente qué deuda atacar primero, cuándo quedas libre y
              cuántos intereses te ahorras.
            </div>
          </div>
        </div>
        <Link href="/diagnostico/plan" className="btn-urgent whitespace-nowrap">
          Desbloquear mi plan <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
