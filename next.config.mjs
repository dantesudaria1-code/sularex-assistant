/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Allow the /widget route to be embedded as an iframe on sularex.com
    return [
      {
        source: "/widget",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://sularex.com https://*.sularex.com https://*.netlify.app" },
        ],
      },
    ];
  },
};
export default nextConfig;
