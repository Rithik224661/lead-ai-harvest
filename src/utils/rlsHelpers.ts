
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types"; 

/**
 * Adds the user_id to data being inserted to ensure proper RLS policy enforcement
 * @param data The data to be inserted
 * @returns The data with the user_id added
 */
export const addUserIdToData = async <T extends Record<string, any>>(data: T): Promise<T & { user_id: string }> => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    throw new Error('User must be logged in');
  }
  
  return {
    ...data,
    user_id: sessionData.session.user.id
  };
};

/**
 * Creates an RLS-friendly query by adding user_id filter
 * Breaking type recursion by using concrete return types
 */
export const createUserQuery = async (table: 'leads' | 'audit_logs' | 'settings') => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    throw new Error('User must be logged in');
  }
  
  const userId = sessionData.session.user.id;
  
  // Create queries with explicit return types to break recursion
  if (table === 'leads') {
    return supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId);
  } 
  else if (table === 'audit_logs') {
    return supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId);
  } 
  else if (table === 'settings') {
    return supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId);
  } 
  else {
    throw new Error(`Invalid table: ${table}`);
  }
};
