import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const blynkToken = process.env.BLYNK_TOKEN;
  
  // If no token is configured, return demo/placeholder data so the UI still works
  if (!blynkToken) {
    return NextResponse.json({
      V0: '0',
      V1: '0',
      V2: '90',
      V3: '90',
      _demo: true,
    });
  }

  try {
    const url = `https://blynk.cloud/external/api/get?token=${blynkToken}&V0&V1&V2&V3`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    } else {
      return NextResponse.json({ error: 'Failed to fetch from Blynk API.' }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error fetching telemetry data.' }, { status: 500 });
  }
}
