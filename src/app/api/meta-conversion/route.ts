import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, clientUserAgent, ref, contentName, contentCategory: clientContentCategory } = body;

    // 1. Geolocation Priority
    let contentCategory = 'Prayer'; // default fallback
    if (ref) {
      contentCategory = ref.toUpperCase();
    } else if (clientContentCategory) {
      contentCategory = clientContentCategory.toUpperCase();
    } else {
      const vercelIpCountry = req.headers.get('x-vercel-ip-country');
      if (vercelIpCountry) {
        contentCategory = vercelIpCountry.toUpperCase();
      }
    }

    // 2. Event Match Quality (EMQ)
    const clientIpAddress = req.ip || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '0.0.0.0';
    
    // Read Meta cookies if available
    const fbp = req.cookies.get('_fbp')?.value;
    const fbc = req.cookies.get('_fbc')?.value;

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
          event_name: eventName, // Should be 'Subscribe'
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id: eventId,
          event_source_url: eventSourceUrl,
          user_data: {
            client_ip_address: clientIpAddress.split(',')[0].trim(),
            client_user_agent: clientUserAgent,
            fbp: fbp,
            fbc: fbc,
          },
          custom_data: {
            content_category: contentCategory,
            content_name: contentName || 'Unknown Country'
          },
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
    
    // Log the result to the Vercel console for debugging
    console.log("Meta CAPI Payload:", JSON.stringify(payload));
    console.log("Meta CAPI Result:", JSON.stringify(result));
    
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
