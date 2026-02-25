'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Info,
  MessageSquare,
} from 'lucide-react';
import { getStoredUser } from '@/lib/storage';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BotInfo {
  name: string;
  description: string;
  avatar?: string;
}

export default function CustomerServicePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [botInfo, setBotInfo] = useState<BotInfo>({
    name: 'AI 客服助手',
    description: '智能客服，随时为您解答问题',
  });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 获取用户信息
    const user = getStoredUser();
    if (user) {
      setUserId(user.id);
    } else {
      setUserId('guest_' + Date.now());
    }

    // 获取智能体信息
    fetchBotInfo();
  }, []);

  useEffect(() => {
    // 滚动到底部
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchBotInfo = async () => {
    try {
      const response = await fetch('/api/customer-service/chat');
      if (response.ok) {
        const data = await response.json();
        setBotInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch bot info:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const messageId = Date.now().toString();
    
    // 添加用户消息
    setMessages(prev => [...prev, {
      id: messageId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);
    
    setInput('');
    setLoading(true);

    // 添加一个空的助手消息占位符
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
          message: userMessage,
          conversationId: conversationId,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'conversation_created') {
                  setConversationId(parsed.conversationId);
                } else if (parsed.type === 'delta' || parsed.type === 'message') {
                  fullContent += parsed.content || '';
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages.find(m => m.id === assistantMessageId);
                    if (lastMessage) {
                      lastMessage.content = fullContent;
                    }
                    return newMessages;
                  });
                } else if (parsed.error) {
                  toast.error(parsed.error);
                }
              } catch {
                // 解析错误，跳过
              }
            }
          }
        }
      }

      // 如果没有收到内容，显示默认消息
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

  return (
    <div className="container py-6 max-w-4xl h-[calc(100vh-10rem)]">
      <Card className="h-full flex flex-col">
        {/* Header */}
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={botInfo.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{botInfo.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Coze 智能体
                  </Badge>
                  <span className="text-xs text-muted-foreground">在线</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1">
                <RefreshCw className="h-4 w-4" />
                清空对话
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{botInfo.name}</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  {botInfo.description}
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {[
                    '如何使用平台？',
                    '如何发布互助需求？',
                    '积分规则说明',
                    '联系人工客服',
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      className="h-auto py-3 px-4 text-left justify-start"
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                    >
                      <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.role === 'user' ? (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    } flex flex-col gap-1`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted rounded-tl-sm'
                      }`}
                    >
                      {message.content ? (
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {message.content}
                        </pre>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">思考中...</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            由 Coze 智能体提供支持 · AI 生成内容仅供参考
          </p>
        </div>
      </Card>
    </div>
  );
}
