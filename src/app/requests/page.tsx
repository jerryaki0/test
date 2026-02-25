'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, MapPin, Clock, User, Loader2 } from 'lucide-react';
import { DEFAULT_CATEGORIES, URGENCY_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import type { HelpRequest, Category } from '@/lib/types';

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // 过滤条件
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    status: searchParams.get('status') || 'all',
    urgency: searchParams.get('urgency') || 'all',
    search: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [filters, pagination.page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.urgency !== 'all') params.append('urgency', filters.urgency);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/requests?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRequests(data.data);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRequests();
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">互助需求列表</h1>
          <p className="text-muted-foreground mt-1">
            浏览社区中的互助需求，找到您可以提供帮助的项目
          </p>
        </div>
        <Link href="/requests/new">
          <Button>发布需求</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索需求..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="open">待帮助</SelectItem>
                <SelectItem value="in_progress">进行中</SelectItem>
                <SelectItem value="resolved">已解决</SelectItem>
                <SelectItem value="closed">已关闭</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.urgency}
              onValueChange={(value) => setFilters({ ...filters, urgency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="紧急程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="low">低</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="urgent">紧急</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">暂无符合条件的互助需求</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Link key={request.id} href={`/requests/${request.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{request.title}</h3>
                        <Badge className={STATUS_CONFIG[request.status].color}>
                          {STATUS_CONFIG[request.status].label}
                        </Badge>
                        <Badge className={URGENCY_CONFIG[request.urgency].color}>
                          {URGENCY_CONFIG[request.urgency].label}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {request.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {request.users && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {request.users.username}
                          </span>
                        )}
                        {request.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {request.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(request.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      {request.categories && (
                        <Badge variant="outline">
                          {request.categories.icon} {request.categories.name}
                        </Badge>
                      )}
                      {request.rewardPoints > 0 && (
                        <div className="text-sm text-orange-500">
                          🎁 {request.rewardPoints} 积分
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {request.responseCount} 响应 · {request.viewCount} 浏览
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => Math.abs(page - pagination.page) <= 2)
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      isActive={page === pagination.page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  className={pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
