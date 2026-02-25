import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/sonner';
import { AIAssistant } from '@/components/ai-assistant';

export const metadata: Metadata = {
  title: {
    default: '社区互助平台',
    template: '%s | 社区互助平台',
  },
  description:
    '连接邻里，传递温暖。基于 Coze 平台的社区互助服务系统，让每一份善意都能找到需要的人。',
  keywords: [
    '社区互助',
    '邻里帮助',
    '志愿服务',
    '技能交换',
    '社区服务',
    '互助平台',
  ],
  authors: [{ name: 'Community Help Team' }],
  openGraph: {
    title: '社区互助平台 | 连接邻里，传递温暖',
    description:
      '基于 Coze 平台的社区互助服务系统，让每一份善意都能找到需要的人。',
    type: 'website',
    locale: 'zh_CN',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen flex flex-col">
        {isDev && <Inspector />}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
        <AIAssistant />
      </body>
    </html>
  );
}
