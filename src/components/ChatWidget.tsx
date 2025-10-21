import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Maximize2, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de fitness con IA. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);
    setMessage('');

    // TODO: Send message to AI API - POST /api/chat/message
    // Simulate AI response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Entiendo tu pregunta. Para brindarte una mejor experiencia, te recomiendo abrir el chat completo donde puedo ayudarte de manera más detallada.',
        },
      ]);
    }, 1000);
  };

  const handleExpandChat = () => {
    navigate('/chat-ia');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-6 md:right-6 bottom-20 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 group"
        aria-label="Abrir chat con asistente IA"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          <Sparkles className="h-3 w-3" />
        </span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col md:bottom-6 md:right-6 bottom-20 right-4">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white dark:text-white rounded-t-lg flex-shrink-0 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-5 w-5" />
            Asistente IA
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExpandChat}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              title="Expandir chat"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              title="Minimizar chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          {messages.length === 1 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 whitespace-nowrap flex-shrink-0"
                onClick={() => setMessage('¿Qué rutina me recomiendas?')}
              >
                🏋️ Rutina
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 whitespace-nowrap flex-shrink-0"
                onClick={() => setMessage('Ayuda con mi dieta')}
              >
                🥗 Dieta
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 whitespace-nowrap flex-shrink-0"
                onClick={() => setMessage('Organiza mi calendario')}
              >
                📅 Calendario
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Escribe tu pregunta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[60px] max-h-[100px] bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
