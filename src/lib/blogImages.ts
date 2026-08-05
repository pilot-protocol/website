import bannerImageManifest from '../data/bannerImageManifest.json';

export interface BlogImage {
  src: string;
  srcset?: string;
  width: number;
  height: number;
}

export function getBlogImage(source: string): BlogImage {
  const optimized = bannerImageManifest[source as keyof typeof bannerImageManifest];
  return optimized || { src: source, width: 1200, height: 630 };
}
