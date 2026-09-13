import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Data Service for 'manuals' table in Supabase
 */
export const manualsService = {
  /**
   * Fetch all user manuals
   */
  async getManuals() {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return data.map(m => ({
        ...m,
        updatedBy: m.updated_by || m.updatedBy,
        fileUrl: m.file_url || m.fileUrl
      }));
    } catch (error) {
      console.error('[manualsService] getManuals error:', error.message);
      return null;
    }
  },

  /**
   * Create a new user manual entry
   */
  async createManual(manualData) {
    if (!isSupabaseConfigured) return manualData;

    try {
      const payload = {
        title: manualData.title,
        updated_by: manualData.updatedBy || manualData.updated_by || 'Admin',
        date: manualData.date || new Date().toISOString().split('T')[0],
        published: manualData.published ?? true,
        file_url: manualData.fileUrl || manualData.file_url
      };

      const { data, error } = await supabase
        .from('manuals')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { ...manualData, ...data };
    } catch (error) {
      console.error('[manualsService] createManual error:', error.message);
      return manualData;
    }
  },

  /**
   * Update existing manual entry
   */
  async updateManual(id, updateData) {
    if (!isSupabaseConfigured) return updateData;

    try {
      const payload = {};
      if (updateData.title !== undefined) payload.title = updateData.title;
      if (updateData.published !== undefined) payload.published = updateData.published;
      if (updateData.fileUrl !== undefined) payload.file_url = updateData.fileUrl;

      const { data, error } = await supabase
        .from('manuals')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...updateData, ...data };
    } catch (error) {
      console.error('[manualsService] updateManual error:', error.message);
      return updateData;
    }
  },

  /**
   * Delete manual entry
   */
  async deleteManual(id) {
    if (!isSupabaseConfigured) return { id };

    try {
      const { error } = await supabase
        .from('manuals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id };
    } catch (error) {
      console.error('[manualsService] deleteManual error:', error.message);
      return { id };
    }
  }
};
