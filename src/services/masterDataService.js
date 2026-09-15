import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Service Wrapper for Master Data, Laboratories, Sections, and Personnel
 */
export const masterDataService = {
  /**
   * Fetch all master data categories or specific category
   */
  async getMasterData(category = null, fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      let query = supabase.from('master_data').select('*');
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[MasterDataService] Error fetching master data, using fallback:', err.message);
      return fallbackData;
    }
  },

  /**
   * Add a new item to master data
   */
  async addMasterDataItem(item) {
    if (!isSupabaseConfigured) return item;
    try {
      const { data, error } = await supabase
        .from('master_data')
        .insert([item])
        .select();
      if (error) throw error;
      return data?.[0] || item;
    } catch (err) {
      console.warn('[MasterDataService] Error adding master data item:', err.message);
      return item;
    }
  },

  /**
   * Fetch all Laboratories
   */
  async getLaboratories(fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      const { data, error } = await supabase.from('laboratories').select('*').order('name');
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[MasterDataService] Error fetching laboratories:', err.message);
      return fallbackData;
    }
  },

  /**
   * Fetch all Sections (with lab relation)
   */
  async getSections(fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      const { data, error } = await supabase.from('sections').select('*').order('name');
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[MasterDataService] Error fetching sections:', err.message);
      return fallbackData;
    }
  },

  /**
   * Fetch Personnel by Role or Section
   */
  async getPersonnel(role = null, sectionId = null, fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      let query = supabase.from('personnel').select('*');
      if (role) query = query.eq('role', role);
      if (sectionId) query = query.eq('section_id', sectionId);
      const { data, error } = await query;
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[MasterDataService] Error fetching personnel:', err.message);
      return fallbackData;
    }
  }
};
