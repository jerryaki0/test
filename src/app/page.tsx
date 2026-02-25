'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Search, 
  Users, 
  Sparkles, 
  ArrowRight,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-6">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              基于 Coze AI 平台驱动
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                连接邻里，传递温暖
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              社区互助平台让每一份善意都能找到需要的人。
              发布需求、提供帮助、共建和谐社区。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Link href="/requests">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  浏览互助需求
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="gap-2">
                  加入社区
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            <StatCard label="活跃用户" value="1,234" icon={<Users className="h-4 w-4" />} />
            <StatCard label="互助需求" value="567" icon={<Heart className="h-4 w-4" />} />
            <StatCard label="已解决" value="892" icon={<TrendingUp className="h-4 w-4" />} />
            <StatCard label="互助评分" value="4.9" icon={<Sparkles className="h-4 w-4" />} />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">互助分类</h2>
              <p className="text-muted-foreground mt-1">选择您需要的帮助类型</p>
            </div>
            <Link href="/categories">
              <Button variant="ghost" className="gap-1">
                查看全部 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEFAULT_CATEGORIES.slice(0, 8).map((category) => (
              <Link key={category.id} href={`/requests?category=${category.id}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Requests Section */}
      <section className="container py-16 bg-muted/30">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">最新互助需求</h2>
              <p className="text-muted-foreground mt-1">查看社区最新发布的帮助需求</p>
            </div>
            <Link href="/requests">
              <Button className="gap-1">
                查看全部 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards - will be replaced with real data */}
            {[
              { 
                title: '需要周末照顾宠物的帮助', 
                category: '生活帮助', 
                location: '朝阳区', 
                time: '2小时前',
                urgency: 'medium' as const 
              },
              { 
                title: '寻求英语学习辅导', 
                category: '学习辅导', 
                location: '海淀区', 
                time: '5小时前',
                urgency: 'low' as const 
              },
              { 
                title: '电脑系统重装求助', 
                category: '技术支持', 
                location: '西城区', 
                time: '1天前',
                urgency: 'high' as const 
              },
            ].map((request, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{request.title}</CardTitle>
                    <Badge 
                      variant={
                        request.urgency === 'high' ? 'destructive' : 
                        request.urgency === 'medium' ? 'default' : 'secondary'
                      }
                    >
                      {request.urgency === 'high' ? '紧急' : request.urgency === 'medium' ? '一般' : '低'}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {request.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {request.time}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{request.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold">如何使用</h2>
            <p className="text-muted-foreground mt-1">简单三步，开启互助之旅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: '注册账户',
                description: '快速注册，完善个人信息和技能标签',
                icon: <Users className="h-8 w-8" />,
              },
              {
                step: '02',
                title: '发布或响应',
                description: '发布您的帮助需求，或响应他人的求助',
                icon: <Heart className="h-8 w-8" />,
              },
              {
                step: '03',
                title: '互助完成',
                description: '完成任务后互相评价，积累信用积分',
                icon: <Sparkles className="h-8 w-8" />,
              },
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 text-8xl font-bold text-muted/20 -translate-y-4 translate-x-4">
                  {item.step}
                </div>
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0">
          <CardContent className="py-12 px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              准备好加入社区了吗？
            </h2>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              立即注册成为社区一员，无论是需要帮助还是想要提供帮助，
              这里都有您的舞台。
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                立即注册
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
