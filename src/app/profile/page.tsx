'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Star,
  Heart,
  MessageSquare,
  Loader2,
  Settings,
  Save,
} from 'lucide-react';
import { getStoredUser, setStoredUser } from '@/lib/storage';
import { STATUS_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';
import type { HelpRequest } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    skills?: string[];
    location?: string;
    rating: number;
    helpCount: number;
    points: number;
    createdAt: string;
  } | null>(null);
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [respondedRequests, setRespondedRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 编辑表单
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    skills: '',
  });

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }
    fetchUserData(storedUser.id);
  }, [router]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      // 获取用户信息
      const userRes = await fetch(`/api/users/me?userId=${userId}`);
      const userData = await userRes.json();

      if (userRes.ok) {
        setUser(userData.user);
        setFormData({
          username: userData.user.username,
          bio: userData.user.bio || '',
          location: userData.user.location || '',
          skills: (userData.user.skills || []).join(', '),
        });
      }

      // 获取发布的需求
      const publishedRes = await fetch(`/api/users/requests?userId=${userId}&type=published`);
      if (publishedRes.ok) {
        const publishedData = await publishedRes.json();
        setMyRequests(publishedData.requests || []);
      }

      // 获取响应的需求
      const respondedRes = await fetch(`/api/users/requests?userId=${userId}&type=responded`);
      if (respondedRes.ok) {
        const respondedData = await respondedRes.json();
        setRespondedRequests(respondedData.requests || []);
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, ...data.user });
        setStoredUser({ id: user.id, email: user.email, username: data.user.username });
        setEditing(false);
        toast.success('保存成功');
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container py-8 max-w-6xl">
      {/* User Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{user.rating}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>用户名</Label>
                      <Input
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>所在地区</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>技能标签</Label>
                    <Input
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="用逗号分隔，如：英语,烹饪,摄影"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>个人简介</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          保存
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{user.username}</h1>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      编辑资料
                    </Button>
                  </div>

                  {user.bio && (
                    <p className="text-muted-foreground">{user.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {user.location && (
                      <span>📍 {user.location}</span>
                    )}
                    <span>📅 加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>

                  {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex md:flex-col gap-4 md:gap-2 text-center">
              <div className="px-4 py-2 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold">{user.helpCount}</div>
                <div className="text-xs text-muted-foreground">帮助次数</div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold">{user.points}</div>
                <div className="text-xs text-muted-foreground">积分</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="published" className="space-y-4">
        <TabsList>
          <TabsTrigger value="published" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            我发布的 ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="responded" className="gap-2">
            <Heart className="h-4 w-4" />
            我响应的 ({respondedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                暂无发布的互助需求
              </CardContent>
            </Card>
          ) : (
            myRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{request.title}</h3>
                        <Badge className={STATUS_CONFIG[request.status].color}>
                          {STATUS_CONFIG[request.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {request.description}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(request.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="responded" className="space-y-4">
          {respondedRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                暂无响应的互助需求
              </CardContent>
            </Card>
          ) : (
            respondedRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{request.title}</h3>
                        <Badge className={STATUS_CONFIG[request.status].color}>
                          {STATUS_CONFIG[request.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {request.description}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(request.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
