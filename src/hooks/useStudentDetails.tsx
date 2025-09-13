import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useStudentDetails() {
  const { user } = useAuth();
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStudentDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStudentDetails = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching student details:', error);
      }

      if (data) {
        setStudentDetails(data);
        setShowDetailsModal(false);
      } else {
        setStudentDetails(null);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStudentDetails = () => {
    fetchStudentDetails();
  };

  return {
    studentDetails,
    loading,
    showDetailsModal,
    setShowDetailsModal,
    refreshStudentDetails
  };
}
