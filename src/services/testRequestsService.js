import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Service Wrapper for Test Requests, Reports, Series Trackers, and Remnant Requests
 */
export const testRequestsService = {
  // --- TEST REQUESTS ---
  async getTestRequests(fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      const { data, error } = await supabase
        .from('test_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[TestRequestsService] Error fetching test requests:', err.message);
      return fallbackData;
    }
  },

  async createTestRequest(requestData) {
    if (!isSupabaseConfigured) return requestData;
    try {
      const { data, error } = await supabase
        .from('test_requests')
        .insert([requestData])
        .select();
      if (error) throw error;
      return data?.[0] || requestData;
    } catch (err) {
      console.warn('[TestRequestsService] Error creating test request:', err.message);
      return requestData;
    }
  },

  // --- TEST REPORTS ---
  async getTestReports(fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      const { data, error } = await supabase
        .from('test_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[TestRequestsService] Error fetching test reports:', err.message);
      return fallbackData;
    }
  },

  async createTestReport(reportData) {
    if (!isSupabaseConfigured) return reportData;
    try {
      const { data, error } = await supabase
        .from('test_reports')
        .insert([reportData])
        .select();
      if (error) throw error;
      return data?.[0] || reportData;
    } catch (err) {
      console.warn('[TestRequestsService] Error creating test report:', err.message);
      return reportData;
    }
  },

  // --- SERIES TRACKERS ---
  async getSeriesTrackers(fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      const { data, error } = await supabase
        .from('series_trackers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[TestRequestsService] Error fetching series trackers:', err.message);
      return fallbackData;
    }
  },

  // --- SAMPLE REQUESTS (RETURN / DISCARD) ---
  async getSampleRequests(fallbackData = []) {
    if (!isSupabaseConfigured) return fallbackData;
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || fallbackData;
    } catch (err) {
      console.warn('[TestRequestsService] Error fetching sample requests:', err.message);
      return fallbackData;
    }
  },

  async createSampleRequest(reqData) {
    if (!isSupabaseConfigured) return reqData;
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .insert([reqData])
        .select();
      if (error) throw error;
      return data?.[0] || reqData;
    } catch (err) {
      console.warn('[TestRequestsService] Error creating sample request:', err.message);
      return reqData;
    }
  }
};
