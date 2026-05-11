import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, clientUserAgent, customData } = body;

    // Extract IP address correctly from Vercel/Cloudflare headers
    // Vercel populates req.ip natively. Fallback to common proxy headers.
    const clientIpAddress = req.ip || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '0.0.0.0';

    const pixelId = "1008459651842584";
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!accessToken) {
      console.warn("META_ACCESS_TOKEN is missing in environment variables. Conversions API event not sent.");
      return NextResponse.json({ success: false, error: "Missing META_ACCESS_TOKEN" }, { status: 500 });
    }

    // Prepare the payload for Meta Conversions API
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id: eventId,
          event_source_url: eventSourceUrl,
          user_data: {
            client_ip_address: clientIpAddress.split(',')[0].trim(),
            client_user_agent: clientUserAgent,
          },
          custom_data: customData || {},
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        access_token: accessToken,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Meta CAPI Error:", result);
      return NextResponse.json({ success: false, error: result }, { status: response.status });
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("CAPI internal error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
