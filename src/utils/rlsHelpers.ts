
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
 * Uses explicit type definitions to solve recursion issues
 */
export const createUserQuery = async (table: 'leads' | 'audit_logs' | 'settings') => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    throw new Error('User must be logged in');
  }
  
  const userId = sessionData.session.user.id;
  
  // Use "any" return type to break the type recursion chain
  // Each case handles a specific table explicitly
  switch (table) {
    case 'leads':
      return supabase.from('leads').select('*').eq('user_id', userId) as any;
    case 'audit_logs':
      return supabase.from('audit_logs').select('*').eq('user_id', userId) as any;
    case 'settings':
      return supabase.from('settings').select('*').eq('user_id', userId) as any;
    default:
      throw new Error(`Invalid table: ${table}`);
  }
};
