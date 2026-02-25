import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const type = request.nextUrl.searchParams.get('type') || 'published'; // published | responded

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    if (type === 'published') {
      // 用户发布的需求
      const { data, error } = await client
        .from('help_requests')
        .select(`
          *,
          categories(id, name, icon)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: '获取失败' },
          { status: 500 }
        );
      }

      return NextResponse.json({ requests: data });
    } else {
      // 用户响应的需求
      const { data, error } = await client
        .from('help_responses')
        .select(`
          *,
          help_requests(
            *,
            categories(id, name, icon)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: '获取失败' },
          { status: 500 }
        );
      }

      // 整理数据格式
      const requests = data?.map((response: Record<string, unknown>) => response.help_requests).filter(Boolean) || [];

      return NextResponse.json({ requests });
    }
  } catch (error) {
    console.error('Fetch user requests error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
