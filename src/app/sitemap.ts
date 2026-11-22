import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://topglasswindowtint.com';
  const routes = ['', '/quote', '/films', '/tint-laws', '/princeton-tx', '/faq'];

  return routes.flatMap((route) => [
    {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' || route === '/quote' ? 1 : 0.8,
    },
    {
      url: `${baseUrl}/es${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' || route === '/quote' ? 0.9 : 0.7,
    },
  ]);
}
