import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '硅谷：第一天与最后一天',
  description: 'Day 1 & Last Day — A Silicon Valley fate engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex items-center justify-center p-5">
        {children}
      </body>
    </html>
  );
}
