export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export type SendMessageRequest = {
  content: string;
  conversationId?: string;
  context?: {
    userFitnessLevel?: string;
    currentGoals?: string[];
    recentWorkouts?: any[];
  };
};

export type AIChatResponse = {
  message: Message;
  conversationId: string;
  suggestions?: string[];
};

export type AiContextSummary = {
  hasEssentialInfo: boolean;
  missingFields: string[];
  profile?: {
    full_name?: string | null;
    username?: string | null;
    preferences?: Record<string, any> | string | null;
    fitness_level?: string | null;
  } | null;
  personalInfo?: {
    age?: number | null;
    weight_kg?: number | null;
    height_cm?: number | null;
  } | null;
  dietaryPreferences?: {
    dietary_restrictions?: string[] | null;
    allergies?: string[] | null;
    preferred_cuisines?: string[] | null;
    meal_preferences?: string | null;
  } | null;
};