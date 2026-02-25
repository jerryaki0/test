import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, userId, message } = body;

    if (!requestId || !userId || !message) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 创建响应
    const { data, error } = await client
      .from('help_responses')
      .insert({
        request_id: requestId,
        user_id: userId,
        message,
        status: 'pending',
      })
      .select(`
        *,
        users!help_responses_user_id_fkey(id, username, avatar, rating)
      `)
      .single();

    if (error) {
      console.error('Create response error:', error);
      return NextResponse.json(
        { error: '响应失败' },
        { status: 500 }
      );
    }

    // 更新需求的响应数
    await client.rpc('increment_response_count', { request_id: requestId });

    return NextResponse.json({
      message: '响应成功',
      data,
    });
  } catch (error) {
    console.error('Create response error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { responseId, status } = body;

    if (!responseId || !status) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('help_responses')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', responseId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '更新失败' },
        { status: 500 }
      );
    }

    // 如果接受响应，更新需求状态
    if (status === 'accepted') {
      const { data: responseData } = await client
        .from('help_responses')
        .select('request_id')
        .eq('id', responseId)
        .single();

      if (responseData) {
        await client
          .from('help_requests')
          .update({ status: 'in_progress' })
          .eq('id', responseData.request_id);
      }
    }

    return NextResponse.json({
      message: '更新成功',
      data,
    });
  } catch (error) {
    console.error('Update response error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
