import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  age_group: string;
  created_at: string;
  updated_at: string;
}

export function useUserRole() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setError('Failed to load user profile');
        return;
      }

      setProfile(data);
      
      // Store role in localStorage for quick access
      if (data?.role) {
        localStorage.setItem('userRole', data.role);
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = profile?.role === 'student';
  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';

  const hasRole = (role: 'student' | 'teacher' | 'admin') => {
    return profile?.role === role;
  };

  const hasAnyRole = (roles: ('student' | 'teacher' | 'admin')[]) => {
    return profile?.role && roles.includes(profile.role);
  };

  return {
    profile,
    loading,
    error,
    isStudent,
    isTeacher,
    isAdmin,
    hasRole,
    hasAnyRole,
    refetch: fetchUserProfile
  };
}
