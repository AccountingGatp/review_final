import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,   // skips type errors on build
    },
}

export default nextConfig
