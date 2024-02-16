/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.rithul.dev",
      },
    ],
  },
};

module.exports = nextConfig;
