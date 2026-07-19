import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Returns the visitor's country code using Vercel's built-in IP geolocation.
 * Vercel automatically adds the x-vercel-ip-country header to every request.
 * This endpoint makes it available to client-side code.
 */
export async function GET(req: NextRequest) {
  const country = req.headers.get('x-vercel-ip-country') || '';
  return NextResponse.json({ country: country.toUpperCase() });
}
