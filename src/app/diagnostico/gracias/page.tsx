import type { Metadata } from 'next';
import GraciasPoller from '@/components/gps/GraciasPoller';
import { requireUser } from '@/lib/gps/auth';

export const metadata: Metadata = {
  title: '¡Gracias!',
  alternates: { canonical: '/diagnostico/gracias' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function GraciasGpsPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; plan?: string }>;
}) {
  await requireUser('/diagnostico/gracias');
  const params = await searchParams;

  return (
    <div className="section-container py-16 max-w-lg mx-auto">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8">
        <GraciasPoller
          plan={params.plan === 'year' ? 'year' : 'month'}
          sessionId={params.session_id}
        />
      </div>
    </div>
  );
}
