'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Loader2,
  Trash2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { getStoredUser } from '@/lib/storage';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CustomerServicePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    setUserId(user ? user.id : 'guest_' + Date.now());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const messageId = Date.now().toString();
    
    // 添加用户消息
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }]);
    
    if (!messageText) setInput('');
    setLoading(true);

    // 添加助手消息占位符
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      const response = await fetch('/api/customer-service/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: conversationId,
          userId: userId,
        }),
      });

      if (!response.ok) throw new Error('请求失败');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text_chunk = decoder.decode(value);
          const lines = text_chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'conversation_created') {
                  setConversationId(parsed.conversationId);
                } else if (parsed.type === 'delta' || parsed.type === 'message') {
                  if (parsed.content && !parsed.content.startsWith('{"msg_type"')) {
                    fullContent += parsed.content;
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages.find(m => m.id === assistantMessageId);
                      if (lastMessage) {
                        lastMessage.content = fullContent;
                      }
                      return newMessages;
                    });
                  }
                }
              } catch {
                // 解析错误
              }
            }
          }
        }
      }

      if (!fullContent) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages.find(m => m.id === assistantMessageId);
          if (lastMessage) {
            lastMessage.content = '抱歉，我暂时无法回答您的问题，请稍后再试。';
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages.find(m => m.id === assistantMessageId);
        if (lastMessage) {
          lastMessage.content = '网络错误，请检查网络连接后重试。';
        }
        return newMessages;
      });
      toast.error('发送失败，请重试');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    toast.success('对话已清空');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 快捷指令
  const quickCommands = [
    { label: '写文案', prompt: '帮我写一段关于社区互助的宣传文案' },
    { label: '查知识', prompt: '介绍一下如何使用社区互助平台' },
    { label: '做计划', prompt: '帮我制定一个社区活动计划' },
    { label: '提建议', prompt: '给我一些提升社区活跃度的建议' },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col max-w-3xl mx-auto">
      {/* 顶部区域 */}
      <header className="border-b py-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-semibold">AI 助手</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <Trash2 className="h-4 w-4" />
              清空对话
            </Button>
            <span className="text-muted-foreground">|</span>
            <Link 
              href="/help" 
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              帮助中心
            </Link>
          </div>
        </div>
      </header>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500/50" />
              <p className="text-lg mb-2">欢迎使用 AI 助手</p>
              <p className="text-sm">有什么可以帮你的？</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="leading-relaxed">
              {message.role === 'user' ? (
                <div className="text-foreground">
                  <span className="font-medium text-blue-600">【你】</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(message.timestamp)}
                  </span>
                  <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                <div className="text-foreground">
                  <span className="font-medium text-green-600">【AI】</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.content ? (
                    <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <p className="mt-1 text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      思考中...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <div className="border-t p-4 sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你想聊的内容..."
            disabled={loading}
            className="flex-1 h-12 text-base"
          />
          <Button 
            type="submit" 
            disabled={loading || !input.trim()} 
            className="h-12 px-6"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 mr-1" />
            )}
            发送
          </Button>
        </form>

        {/* 底部功能 */}
        <div className="mt-4 space-y-3">
          {/* 快捷指令 */}
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((cmd) => (
              <Button
                key={cmd.label}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(cmd.prompt)}
                disabled={loading}
                className="text-sm"
              >
                {cmd.label}
              </Button>
            ))}
          </div>
          
          {/* 提示 */}
          <p className="text-xs text-muted-foreground text-center">
            支持文字提问，可随时清空对话
          </p>
        </div>
      </div>
    </div>
  );
}
