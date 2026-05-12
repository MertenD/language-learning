import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Language Learning',
    short_name: 'LangLearn',
    description: 'Learning new languages made easy',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      { src: '/api/pwa-icon?size=192', sizes: '192x192', type: 'image/png' },
      {
        src: '/api/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        // @ts-expect-error — valid PWA manifest field
        purpose: 'any maskable',
      },
    ],
  }
}
