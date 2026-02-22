import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 정적 HTML 파일로 내보내기 설정 (Cloudflare Pages 최적화)
  images: {
    unoptimized: true, // 정적 내보내기 시 이미지 최적화 비활성화
  },
};

export default nextConfig;
