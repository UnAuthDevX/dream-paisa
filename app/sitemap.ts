import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const lastModified = new Date();

  return ['/', '/features', '/about', '/contact', '/privacy', '/terms'].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
  }));
}
