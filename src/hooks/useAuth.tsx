import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, ageGroup: string, role: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, ageGroup: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/?confirmed=true`,
          data: {
            first_name: firstName,
            last_name: lastName,
            age_group: ageGroup,
            role: role
          }
        }
      });

      if (error) return { error };

      // Create profile after successful signup with retry logic
      if (data.user) {
        let profileCreated = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!profileCreated && retryCount < maxRetries) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                age_group: ageGroup,
                role: role
              });

            if (profileError) {
              console.error(`Profile creation attempt ${retryCount + 1} failed:`, profileError);
              
              if (profileError.code === '23503') { // Foreign key violation
                // Wait a bit and retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                retryCount++;
                continue;
              } else {
                // Other error, don't retry
                break;
              }
            } else {
              profileCreated = true;
              console.log('Profile created successfully');
            }
          } catch (err) {
            console.error(`Profile creation attempt ${retryCount + 1} error:`, err);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!profileCreated) {
          console.error('Failed to create profile after all retries');
          toast({
            title: "Profile Creation Error",
            description: "Account created but profile setup failed. Please contact support.",
            variant: "destructive"
          });
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    // Check if email is confirmed
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return { 
        error: { 
          message: "Please check your email and click the confirmation link before signing in." 
        } as AuthError 
      };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}