import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    // No password set = no protection (allows local dev without password)
    return NextResponse.json({ success: true });
  }

  if (password === sitePassword) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
}
