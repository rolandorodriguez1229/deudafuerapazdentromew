import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deudafuerapazdentro.com';

const staticRoutes = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/comprar', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/diagnostico', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/plantilla-gratuita', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/guia-estrategias', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/garantia', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/reembolsos', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/sobre-mi', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/contacto', priority: 0.4, changeFrequency: 'yearly' as const },
  { path: '/privacidad', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/terminos', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
];

const blogSlugs = [
  'ipd-oxigeno-financiero',
  'flujo-vs-intereses',
  'diagnostico-360-sin-dolor',
  'estrategia-oxigeno-rapido',
  'estrategia-bola-de-nieve',
  'estrategia-avalancha',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
  const posts = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  return [...base, ...posts];
}
