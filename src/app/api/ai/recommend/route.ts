import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 智能推荐 API - 根据用户需求和技能匹配推荐
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    if (type === 'match_helper') {
      // 为需求推荐合适的帮助者
      return await matchHelper(client, data);
    } else if (type === 'recommend_requests') {
      // 为用户推荐感兴趣的需求
      return await recommendRequests(client, data);
    } else if (type === 'improve_description') {
      // AI 帮助改进需求描述
      return await improveDescription(client, data);
    }

    return NextResponse.json({ error: '无效的请求类型' }, { status: 400 });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 500 });
  }
}

// 为需求推荐合适的帮助者
async function matchHelper(llmClient: LLMClient, data: { requestId: number; title: string; description: string; category?: string }) {
  const supabase = getSupabaseClient();

  // 获取有相关技能的用户
  const { data: users } = await supabase
    .from('users')
    .select('id, username, skills, rating, help_count, bio')
    .eq('is_active', true)
    .limit(20);

  if (!users || users.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  const prompt = `你是一个社区互助平台的智能匹配助手。请根据以下互助需求，从用户列表中推荐最合适的帮助者。

需求信息：
- 标题：${data.title}
- 描述：${data.description}
- 分类：${data.category || '未分类'}

候选帮助者列表：
${users.map((u, i) => `${i + 1}. ${u.username} - 技能: [${(u.skills || []).join(', ')}] - 评分: ${u.rating} - 帮助次数: ${u.help_count} - 简介: ${u.bio || '无'}`).join('\n')}

请分析每位用户的技能、评分和经验，推荐最合适的3-5位帮助者。返回JSON格式：
{
  "recommendations": [
    {
      "username": "用户名",
      "match_score": 匹配分数(1-100),
      "reason": "推荐理由"
    }
  ]
}

只返回JSON，不要其他内容。`;

  const response = await llmClient.invoke(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3 }
  );

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    }
  } catch {
    // 解析失败，返回空推荐
  }

  return NextResponse.json({ recommendations: [] });
}

// 为用户推荐感兴趣的需求
async function recommendRequests(llmClient: LLMClient, data: { userId: string; skills?: string[] }) {
  const supabase = getSupabaseClient();

  // 获取开放的需求
  const { data: requests } = await supabase
    .from('help_requests')
    .select(`
      id, title, description, urgency, category_id, location,
      categories(name, icon)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(15);

  if (!requests || requests.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  const prompt = `你是一个社区互助平台的智能推荐助手。请根据用户的技能和兴趣，推荐最适合ta帮助的需求。

用户技能：[${(data.skills || []).join(', ')}]

待帮助的需求列表：
${requests.map((r, i) => {
  const category = r.categories as { name?: string } | null;
  return `${i + 1}. ${r.title} - 紧急程度: ${r.urgency} - 分类: ${category?.name || '其他'} - 地点: ${r.location || '未知'} - 描述: ${r.description.slice(0, 100)}...`;
}).join('\n')}

请分析用户技能与需求的匹配度，推荐3-5个最适合的需求。返回JSON格式：
{
  "recommendations": [
    {
      "request_id": 需求ID,
      "match_score": 匹配分数(1-100),
      "reason": "推荐理由"
    }
  ]
}

只返回JSON，不要其他内容。`;

  const response = await llmClient.invoke(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3 }
  );

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    }
  } catch {
    // 解析失败
  }

  return NextResponse.json({ recommendations: [] });
}

// AI 帮助改进需求描述
async function improveDescription(llmClient: LLMClient, data: { title: string; description: string }) {
  const prompt = `你是一个社区互助平台的内容助手。请帮助用户改进他们的互助需求描述，使其更清晰、更有吸引力。

原始标题：${data.title}
原始描述：${data.description}

请提供：
1. 改进后的标题（更简洁明了，不超过50字）
2. 改进后的描述（更详细、更有条理，100-300字）
3. 建议的分类（生活帮助、学习辅导、技术支持、医疗健康、法律咨询、心理支持、技能交换、其他帮助）

返回JSON格式：
{
  "improved_title": "改进后的标题",
  "improved_description": "改进后的描述",
  "suggested_category": "建议分类"
}

只返回JSON，不要其他内容。`;

  const response = await llmClient.invoke(
    [{ role: 'user', content: prompt }],
    { temperature: 0.5 }
  );

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    }
  } catch {
    // 解析失败
  }

  return NextResponse.json({
    improved_title: data.title,
    improved_description: data.description,
    suggested_category: '其他帮助'
  });
}
