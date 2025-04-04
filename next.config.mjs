/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        return config;
    },
    transpilePackages: ['react-data-table-component'],
    experimental: {
        esmExternals: true
    }
}

export default nextConfig;
