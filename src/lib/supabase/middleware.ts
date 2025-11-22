import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a Supabase client for use in middleware
 * This is used to refresh auth tokens and maintain session consistency
 */
export function createMiddlewareSupabaseClient(req: NextRequest, res: NextResponse) {
  // Dummy implementation to remove Supabase dependency
  return {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      getSession: async () => ({ data: { session: null } }),
    }
  };
}
