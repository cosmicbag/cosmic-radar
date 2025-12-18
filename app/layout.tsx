import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import MobileNav from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'Cosmic Radar - Crypto & DeFi Dashboard',
  description: 'Track the top 200 cryptocurrencies, DeFi protocols, and market insights with real-time data from CoinMarketCap and DeFi Llama',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="pb-16 md:pb-0">
        <SessionProvider>
          {children}
          <MobileNav />
        </SessionProvider>
      </body>
    </html>
  );
}
