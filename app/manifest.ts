import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DreamPaisa', short_name: 'DreamPaisa', description: 'Your personal finance companion.',
    start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#0f766e',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  };
}
