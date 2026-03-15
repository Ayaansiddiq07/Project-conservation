import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ authenticated: false });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const [encoded, hash] = token.split('.');
    const payload = Buffer.from(encoded, 'base64').toString('utf8');
    const expectedHash = crypto.createHmac('sha256', adminSecret).update(payload).digest('hex');

    if (hash !== expectedHash) {
      return NextResponse.json({ authenticated: false });
    }

    const data = JSON.parse(payload);
    if (data.exp < Date.now()) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, user: data.user });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
