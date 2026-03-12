// // next.config.mjs
// export default {
//   env: {
//     NEXT_PUBLIC_API_URL: "https://your-api-url.com/api", // <- Replace with your actual API URL
//   },
// };

// next.config.mjs
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;