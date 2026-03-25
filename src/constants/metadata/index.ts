import { env } from '@/lib/env';

export const COMMON_METADATA = {
  icons: [
    {
      rel: 'icon',
      url: '/favicon/favicon.ico',
      type: 'image/x-icon',
      sizes: 'any',
    },
    {
      rel: 'icon',
      url: '/favicon/favicon-16x16.png',
      type: 'image/png',
      sizes: '16x16',
    },
    {
      rel: 'icon',
      url: '/favicon/favicon-32x32.png',
      type: 'image/png',
      sizes: '32x32',
    },
    {
      rel: 'apple-touch-icon',
      url: '/favicon/apple-touch-icon.png',
      sizes: '180x180',
    },
  ],
  // TODO: Update title and description for your project
  title: env.NEXT_PUBLIC_APP_NAME,
  description: 'Built with Next.js starter template',
};
