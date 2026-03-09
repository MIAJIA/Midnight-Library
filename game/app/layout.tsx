import type { Metadata } from 'next';
import { Press_Start_2P, Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

const shareTech = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '硅谷：第一天与最后一天',
  description: 'Day 1 & Last Day — A Silicon Valley fate engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${pressStart.variable} ${shareTech.variable}`}>
      <body className="min-h-screen flex items-center justify-center p-5">
        {children}
      </body>
    </html>
  );
}
