
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
 * Gets the current user ID from the session
 * @returns The current user ID
 */
export const getCurrentUserId = async (): Promise<string> => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) {
    throw new Error('User must be logged in');
  }
  return sessionData.session.user.id;
};

/**
 * Fetches leads with RLS applied
 */
export const fetchUserLeads = async () => {
  const userId = await getCurrentUserId();
  return supabase.from('leads').select('*').eq('user_id', userId);
};

/**
 * Fetches audit logs with RLS applied
 */
export const fetchUserAuditLogs = async () => {
  const userId = await getCurrentUserId();
  return supabase.from('audit_logs').select('*').eq('user_id', userId);
};

/**
 * Fetches settings with RLS applied
 */
export const fetchUserSettings = async () => {
  const userId = await getCurrentUserId();
  return supabase.from('settings').select('*').eq('user_id', userId);
};

/**
 * Map table names to their fetch functions
 */
type TableFetchFunctions = {
  leads: typeof fetchUserLeads;
  audit_logs: typeof fetchUserAuditLogs;
  settings: typeof fetchUserSettings;
};

/**
 * Creates an RLS-friendly query for the specified table
 */
export const createUserQuery = async (table: keyof TableFetchFunctions) => {
  // Map table names to their corresponding fetch functions
  const fetchFunctions: TableFetchFunctions = {
    leads: fetchUserLeads,
    audit_logs: fetchUserAuditLogs,
    settings: fetchUserSettings
  };
  
  // Call the appropriate fetch function
  return await fetchFunctions[table]();
};
