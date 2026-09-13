import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Data Service for 'clarifications' table in Supabase
 */
export const clarificationsService = {
  /**
   * Fetch all clarifications
   */
  async getClarifications() {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('clarifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(c => ({
        ...c,
        sampleId: c.sample_id || c.sampleId,
        productName: c.product_name || c.productName,
        dateRaised: c.date_raised || c.dateRaised,
        sentTo: c.sent_to || c.sentTo
      }));
    } catch (error) {
      console.error('[clarificationsService] getClarifications error:', error.message);
      return null;
    }
  },

  /**
   * Create clarification query
   */
  async createClarification(clarData) {
    if (!isSupabaseConfigured) return clarData;

    try {
      const payload = {
        id: clarData.id,
        sample_id: clarData.sampleId || clarData.sample_id,
        product_name: clarData.productName || clarData.product_name,
        query: clarData.query,
        date_raised: clarData.dateRaised || clarData.date_raised || new Date().toISOString().split('T')[0],
        status: clarData.status || 'Open',
        sent_to: clarData.sentTo || clarData.sent_to || 'Sample Cell',
        response: clarData.response
      };

      const { data, error } = await supabase
        .from('clarifications')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { ...clarData, ...data };
    } catch (error) {
      console.error('[clarificationsService] createClarification error:', error.message);
      return clarData;
    }
  },

  /**
   * Update clarification query / resolve response
   */
  async updateClarification(id, updateData) {
    if (!isSupabaseConfigured) return updateData;

    try {
      const payload = {};
      if (updateData.status !== undefined) payload.status = updateData.status;
      if (updateData.response !== undefined) payload.response = updateData.response;

      const { data, error } = await supabase
        .from('clarifications')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...updateData, ...data };
    } catch (error) {
      console.error('[clarificationsService] updateClarification error:', error.message);
      return updateData;
    }
  },

  /**
   * Real-time subscription to clarifications table
   */
  subscribeToClarifications(onPayload) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('public:clarifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clarifications' },
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
