import { NextResponse } from 'next/server';

interface SubscribePayload {
  name: string;
  email: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SubscribePayload>;
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    // Placeholder for provider integration
    // e.g., await addToList({ name, email })
    console.log('[subscribe] New lead', { name, email });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}


