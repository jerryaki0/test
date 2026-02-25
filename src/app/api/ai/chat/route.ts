import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// AI 助手聊天 API - 流式输出
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是社区互助平台的AI助手，你的任务是：
1. 帮助用户更好地描述他们的互助需求
2. 回答关于平台使用的问题
3. 提供社区互助相关的建议
4. 保持友善、专业的态度

回复要求：
- 简洁明了，避免冗长
- 使用中文回复
- 如果用户想发布需求，引导他们提供：标题、详细描述、紧急程度、所在地区等信息`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // 如果有上下文，添加到消息中
    if (context && Array.isArray(context)) {
      context.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      });
    }

    messages.push({ role: 'user', content: message });

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages, { temperature: 0.7 });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'AI服务暂时不可用' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(JSON.stringify({ error: 'AI服务暂时不可用' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
