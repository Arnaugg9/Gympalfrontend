// Dummy Supabase client to satisfy imports without actual dependency
// The user wants to move DB management to the backend

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    getUser: async () => ({ data: { user: null } }),
    signOut: async () => { },
    setSession: async () => { },
  },
};

export async function getSession() {
  return null;
}

export async function getUser() {
  return null;
}

export async function signOut() {
  // No-op
}

export async function setAuthTokens(accessToken: string | null, refreshToken?: string | null) {
  // No-op
}

export async function clearAuthTokens() {
  // No-op
}
