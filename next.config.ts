import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler is enabled by the starter project and can optimize React components automatically.
  reactCompiler: true,
  // Next 16 uses Turbopack by default. Setting the root prevents Next from walking up to
  // C:\Users\sonir when another lockfile exists above this project.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
