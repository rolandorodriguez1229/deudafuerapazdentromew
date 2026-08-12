import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, LogOut } from 'lucide-react';
import { signOut } from '@/app/diagnostico/actions';
import DeleteAccount from '@/components/gps/DeleteAccount';
import GpsNav from '@/components/gps/GpsNav';
import PortalButton from '@/components/gps/PortalButton';
import { requireUser } from '@/lib/gps/auth';
import { getEntitlement } from '@/lib/gps/entitlement';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Tu cuenta',
  alternates: { canonical: '/diagnostico/cuenta' },
  robots: { index: false },
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  trialing: 'Periodo de prueba',
  past_due: 'Pago pendiente — revisa tu tarjeta',
  canceled: 'Cancelada',
  unpaid: 'Sin pagar',
  incomplete: 'Incompleta',
};

export const dynamic = 'force-dynamic';

export default async function CuentaPage() {
  const { supabase, user } = await requireUser('/diagnostico/cuenta');
  const [locale, entitlement] = await Promise.all([getLocale(), getEntitlement(supabase)]);

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/cuenta" locale={locale} />

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h1 className="heading-md text-primary-900 mb-4">Tu cuenta</h1>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 flex-wrap">
              <dt className="text-neutral-500">Correo</dt>
              <dd className="font-medium text-neutral-800">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4 flex-wrap">
              <dt className="text-neutral-500">Plan</dt>
              <dd>
                {entitlement === 'full' ? (
                  <span className="font-bold text-green-700">GPS Full ⭐</span>
                ) : (
                  <span className="font-medium text-neutral-700">Gratuito</span>
                )}
              </dd>
            </div>
            {sub && (
              <>
                <div className="flex justify-between gap-4 flex-wrap">
                  <dt className="text-neutral-500">Estado</dt>
                  <dd className="font-medium text-neutral-800">
                    {STATUS_LABEL[sub.status] ?? sub.status}
                  </dd>
                </div>
                {sub.current_period_end && (
                  <div className="flex justify-between gap-4 flex-wrap">
                    <dt className="text-neutral-500">
                      {sub.cancel_at_period_end ? 'Acceso hasta' : 'Se renueva el'}
                    </dt>
                    <dd className="font-medium text-neutral-800">
                      {new Date(sub.current_period_end).toLocaleDateString('es-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {entitlement === 'full' && sub ? (
            <PortalButton />
          ) : (
            <Link href="/diagnostico/plan" className="btn-primary">
              Mejorar a Full <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-lg font-semibold text-neutral-500 hover:text-neutral-700"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </form>
        </div>

        <div className="border-t border-neutral-200 pt-6 space-y-3">
          <p className="text-xs text-neutral-400">
            Tus datos financieros son privados: nunca los vendemos, los compartimos ni los usamos
            para publicidad. Se guardan cifrados. Escríbenos a{' '}
            <a href="mailto:contacto@deudafuerapazdentro.com" className="underline">
              contacto@deudafuerapazdentro.com
            </a>{' '}
            para cualquier duda.
          </p>
          <DeleteAccount locale={locale} />
        </div>
      </div>
    </div>
  );
}
