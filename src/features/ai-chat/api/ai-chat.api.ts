import { http } from '@/lib/http';
import type { Message, Conversation, SendMessageRequest, AIChatResponse } from '../types';

// Update baseUrl to point to the correct backend route prefix
const baseUrl = '/api/v1/ai/chat';

/**
 * AI Chat API Client
 * Handles all interactions with the AI Chat endpoints
 */
export const aiChatApi = {
  /**
   * Start a new conversation thread
   * @param title - Optional title for the conversation
   * @returns The created conversation object
   */
  startConversation: (title?: string) =>
    http.post<{ data: Conversation }>(`${baseUrl}/conversations`, { title }),

  /**
   * Get messages for a specific conversation
   * @param conversationId - The ID of the conversation to fetch
   * @returns List of messages in the conversation
   */
  getConversationMessages: (conversationId: string) =>
    http.get<{ data: { messages: any[] } }>(`${baseUrl}/history?conversationId=${conversationId}`),

  /**
   * Get all user conversations
   * @returns List of all conversations for the current user
   */
  getConversations: () =>
    http.get<{ data: { conversations: any[] } }>(`${baseUrl}/conversations`),

  /**
   * Delete a conversation
   * @param conversationId - The ID of the conversation to delete
   * @returns Success status
   */
  deleteConversation: (conversationId: string) =>
    http.delete<{ data: { success: boolean } }>(`${baseUrl}/conversations/${conversationId}`),

  /**
   * Send a message to an AI Agent
   * @param text - The user's message text
   * @param conversationId - Optional conversation ID to continue a thread
   * @returns The agent's response
   */
  chatWithAgent: (text: string, conversationId?: string) =>
    http.post<{ data: { response: string } }>(`${baseUrl}/agent`, { text, conversationId }),

  /**
   * Get latest chat history (legacy/global)
   * @returns List of recent messages
   */
  getHistory: () =>
    http.get<{ data: { messages: any[] } }>(`${baseUrl}/history`),
};
