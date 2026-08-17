import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const host = request.headers.get('host') || 'prayforisrael.live';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const manifest = {
    id: `${baseUrl}/?source=pwa`,
    name: "Pray for Israel Live",
    short_name: "Pray4Israel",
    description: "Join the global community praying for Israel in real-time.",
    start_url: `${baseUrl}/?source=pwa`,
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    related_applications: [
      {
        platform: "webapp",
        url: `${baseUrl}/api/manifest`,
        id: `${baseUrl}/?source=pwa`
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
