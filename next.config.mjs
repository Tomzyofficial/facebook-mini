/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [new URL("https://res.cloudinary.com/debemjvza/image/upload/v1754933320/profileUploads/**")],
  },
};

export default nextConfig;
