import { NextRequest } from 'next/server';

// Coze 智能体配置
const COZE_CONFIG = {
  token: 'pat_nrOjdpWaHjGAiMuABcTEPihVXIIzVblRq2lJz2qHdvJ4f6fzxDYCXJjOypI61tuW',
  botId: '7568429249947041811',
  baseUrl: 'https://api.coze.cn',
};

// 过滤掉内部消息
function isValidContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  // 过滤掉 JSON 格式的内部消息
  if (content.startsWith('{"msg_type":')) return false;
  if (content.startsWith('{"finish_reason":')) return false;
  return true;
}

// 发送消息到 Coze 智能体并获取流式响应
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, userId } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: '消息内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Coze Chat] Sending message:', message);

    // 创建对话 - 使用 v3/chat API
    const chatResponse = await fetch(`${COZE_CONFIG.baseUrl}/v3/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: COZE_CONFIG.botId,
        user_id: userId || 'user_' + Date.now(),
        stream: true,
        auto_save_history: true,
        additional_messages: [
          {
            role: 'user',
            content: message,
            content_type: 'text',
          }
        ],
        ...(conversationId ? { conversation_id: conversationId } : {}),
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('[Coze Chat] API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI 服务暂时不可用: ' + chatResponse.status }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = chatResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let currentConversationId = conversationId;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('[Coze Chat] Stream done');
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;
              
              // 解析 SSE 格式
              if (trimmedLine.startsWith('event:')) {
                continue;
              }
              
              if (trimmedLine.startsWith('data:')) {
                const dataStr = trimmedLine.slice(5).trim();
                if (dataStr === '' || dataStr === '{}' || dataStr === '[DONE]') {
                  continue;
                }
                
                try {
                  const parsed = JSON.parse(dataStr);
                  
                  // Coze v3 API 返回的数据格式
                  if (parsed.content && parsed.role === 'assistant') {
                    const content = parsed.content;
                    if (isValidContent(content)) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                        type: 'delta',
                        content: content 
                      })}\n\n`));
                    }
                  }
                  // 对话 ID
                  else if (parsed.conversation_id && !parsed.content) {
                    currentConversationId = parsed.conversation_id;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'conversation_created',
                      conversationId: currentConversationId 
                    })}\n\n`));
                  }
                  // 完整消息
                  else if (parsed.type === 'answer' && parsed.content && isValidContent(parsed.content)) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'message',
                      content: parsed.content 
                    })}\n\n`));
                  }
                  // 状态
                  else if (parsed.status === 'completed') {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'done',
                      conversationId: currentConversationId 
                    })}\n\n`));
                  }
                  
                } catch (parseError) {
                  // JSON 解析失败
                  console.log('[Coze Chat] Parse error for line:', dataStr.slice(0, 100));
                }
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[Coze Chat] Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '流式响应错误' })}\n\n`));
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
    console.error('[Coze Chat] Error:', error);
    return new Response(JSON.stringify({ error: 'AI 服务暂时不可用' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 获取智能体信息
export async function GET() {
  try {
    const response = await fetch(`${COZE_CONFIG.baseUrl}/v1/bot/get_online_info?bot_id=${COZE_CONFIG.botId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${COZE_CONFIG.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        name: 'AI 客服助手',
        description: '智能客服，随时为您解答问题'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({
      name: data.data?.name || 'AI 客服助手',
      description: data.data?.description || '智能客服，随时为您解答问题',
      avatar: data.data?.icon_url || null,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Coze Bot] Get info error:', error);
    return new Response(JSON.stringify({ 
      name: 'AI 客服助手',
      description: '智能客服，随时为您解答问题'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
