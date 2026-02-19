import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse and pdfjs-dist out of the Next.js webpack bundle.
  // They rely on dynamic worker file resolution that breaks when bundled —
  // marking them as external lets Node.js require() them directly at runtime.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
};

export default nextConfig;
