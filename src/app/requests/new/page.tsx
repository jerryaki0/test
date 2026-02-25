'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { getStoredUser } from '@/lib/storage';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { toast } from 'sonner';

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    urgency: 'medium',
    location: '',
    rewardPoints: 0,
  });

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      toast.error('请先登录');
      router.push('/login');
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('请填写标题和描述');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          rewardPoints: Number(formData.rewardPoints),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || '发布失败');
        return;
      }

      toast.success('发布成功！');
      router.push('/requests');
    } catch (error) {
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">发布互助需求</CardTitle>
          <CardDescription>
            详细描述您的需求，让社区的伙伴们能够更好地帮助您
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">需求标题 *</Label>
              <Input
                id="title"
                placeholder="简明扼要地描述您的需求"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
                required
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">详细描述 *</Label>
              <Textarea
                id="description"
                placeholder="请详细描述您的需求，包括具体情况、期望的帮助方式等..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                required
              />
            </div>

            {/* 分类和紧急程度 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>分类</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>紧急程度</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低 - 不着急</SelectItem>
                    <SelectItem value="medium">中 - 一般</SelectItem>
                    <SelectItem value="high">高 - 比较着急</SelectItem>
                    <SelectItem value="urgent">紧急 - 非常着急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 地点和积分 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">所在地区</Label>
                <Input
                  id="location"
                  placeholder="如：北京市朝阳区"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardPoints">奖励积分</Label>
                <Input
                  id="rewardPoints"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={formData.rewardPoints}
                  onChange={(e) => setFormData({ ...formData, rewardPoints: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  提供积分奖励可以吸引更多帮助者
                </p>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                取消
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发布中...
                  </>
                ) : (
                  '发布需求'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
