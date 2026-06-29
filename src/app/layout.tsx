import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import { ThemeProvider } from '../providers/ThemeProvider';
import { NavbarConnected } from '../components/layout/NavbarConnected';
import { Footer } from '../components/layout/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'NOIR MARKET', template: '%s — NOIR MARKET' },
  description: 'A premium e-commerce experience.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ThemeProvider>
          <NavbarConnected />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
