/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgcdn.stablediffusionweb.com",
      },
      {
        protocol: "https",
        hostname: "www.shutterstock.com",
      },
      {
        protocol: "https",
        hostname: "i1.sndcdn.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
        {
          protocol: "https",
          hostname: "www.creativehatti.com",
        },
        {
          protocol: "https",
          hostname: "ih1.redbubble.net",
        },
        {
          protocol: "https",
          hostname: "mir-s3-cdn-cf.behance.net",
        },
        {
          protocol: "https",
          hostname: "i.pinimg.com",
        },
    ],
  },
};

export default nextConfig;

