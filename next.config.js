/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    experimental: {
        typedRoutes: true,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Exclude Node.js modules from client-side bundle
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
                child_process: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
