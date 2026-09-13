import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Data Service for 'audit_logs' table in Supabase
 */
export const logsService = {
  /**
   * Fetch audit logs
   */
  async getLogs() {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[logsService] getLogs error:', error.message);
      return null;
    }
  },

  /**
   * Add a new audit log
   */
  async addLog(logText, userId = null) {
    if (!isSupabaseConfigured) {
      return { id: Date.now(), time: new Date().toLocaleString(), text: logText };
    }

    try {
      const payload = {
        time: new Date().toLocaleString(),
        text: logText,
        user_id: userId
      };

      const { data, error } = await supabase
        .from('audit_logs')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[logsService] addLog error:', error.message);
      return { id: Date.now(), time: new Date().toLocaleString(), text: logText };
    }
  },

  /**
   * Real-time subscription to audit logs
   */
  subscribeToLogs(onPayload) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('public:audit_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          onPayload(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
};
