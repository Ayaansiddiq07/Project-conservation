import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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

