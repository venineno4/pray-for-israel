/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Embeddable widget only — the main site's headers are untouched.
        // Allowed embedders: same origin, Vercel preview deployments and
        // allisraelnews.com (+ subdomains). Any other site is blocked by the browser.
        // (CSP only supports a leading `*.` wildcard, so previews need `*.vercel.app`.)
        source: '/widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.vercel.app https://allisraelnews.com https://*.allisraelnews.com;"
          }
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale(en|de|fr|es|pt|ru|ko|hu)',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:locale(en|de|fr|es|pt|ru|ko|hu)/:path*',
        destination: '/:path*',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
