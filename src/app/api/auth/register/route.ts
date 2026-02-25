import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, bio, location, skills } = body;

    // 验证必填字段
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: '邮箱、用户名和密码为必填项' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查邮箱是否已存在
    const { data: existingEmail } = await client
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const { data: existingUsername } = await client
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { error: '该用户名已被使用' },
        { status: 400 }
      );
    }

    // 创建用户（注意：实际项目中密码应该加密存储）
    const { data: user, error } = await client
      .from('users')
      .insert({
        email,
        username,
        password, // 注意：生产环境应该使用 bcrypt 等加密
        bio: bio || null,
        location: location || null,
        skills: skills || [],
        rating: 5,
        help_count: 0,
        points: 0,
        is_active: true,
      })
      .select('id, email, username, avatar, bio, skills, location, rating, help_count, points')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { error: '注册失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '注册成功',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
