import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <span className="text-lg font-bold">社区互助</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              连接邻里，传递温暖。让每一份善意都能找到需要的人。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold">快速链接</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/requests" className="hover:text-foreground">浏览需求</Link></li>
              <li><Link href="/requests/new" className="hover:text-foreground">发布需求</Link></li>
              <li><Link href="/categories" className="hover:text-foreground">分类浏览</Link></li>
              <li><Link href="/customer-service" className="hover:text-foreground">AI客服</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-3">
            <h3 className="font-semibold">帮助中心</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help/guide" className="hover:text-foreground">使用指南</Link></li>
              <li><Link href="/help/faq" className="hover:text-foreground">常见问题</Link></li>
              <li><Link href="/help/rules" className="hover:text-foreground">社区规则</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold">关于我们</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">关于平台</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">联系我们</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">隐私政策</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 社区互助平台. 基于 Coze 平台开发.</p>
        </div>
      </div>
    </footer>
  );
}
