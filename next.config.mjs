/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors '*'"
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
