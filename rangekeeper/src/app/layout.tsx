import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'RangeKeeper',
    template: '%s | RangeKeeper',
  },
  description:
    'AI-powered academic planning and executive function support for college students with ASD and ADHD.',
  keywords: ['ADHD', 'ASD', 'academic planner', 'executive function', 'Canvas LMS', 'college'],
  authors: [{ name: 'RangeKeeper' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    siteName: 'RangeKeeper',
    title: 'RangeKeeper — Stay on Track, One Step at a Time',
    description:
      'AI-powered academic planning and executive function support for college students with ASD and ADHD.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RangeKeeper — Stay on Track, One Step at a Time',
    description:
      'AI-powered academic planning and executive function support for college students with ASD and ADHD.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
