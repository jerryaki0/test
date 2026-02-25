import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取用户信息
    const { data: user, error } = await client
      .from('users')
      .select('id, email, username, avatar, bio, skills, location, rating, help_count, points, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, bio, skills, location, avatar } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (skills) updateData.skills = skills;
    if (location !== undefined) updateData.location = location;
    if (avatar !== undefined) updateData.avatar = avatar;

    const { data, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, username, avatar, bio, skills, location, rating, help_count, points')
      .single();

    if (error) {
      return NextResponse.json(
        { error: '更新失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '更新成功',
      user: data,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
