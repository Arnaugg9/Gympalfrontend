import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { MessageSquare, Send, Dumbbell, Utensils, Calendar, Sparkles, Minimize2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';

export default function ChatIA() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente inteligente de GymPal. Puedo ayudarte a crear rutinas personalizadas, planificar dietas y organizar tu calendario. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // TODO: Send message to AI API - POST /api/chat
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');

    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Entiendo tu pregunta. Puedo ayudarte a crear rutinas personalizadas, planificar dietas y organizar tu calendario de entrenamientos. ¿Qué te gustaría hacer primero?',
        },
      ]);
    }, 1000);
  };

  const suggestedPrompts = [
    { icon: Dumbbell, text: '¿Qué rutina me recomiendas para ganar masa muscular?', color: 'orange' },
    { icon: Utensils, text: 'Ayúdame a crear una dieta para perder peso', color: 'green' },
    { icon: Calendar, text: 'Organiza mi calendario de entrenamientos', color: 'blue' },
    { icon: Sparkles, text: 'Dame consejos para mejorar mi técnica', color: 'purple' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              Asistente Inteligente
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Tu entrenador personal con IA disponible 24/7</p>
          </div>
          <Badge variant="outline" className="border-purple-500 text-purple-400">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            En línea
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/chat-ia/crear-rutina">
            <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Dumbbell className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">IA: Crear Rutina</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Generación de rutina por IA</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat-ia/crear-dieta">
            <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Utensils className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">IA: Crear Dieta</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Generación de dieta por IA</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat-ia/organizar-calendario">
            <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">IA: Organizar Calendario</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Planificación automática</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Chat Interface */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-[calc(100vh-280px)] flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={message.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}>
                      <AvatarFallback className="text-white bg-transparent">
                        {message.role === 'assistant' ? <Sparkles className="h-5 w-5" /> : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-4 max-w-[70%] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-slate-200'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggested Prompts - shown when no user messages */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Sugerencias rápidas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setInput(prompt.text)}
                        className="flex items-start gap-2 p-3 bg-slate-100 dark:bg-slate-700/30 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg text-left transition-colors group"
                      >
                        <Icon className={`h-4 w-4 text-${prompt.color}-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                        <span className="text-slate-700 dark:text-slate-300 text-sm">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
                  className="min-h-[60px] max-h-[150px] bg-slate-900/50 border-slate-700 text-white resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Tip: El asistente puede ayudarte a crear rutinas, dietas y organizar tu calendario
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
