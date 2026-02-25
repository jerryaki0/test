'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  User,
  MessageSquare,
  Bell,
  Menu,
  LogOut,
  Settings,
  Plus,
  Bot,
} from 'lucide-react';
import { getStoredUser, clearStoredUser } from '@/lib/storage';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            社区互助
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            首页
          </Link>
          <Link
            href="/requests"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            互助列表
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            分类浏览
          </Link>
          <Link
            href="/customer-service"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
          >
            <Bot className="h-4 w-4" />
            AI客服
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/requests/new">
                <Button size="sm" className="hidden sm:flex">
                  <Plus className="h-4 w-4 mr-1" />
                  发布需求
                </Button>
              </Link>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt={user.username} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        欢迎回来
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-requests" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      我的发布
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      设置
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t py-4 px-4 bg-background">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/requests"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              互助列表
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              分类浏览
            </Link>
            <Link
              href="/customer-service"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI客服
            </Link>
            {user && (
              <Link
                href="/requests/new"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                发布需求
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
