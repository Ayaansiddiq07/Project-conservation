import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function verifyAdmin(): Promise<boolean> {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;

  try {
    const [encoded, hash] = token.split('.');
    const payload = Buffer.from(encoded, 'base64').toString('utf8');
    const expectedHash = crypto.createHmac('sha256', adminSecret).update(payload).digest('hex');
    if (hash !== expectedHash) return false;

    const data = JSON.parse(payload);
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Verify admin authentication first
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  const blynkToken = process.env.BLYNK_TOKEN;
  
  if (!blynkToken) {
    return NextResponse.json({ error: 'Blynk token not configured. Set BLYNK_TOKEN in .env.local' }, { status: 503 });
  }

  try {
    const { angle } = await req.json();

    if (angle === undefined || isNaN(angle) || angle < 0 || angle > 180) {
      return NextResponse.json({ error: 'Invalid angle. Must be between 0 and 180.' }, { status: 400 });
    }

    const url = `https://blynk.cloud/external/api/update?token=${blynkToken}&V3=${angle}`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (res.ok) {
      return NextResponse.json({ success: true, angle });
    } else {
      return NextResponse.json({ error: 'Failed to update Blynk API.' }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error updating tilt.' }, { status: 500 });
  }
}


