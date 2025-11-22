import { http } from '@/lib/http';
import type { Message, Conversation, SendMessageRequest, AIChatResponse } from '../types';

// Update baseUrl to point to the correct backend route prefix
const baseUrl = '/api/v1/social/chat';

export const aiChatApi = {
  // Start new conversation
  startConversation: (title?: string) =>
    http.post<{ data: Conversation }>(`${baseUrl}/conversations`, { title }),

  // Get conversation messages (history)
  getConversationMessages: (conversationId: string) =>
    http.get<{ data: { messages: any[] } }>(`${baseUrl}/history?conversationId=${conversationId}`),

  // Get all conversations
  getConversations: () =>
    http.get<{ data: { conversations: any[] } }>(`${baseUrl}/conversations`),

  // Delete conversation
  deleteConversation: (conversationId: string) =>
    http.delete<{ data: { success: boolean } }>(`${baseUrl}/conversations/${conversationId}`),

  // Send message to Reception Agent
  chatWithAgent: (text: string, conversationId?: string) =>
    http.post<{ data: { response: string } }>(`${baseUrl}/agent`, { text, conversationId }),

  // Get latest chat history (legacy)
  getHistory: () =>
    http.get<{ data: { messages: any[] } }>(`${baseUrl}/history`),
};
