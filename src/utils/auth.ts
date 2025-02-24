import { supabase } from './supabase';

export async function signInAnonymously(): Promise<string | null> {
  console.log('Starting anonymous sign in...');
  try {
    // Wait a moment for any existing session
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if already signed in
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session);

    if (session?.user) {
      console.log('User already signed in:', session.user);
      return session.user.id;
    }

    console.log('No existing session, signing in anonymously...');
    const { data, error } = await supabase.auth.signInAnonymously();
    console.log('Sign in response:', { data, error });
    
    // Wait for session to be established
    await new Promise(resolve => setTimeout(resolve, 500));

    if (error) throw error;
    return data.user?.id || null;
  } catch (error) {
    console.error('Error signing in anonymously:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  console.log('Getting current user ID...');
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session);
  return session?.user?.id || null;
}