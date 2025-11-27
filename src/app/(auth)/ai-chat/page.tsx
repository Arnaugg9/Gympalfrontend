'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Dumbbell, Utensils, Calendar, Sparkles, Loader2, User, Plus, MessageSquare, Trash2, Mic, MicOff, Square, Pencil, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { aiChatApi } from '@/features/ai-chat/api/ai-chat.api';
import { toast } from 'sonner';
import { profileApi } from '@/features/profile/api/profile.api';
import { AiMarkdown } from '@/components/shared/AiMarkdown';
import type { AiContextSummary } from '@/features/ai-chat/types';

const resolveLocale = (lang: string) => {
  if (lang?.startsWith('es')) return 'es-ES';
  if (lang?.startsWith('ca')) return 'ca-ES';
  if (lang?.startsWith('fr')) return 'fr-FR';
  return 'en-US';
};

/**
 * AIChatPage Component
 * 
 * Provides an interface for interacting with AI agents.
 * Features:
 * - Real-time chat interface
 * - Conversation management (create, delete, switch)
 * - Voice input (speech-to-text)
 * - Integration with specialized agents (Reception, Routine)
 *   - Reception: Direct communication with reception agent
 *   - Routine: Chains data agent -> recommend-exercises endpoint to generate workout routines
 * - Quick action suggestions
 */
export default function AIChatPage() {
  const { t, i18n } = useTranslation();
  const locale = resolveLocale(i18n.language);
  const defaultChatLabel = t('aiChat.defaultChatTitle', { defaultValue: 'Chat' });
  const maxChatRetries = 2;
  // State for chat messages
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  // State for list of conversations
  const [conversations, setConversations] = useState<any[]>([]);
  // Currently active conversation ID
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  // Current input text
  const [input, setInput] = useState('');
  // Loading state for sending messages
  const [isLoading, setIsLoading] = useState(false);
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // User's avatar URL
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [contextSummary, setContextSummary] = useState<AiContextSummary | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasUserDataContext, setHasUserDataContext] = useState(false);
  // Selected agent type (only reception and routine are available to users)
  const [selectedAgent, setSelectedAgent] = useState<'reception' | 'routine'>('reception');
  // Rename dialog state
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; conversationId: string | null; value: string }>({
    open: false,
    conversationId: null,
    value: '',
  });
  
  // Refs for speech recognition and auto-scrolling
  const recognitionRef = useRef<any>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Initialize Speech Recognition on component mount
   * Supports multiple browser implementations:
   * - Chrome/Edge: webkitSpeechRecognition
   * - Safari: webkitSpeechRecognition
   * - Firefox: Not natively supported (will show appropriate message)
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Try to get Speech Recognition API (Chrome, Edge, Safari)
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = locale; // Use current locale

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          // Append final transcript to input
          if (finalTranscript) {
              setInput(prev => {
                  const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                  return prev + space + finalTranscript;
              });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          
          if (event.error === 'not-allowed') {
              toast.error(t('aiChat.micPermissionDenied', { defaultValue: 'Microphone access denied. Please check your permissions.' }));
          } else if (event.error === 'no-speech') {
              // Ignore no-speech errors, often just means silence
          } else if (event.error === 'audio-capture') {
              toast.error(t('aiChat.noMicrophone', { defaultValue: 'No microphone found or audio capture failed.' }));
          } else {
              toast.error(t('aiChat.voiceError', { defaultValue: `Voice recognition error: ${event.error}` }));
          }
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      } catch (error) {
        console.error('Failed to initialize Speech Recognition:', error);
        recognitionRef.current = null;
      }
    }
  }, [locale, t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    const handleChange = (event: MediaQueryListEvent) => setIsSidebarOpen(event.matches);
    setIsSidebarOpen(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Toggle voice recording state
   * Handles permission requests and start/stop logic
   */
  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      // Check if it's Firefox or another unsupported browser
      const isFirefox = typeof navigator !== 'undefined' && 
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      
      if (isFirefox) {
        toast.error(t('aiChat.firefoxNotSupported', { 
          defaultValue: 'Speech recognition is not natively supported in Firefox. Please use Chrome, Edge, or Safari for voice input.' 
        }));
      } else {
        toast.error(t('aiChat.speechNotSupported', { 
          defaultValue: 'Speech recognition is not supported in this browser. Please use a modern browser like Chrome, Edge, or Safari.' 
        }));
      }
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
      }
    } else {
      try {
        // Check if getUserMedia is available (for better error handling)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia not supported');
        }

        // Explicitly request microphone access first to handle permissions/errors better
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately, we just wanted to check permission/existence
        stream.getTracks().forEach(track => track.stop());

        recognitionRef.current.start();
        setIsRecording(true);
        toast.success(t('aiChat.listening', { defaultValue: 'Listening...' }));
      } catch (error: any) {
        console.error('Failed to start recording:', error);
        setIsRecording(false);
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            toast.error(t('aiChat.micPermissionDenied', { defaultValue: 'Microphone permission denied. Please allow access.' }));
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            toast.error(t('aiChat.noMicrophone', { defaultValue: 'No microphone found on this device.' }));
        } else if (error.name === 'NotSupportedError') {
            toast.error(t('aiChat.micNotSupported', { defaultValue: 'Microphone access is not supported in this browser.' }));
        } else {
            toast.error(t('aiChat.micAccessError', { defaultValue: 'Could not access microphone.' }));
        }
      }
    }
  };

  /**
   * Load initial data (profile, conversations) on mount
   */
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        // Resolve promises independently to handle errors gracefully and better typing
        const profileResponse = await profileApi.getProfile();
        const conversationsResponse = await aiChatApi.getConversations().catch(() => ({ data: { conversations: [] } } as any));

        const profile = profileResponse.data;
        const profileAny = profile as Record<string, any> | undefined;
        // Handle potential data wrapper inconsistencies safely
        const conversationsData = (conversationsResponse as any).data || conversationsResponse;

        const avatarCandidate =
          profileAny?.avatarUrl ||
          profileAny?.avatar_url ||
          profileAny?.avatar ||
          profileAny?.imageUrl ||
          profileAny?.image_url;

        if (avatarCandidate) {
          setUserAvatar(avatarCandidate);
        }

        const fetchedConversations = conversationsData?.conversations || [];
        const normalizedConversations = fetchedConversations.map((conv: any) => normalizeConversation(conv));
        setConversations(normalizedConversations);

        if (normalizedConversations.length > 0) {
          // Load the latest conversation by default
          const latestConversation = normalizedConversations[0];
          setCurrentConversationId(latestConversation.id);
          loadMessages(latestConversation.id);
        } else {
           setMessages([
            {
              role: 'assistant',
              content: t('aiChat.greeting'),
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setMessages([
          {
            role: 'assistant',
            content: t('aiChat.greeting'),
          },
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [t, locale, defaultChatLabel]);

  const refreshContextSummary = useCallback(async () => {
    try {
      const { data } = await aiChatApi.getContextSummary();
      setContextSummary(data);
      setHasUserDataContext(Boolean(data?.hasEssentialInfo));
    } catch (error) {
      console.error('Failed to load user context summary', error);
    }
  }, []);

  useEffect(() => {
    refreshContextSummary();
  }, [refreshContextSummary]);

  useEffect(() => {
    if (!messages.length || hasUserDataContext) return;
    const latest = messages[messages.length - 1];
    const text = (latest?.content || '').toLowerCase();
    const hasProfileMarkers = ['name:', 'edad', 'age', 'weight', 'peso', 'altura', 'height', 'dieta', 'dietary preference'].some((marker) =>
      text.includes(marker)
    );
    const assistantAcknowledged =
      latest?.role === 'assistant' &&
      (text.includes('tenemos la mayoría de la información') ||
        text.includes('we have most of the information we need') ||
        text.includes('thanks for providing'));
    if (hasProfileMarkers || assistantAcknowledged) {
      setHasUserDataContext(true);
      refreshContextSummary();
    }
  }, [messages, hasUserDataContext, refreshContextSummary]);

  useEffect(() => {
    if (contextSummary?.hasEssentialInfo !== undefined) {
      setHasUserDataContext(Boolean(contextSummary?.hasEssentialInfo));
    }
  }, [contextSummary?.hasEssentialInfo]);

  /**
   * Load messages for a specific conversation
   * @param conversationId - The ID of the conversation to load
   */
  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await aiChatApi.getConversationMessages(conversationId);
      const history = response.data.messages || [];
      
      if (history.length > 0) {
        setMessages(history.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })));
      } else {
        setMessages([{ role: 'assistant', content: t('aiChat.greeting') }]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Scroll chat view to bottom when receiving messages
   */
  useEffect(() => {
    if (isInitialLoading) return;

    const viewport = messagesViewportRef.current;
    if (!viewport) return;

    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const behavior: ScrollBehavior = distanceFromBottom < 150 ? 'smooth' : 'auto';

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior,
    });
  }, [messages, isInitialLoading]);

  const formatChatTimestamp = (dateInput?: string | Date) => {
    const formatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    try {
      return formatter.format(dateInput ? new Date(dateInput) : new Date());
    } catch {
      return new Date().toLocaleString();
    }
  };

  const normalizeConversation = (conversation: any, fallbackTitle?: string) => {
    const baseTitle = (fallbackTitle ?? conversation?.title ?? '').trim();
    if (baseTitle) {
      return { ...conversation, title: baseTitle };
    }
    const createdAt = conversation?.created_at || conversation?.createdAt;
    return {
      ...conversation,
      title: `${defaultChatLabel} ${formatChatTimestamp(createdAt)}`,
    };
  };

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Create a new empty conversation
   */
  const handleCreateNewChat = async () => {
    try {
      const autoTitle = `${defaultChatLabel} ${formatChatTimestamp()}`;
      const { data: newConversation } = await aiChatApi.startConversation(autoTitle);
      const normalized = normalizeConversation(newConversation, autoTitle);
      setConversations((prev) => [normalized, ...prev]);
      setCurrentConversationId(normalized.id);
      setMessages([{ role: 'assistant', content: t('aiChat.greeting') }]);
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast.error(t('errors.generic', { defaultValue: 'Failed to start new conversation' }));
    }
  };

  /**
   * Delete a conversation
   * @param e - Click event
   * @param conversationId - ID of conversation to delete
   */
  const handleDeleteChat = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await aiChatApi.deleteConversation(conversationId);
      const updatedConversations = conversations.filter(c => c.id !== conversationId);
      setConversations(updatedConversations);
      
      if (currentConversationId === conversationId) {
        if (updatedConversations.length > 0) {
          setCurrentConversationId(updatedConversations[0].id);
          loadMessages(updatedConversations[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([{ role: 'assistant', content: t('aiChat.greeting') }]);
        }
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete conversation');
    }
  };

  /**
   * Rename a conversation
   */
  const openRenameDialog = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;
    const currentTitle = conversation.title || `${defaultChatLabel} ${formatChatTimestamp(conversation.created_at)}`;
    setRenameDialog({ open: true, conversationId, value: currentTitle });
  };

  const handleRenameChat = async () => {
    if (!renameDialog.conversationId) return;
    const trimmedTitle = renameDialog.value.trim();

    if (!trimmedTitle) {
      toast.error(t('aiChat.renameValidation', { defaultValue: 'Title cannot be empty' }));
      return;
    }

    try {
      const { data: updatedConversation } = await aiChatApi.renameConversation(renameDialog.conversationId, trimmedTitle);
      const normalized = normalizeConversation(updatedConversation, trimmedTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === renameDialog.conversationId ? { ...c, ...normalized } : c))
      );
      toast.success(t('aiChat.renameSuccess', { defaultValue: 'Conversation renamed' }));
      setRenameDialog({ open: false, conversationId: null, value: '' });
    } catch (error) {
      console.error('Failed to rename chat:', error);
      toast.error(t('errors.generic', { defaultValue: 'Failed to rename conversation' }));
    }
  };

  const handleCloseRenameDialog = () => {
    setRenameDialog({ open: false, conversationId: null, value: '' });
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  /**
   * Select a conversation from the sidebar
   * @param conversationId - ID of conversation to select
   */
  const handleSelectConversation = (conversationId: string) => {
    if (conversationId === currentConversationId) return;
    setCurrentConversationId(conversationId);
    loadMessages(conversationId);
  };

  /**
   * Stop the current generation
   */
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast.info('Generation stopped');
    }
  };

  const buildSmallTalkResponse = useCallback(() => {
    const profileName = contextSummary?.profile?.full_name || contextSummary?.profile?.username || '';
    const friendlyName = profileName ? profileName.split(' ')[0] : null;
    let preferencesData: Record<string, any> | null = null;
    const rawPrefs = contextSummary?.profile?.preferences;

    if (rawPrefs) {
      if (typeof rawPrefs === 'string') {
        try {
          preferencesData = JSON.parse(rawPrefs);
        } catch {
          preferencesData = null;
        }
      } else if (typeof rawPrefs === 'object') {
        preferencesData = rawPrefs as Record<string, any>;
      }
    }

    const primaryGoal = preferencesData?.primary_goal || preferencesData?.goal;

    let base = friendlyName ? `¡Hola de nuevo, ${friendlyName}!` : '¡Hola de nuevo!';
    base += ' Ya tengo tus datos guardados y no hace falta repetirlos.';

    if (primaryGoal) {
      base += ` Seguimos con el objetivo de ${primaryGoal}.`;
    } else {
      base += ' Seguimos con tus objetivos definidos.';
    }

    base += ' ¿Quieres que ajustemos la rutina, revisemos la nutrición o resolvamos alguna duda rápida?';
    return base;
  }, [contextSummary]);

  const sendMessageWithRetry = async (
    messageText: string,
    targetConversationId: string,
    controller: AbortController,
    agentType: 'reception' | 'routine',
    attempt = 1
  ): Promise<{ data: { response: string } }> => {
    try {
      return await aiChatApi.chatWithAgent(messageText, targetConversationId, controller.signal, agentType);
    } catch (error: any) {
      if (controller.signal.aborted || error?.name === 'AbortError') {
        throw error;
      }

      const status = error?.response?.status;
      const retryable = attempt < maxChatRetries && (!status || status >= 500 || status === 429 || status === 408);

      if (retryable) {
        await wait(2000 * attempt);
        return sendMessageWithRetry(messageText, targetConversationId, controller, agentType, attempt + 1);
      }

      throw error;
    }
  };

  /**
   * Send a message to the AI agent
   */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    const normalizedMessage = userMessage.toLowerCase();
    const greetingKeywords = ['hola', 'hello', 'hi', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'qué tal', 'que tal'];
    const isGreeting = greetingKeywords.some((keyword) => normalizedMessage === keyword || normalizedMessage.startsWith(`${keyword} `));

    if (hasUserDataContext && isGreeting) {
      const smallTalkResponse = buildSmallTalkResponse();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: smallTalkResponse,
        },
      ]);
      setIsLoading(false);
      return;
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // If no current conversation, create one first
      let targetConversationId = currentConversationId;
      if (!targetConversationId) {
         const snippetTitle = userMessage.substring(0, 30).trim();
         const fallbackTitle = snippetTitle || `${defaultChatLabel} ${formatChatTimestamp()}`;
         const { data: newConversation } = await aiChatApi.startConversation(fallbackTitle);
         const normalizedConversation = normalizeConversation(newConversation, fallbackTitle);
         setConversations((prev) => [normalizedConversation, ...prev]);
         setCurrentConversationId(normalizedConversation.id);
         targetConversationId = normalizedConversation.id;
      }

      const response = await sendMessageWithRetry(userMessage, targetConversationId!, controller, selectedAgent);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
        },
      ]);
    } catch (error: any) {
      setMessages(prev => (prev.length ? prev.slice(0, -1) : prev));
      setInput(userMessage);
      if (error.name === 'AbortError') {
        toast.info('Generation stopped by user.');
      } else {
        console.error('Chat error:', error);
        toast.error(error?.message || 'Failed to communicate with AI Agent');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const suggestedPrompts = [
    { icon: Dumbbell, text: t('aiChat.suggestedPrompts.routine'), color: 'orange' },
    { icon: Utensils, text: t('aiChat.suggestedPrompts.diet'), color: 'green' },
    { icon: Calendar, text: t('aiChat.suggestedPrompts.calendar'), color: 'blue' },
    { icon: Sparkles, text: t('common.comingSoon'), color: 'purple' },
  ];

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-96px)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2 flex items-center gap-3 text-3xl font-semibold">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg shadow-lg shadow-purple-500/40">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            {t('aiChat.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t('aiChat.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="agent-select" className="text-sm text-slate-600 dark:text-slate-400">
              {t('aiChat.selectAgent', { defaultValue: 'Select Agent' })}
            </Label>
            <Select value={selectedAgent} onValueChange={(value: 'reception' | 'routine') => setSelectedAgent(value)}>
              <SelectTrigger id="agent-select" className="w-[180px] bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <SelectItem value="reception">{t('aiChat.agent.reception', { defaultValue: 'Reception Agent' })}</SelectItem>
                <SelectItem value="routine">{t('aiChat.agent.routine', { defaultValue: 'Routine Agent' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="border-purple-500/50 text-purple-500 bg-purple-500/10">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            {t('common.success')}
          </Badge>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-1 min-h-0 gap-6 flex-col xl:flex-row">
        {isSidebarOpen && (
        <Card className="w-full xl:w-80 flex flex-col bg-white/80 dark:bg-slate-900/70 border border-white/10 dark:border-slate-700/60 backdrop-blur-xl shadow-xl">
          <div className="p-4 border-b border-white/20 dark:border-slate-800/60 shrink-0 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
            <Button 
              onClick={handleCreateNewChat}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
            >
              <Plus className="h-4 w-4 mr-2" />
                {t('aiChat.newChat')}
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="inline-flex h-10 w-10 rounded-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              title={isSidebarOpen ? t('aiChat.hideChats', { defaultValue: 'Hide chats' }) : t('aiChat.showChats', { defaultValue: 'Show chats' })}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
              <div className="p-2 space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                    currentConversationId === conv.id
                        ? 'bg-purple-500/10 border-purple-400 text-purple-800 dark:text-purple-200'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-8 w-8 rounded-full bg-purple-500/15 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                      </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium">{conv.title || t('aiChat.untitledChat')}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                          {new Intl.DateTimeFormat(locale, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(new Date(conv.created_at))}
                      </span>
                    </div>
                  </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-emerald-500"
                        onClick={(e) => openRenameDialog(e, conv.id)}
                        title={t('aiChat.renameChat', { defaultValue: 'Rename chat' })}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                    onClick={(e) => handleDeleteChat(e, conv.id)}
                        title={t('aiChat.deleteChat', { defaultValue: 'Delete chat' })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                    </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="text-center p-4 text-slate-500 text-sm">
                    {t('aiChat.noConversations')}
                </div>
              )}
            </div>
          </ScrollArea>
          </div>
        </Card>
        )}

        {!isSidebarOpen && (
          <div className="flex xl:w-16">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="h-10 w-10 rounded-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              title={t('aiChat.showChats', { defaultValue: 'Show chats' })}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col bg-white/90 dark:bg-slate-900/70 border border-white/10 dark:border-slate-700/60 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 min-h-0">
              <ScrollArea ref={messagesViewportRef} className="h-full px-6 py-6">
              {isInitialLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                     <div className="relative flex h-16 w-16">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-20"></span>
                       <span className="relative inline-flex rounded-full h-16 w-16 bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                         <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                       </span>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading conversation...</p>
                  </div>
                </div>
              ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isUserMessage = message.role === 'user';
                  return (
                  <div
                    key={index}
                      className={`flex gap-3 ${isUserMessage ? 'flex-row-reverse' : ''}`}
                  >
                      <Avatar className={isUserMessage ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}>
                        {isUserMessage && userAvatar ? (
                          <AvatarImage src={userAvatar} alt="User avatar" />
                      ) : null}
                      <AvatarFallback className="text-white bg-transparent">
                          {isUserMessage ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                        className={`rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[70%] text-sm leading-relaxed ${
                          isUserMessage
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-100/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/60'
                      }`}
                    >
                        <AiMarkdown content={message.content} className={isUserMessage ? 'text-white' : undefined} />
                    </div>
                  </div>
                  );
                })}
              </div>
              )}
            </ScrollArea>
            </div>

            {/* Input */}
            <div className="sticky bottom-0 w-full border-t border-white/30 dark:border-slate-700/60 bg-gradient-to-b from-white/90 to-white dark:from-slate-900/80 dark:to-slate-900/95 backdrop-blur px-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {suggestedPrompts.map((prompt, index) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setInput(prompt.text)}
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-white/40 dark:border-slate-700/60 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-sm text-slate-700 dark:text-slate-200 transition-colors"
                      >
                      <Icon className="h-4 w-4 text-purple-500" />
                      <span className="truncate">{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>
              <div className="flex gap-2 items-end">
                <Button
                  onClick={toggleRecording}
                  variant="outline"
                  className={`flex-shrink-0 h-10 w-10 p-0 rounded-full border-slate-300 dark:border-slate-600 ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 border-red-500 animate-pulse dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-background hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Textarea
                  placeholder={isRecording ? "Listening..." : t('aiChat.placeholder')}
                  className="min-h-[40px] max-h-[150px] bg-background border-border text-foreground resize-none shadow-inner rounded-2xl"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                {isLoading ? (
                  <Button
                    onClick={handleStop}
                    className="bg-red-500 hover:bg-red-600 text-white h-10 px-4 rounded-2xl"
                    title="Stop generating"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-10 px-4 rounded-2xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                {t('aiChat.subtitle')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Rename Conversation Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => (open ? setRenameDialog((prev) => ({ ...prev, open })) : handleCloseRenameDialog())}>
        <DialogContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>{t('aiChat.renameChat', { defaultValue: 'Rename chat' })}</DialogTitle>
            <DialogDescription>
              {t('aiChat.renamePrompt', { defaultValue: 'Enter a new name for this chat' })}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameDialog.value}
            onChange={(e) => setRenameDialog((prev) => ({ ...prev, value: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRenameChat();
              }
            }}
            autoFocus
            placeholder={t('aiChat.renamePrompt', { defaultValue: 'Enter a new name for this chat' })}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseRenameDialog}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRenameChat}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
