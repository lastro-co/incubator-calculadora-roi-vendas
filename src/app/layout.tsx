import { COMMON_METADATA } from '@/constants/metadata';
import { AppProviders } from '@/providers';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Red_Hat_Display, Red_Hat_Mono, Red_Hat_Text } from 'next/font/google';

const redHatDisplay = Red_Hat_Display({
  variable: '--font-family-display',
  subsets: ['latin'],
});

const redHatText = Red_Hat_Text({
  variable: '--font-family-text',
  subsets: ['latin'],
});

const redHatMono = Red_Hat_Mono({
  variable: '--font-family-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = COMMON_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${redHatDisplay.variable} ${redHatText.variable} ${redHatMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
