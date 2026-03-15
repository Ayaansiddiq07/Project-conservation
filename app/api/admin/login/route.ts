import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function createToken(username: string, secret: string): string {
  const payload = JSON.stringify({
    user: username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const encoded = Buffer.from(payload).toString('base64');
  return `${encoded}.${hmac}`;
}

export async function POST(req: Request) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminUser || !adminPass || !adminSecret) {
    return NextResponse.json({ error: 'Admin credentials not configured on server.' }, { status: 503 });
  }

  try {
    const { username, password } = await req.json();

    if (username === adminUser && password === adminPass) {
      const token = createToken(username, adminSecret);

      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 60 * 60, // 24 hours
      });

      return response;
    } else {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
