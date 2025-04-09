
import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type SupabaseEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export function useRealtime<T>(
  table: string,
  events: SupabaseEvent[] = ['INSERT', 'UPDATE', 'DELETE'],
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from(table).select('*');
        
        if (error) throw error;
        
        setData(data as T[]);
      } catch (err: any) {
        setError(err);
        console.error(`Error fetching data from ${table}:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Set up realtime subscription
    const channel = supabase
      .channel('public:' + table)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: table
      }, (payload) => {
        console.log('INSERT:', payload);
        setData(prev => [...prev, payload.new as T]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: table
      }, (payload) => {
        console.log('UPDATE:', payload);
        setData(prev => prev.map(item => 
          // @ts-ignore
          (item.id === payload.new.id) ? payload.new as T : item
        ));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: table
      }, (payload) => {
        console.log('DELETE:', payload);
        setData(prev => prev.filter(item => 
          // @ts-ignore
          item.id !== payload.old.id
        ));
      })
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { data, loading, error };
}
