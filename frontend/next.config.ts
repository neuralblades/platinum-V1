import type { NextConfig } from "next";
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Configure webpack for PostgreSQL and Sequelize
  webpack: (config: any) => {
    config.externals.push({
      'pg-native': 'pg-native',
      'sqlite3': 'sqlite3',
      'tedious': 'tedious',
      'pg-hstore': 'pg-hstore'
    });
    return config;
  },
  
  // Configure external packages for serverless
  serverExternalPackages: ['sequelize', 'pg'],
  
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platinum-square-backend.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hostinger.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.hostinger.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lxfsvrefcxfmaygzllbt.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = withBundleAnalyzer(nextConfig);
