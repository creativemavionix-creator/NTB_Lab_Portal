import { supabase, isSupabaseConfigured } from './supabaseClient';

const BUCKET_NAME = 'ntb-documents';

/**
 * Supabase Storage Service for Document Uploads & Retrievals
 */
export const storageService = {
  /**
   * Upload file to Supabase Storage bucket
   * @param {File} file - The file object from file input
   * @param {string} pathFolder - Target folder path in bucket (e.g. 'samples' or 'manuals')
   */
  async uploadFile(file, pathFolder = 'samples') {
    if (!isSupabaseConfigured) {
      console.warn('[StorageService] Supabase not configured. Mocking file upload.');
      return { path: file.name, url: `#mock-url-${file.name}`, error: null };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${pathFolder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        path: data.path,
        url: publicUrlData.publicUrl,
        error: null
      };
    } catch (error) {
      console.error('[StorageService] uploadFile error:', error.message);
      return { path: null, url: null, error: error.message };
    }
  },

  /**
   * Get public download/view URL for a stored document path
   */
  getPublicUrl(filePath) {
    if (!isSupabaseConfigured || !filePath) return filePath;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data?.publicUrl || filePath;
  }
};
