import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    let query = client
      .from('help_requests')
      .select(`
        *,
        users!help_requests_user_id_fkey(id, username, avatar, rating),
        categories(id, name, icon)
      `)
      .order('created_at', { ascending: false });

    // 应用过滤条件
    if (category && category !== 'all') {
      query = query.eq('category_id', parseInt(category));
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (urgency && urgency !== 'all') {
      query = query.eq('urgency', urgency);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 分页
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Fetch requests error:', error);
      return NextResponse.json(
        { error: '获取数据失败' },
        { status: 500 }
      );
    }

    // 获取总数
    let countQuery = client
      .from('help_requests')
      .select('*', { count: 'exact', head: true });

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category_id', parseInt(category));
    }
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (urgency && urgency !== 'all') {
      countQuery = countQuery.eq('urgency', urgency);
    }
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      categoryId,
      urgency,
      location,
      rewardPoints,
      images,
    } = body;

    if (!userId || !title || !description) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('help_requests')
      .insert({
        user_id: userId,
        title,
        description,
        category_id: categoryId,
        urgency: urgency || 'medium',
        location,
        reward_points: rewardPoints || 0,
        images: images || [],
        status: 'open',
        view_count: 0,
        response_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create request error:', error);
      return NextResponse.json(
        { error: '创建失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '发布成功',
      data,
    });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
