'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Clock,
  User,
  Eye,
  MessageSquare,
  Star,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { URGENCY_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import { getStoredUser } from '@/lib/storage';
import { toast } from 'sonner';
import type { HelpRequest, HelpResponse as HelpResponseType } from '@/lib/types';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [responses, setResponses] = useState<HelpResponseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    fetchRequestDetail();
  }, [requestId]);

  const fetchRequestDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/requests/${requestId}`);
      const data = await response.json();

      if (response.ok) {
        setRequest(data.request);
        setResponses(data.responses || []);
      } else {
        toast.error('需求不存在');
        router.push('/requests');
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!user) {
      toast.error('请先登录');
      router.push('/login');
      return;
    }

    if (!responseText.trim()) {
      toast.error('请输入响应内容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: parseInt(requestId),
          userId: user.id,
          message: responseText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('响应成功！');
        setResponseText('');
        fetchRequestDetail();
      } else {
        toast.error(data.error || '响应失败');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptResponse = async (responseId: number) => {
    try {
      const res = await fetch('/api/responses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseId,
          status: 'accepted',
        }),
      });

      if (res.ok) {
        toast.success('已接受该帮助');
        fetchRequestDetail();
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const isOwner = user?.id === request.userId;

  return (
    <div className="container py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回列表
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Detail */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{request.title}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-3 flex-wrap">
                    <Badge className={STATUS_CONFIG[request.status].color}>
                      {STATUS_CONFIG[request.status].label}
                    </Badge>
                    <Badge className={URGENCY_CONFIG[request.urgency].color}>
                      {URGENCY_CONFIG[request.urgency].label}
                    </Badge>
                    {request.categories && (
                      <Badge variant="outline">
                        {request.categories.icon} {request.categories.name}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                {request.rewardPoints > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-orange-500">
                      🎁 {request.rewardPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">积分奖励</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {request.description}
              </p>

              <Separator className="my-6" />

              {/* Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{request.location || '未设置'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(request.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{request.viewCount} 次浏览</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{request.responseCount} 个响应</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">帮助响应 ({responses.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {responses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  暂无响应，成为第一个提供帮助的人吧！
                </p>
              ) : (
                responses.map((response) => (
                  <div
                    key={response.id}
                    className="p-4 rounded-lg bg-muted/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={response.users?.avatar} />
                          <AvatarFallback>
                            {response.users?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{response.users?.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(response.createdAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {response.status === 'accepted' && (
                          <Badge className="bg-green-100 text-green-700">
                            已接受
                          </Badge>
                        )}
                        {isOwner && response.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptResponse(response.id)}
                          >
                            接受帮助
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{response.message}</p>
                  </div>
                ))
              )}

              {/* Response Form */}
              {request.status === 'open' && (
                <div className="mt-6 space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">提供帮助</h4>
                    <Textarea
                      placeholder="描述您能提供的帮助..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSubmitResponse} disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            提交中...
                          </>
                        ) : (
                          '提交响应'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publisher Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">发布者信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.users?.avatar} />
                  <AvatarFallback>
                    {request.users?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{request.users?.username}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{request.users?.rating || 5}</span>
                    <span>·</span>
                    <span>{request.users?.helpCount || 0} 次帮助</span>
                  </div>
                </div>
              </div>
              {request.users?.bio && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {request.users.bio}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">管理操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" disabled>
                  编辑需求
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-500 hover:text-red-600"
                  disabled
                >
                  关闭需求
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
