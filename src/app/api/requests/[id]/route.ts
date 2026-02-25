import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    // 获取需求详情
    const { data: helpRequest, error } = await client
      .from('help_requests')
      .select(`
        *,
        users!help_requests_user_id_fkey(id, username, avatar, bio, rating, help_count),
        categories(id, name, icon)
      `)
      .eq('id', parseInt(id))
      .single();

    if (error || !helpRequest) {
      return NextResponse.json(
        { error: '需求不存在' },
        { status: 404 }
      );
    }

    // 增加浏览次数
    await client
      .from('help_requests')
      .update({ view_count: (helpRequest.view_count || 0) + 1 })
      .eq('id', parseInt(id));

    // 获取响应列表
    const { data: responses } = await client
      .from('help_responses')
      .select(`
        *,
        users!help_responses_user_id_fkey(id, username, avatar, rating)
      `)
      .eq('request_id', parseInt(id))
      .order('created_at', { ascending: true });

    return NextResponse.json({
      request: helpRequest,
      responses: responses || [],
    });
  } catch (error) {
    console.error('Fetch request detail error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, resolvedAt } = body;

    const client = getSupabaseClient();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (resolvedAt) updateData.resolved_at = resolvedAt;

    const { data, error } = await client
      .from('help_requests')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '更新失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '更新成功',
      data,
    });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('help_requests')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '删除成功',
    });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
