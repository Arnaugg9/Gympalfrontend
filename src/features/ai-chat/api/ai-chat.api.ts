import { http } from '@/lib/http';
import type { Message, Conversation, SendMessageRequest, AIChatResponse, AiContextSummary } from '../types';

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
   * Rename a conversation
   * @param conversationId - The ID of the conversation to rename
   * @param title - New title for the conversation
   */
  renameConversation: (conversationId: string, title: string) =>
    http.patch<{ data: Conversation }>(`${baseUrl}/conversations/${conversationId}`, { title }),

  /**
   * Send a message to an AI Agent
   * @param text - The user's message text
   * @param conversationId - Optional conversation ID to continue a thread
   * @param signal - Optional AbortSignal to cancel the request
   * @param agentType - Optional agent type ('reception' or 'routine'). 
   *   - 'reception': Direct communication with reception agent
   *   - 'routine': Chains data agent -> recommend-exercises to generate workout routines
   *   Defaults to 'reception'
   * @returns The agent's response
   */
  chatWithAgent: (text: string, conversationId?: string, signal?: AbortSignal, agentType?: 'reception' | 'routine') =>
    http.post<{ data: { response: string } }>(`${baseUrl}/agent`, { text, conversationId, agentType }, { 
      signal,
      timeout: 0 // No timeout for AI generation
    } as any),

  /**
   * Get latest chat history (legacy/global)
   * @returns List of recent messages
   */
  getHistory: () =>
    http.get<{ data: { messages: any[] } }>(`${baseUrl}/history`),

  /**
   * Get summarized user context (profile/personal info completeness)
   */
  getContextSummary: () =>
    http.get<{ data: AiContextSummary }>(`${baseUrl}/context`),
};
