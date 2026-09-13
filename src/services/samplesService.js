import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Data Service for 'samples' table in Supabase
 */
export const samplesService = {
  /**
   * Fetch all samples from Supabase
   */
  async getSamples() {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform snake_case columns to camelCase if needed, or keep uniform
      return data.map(s => ({
        ...s,
        dateReceived: s.date_received || s.dateReceived,
        forwardedOn: s.forwarded_on || s.forwardedOn,
        requiredTests: s.required_tests || s.requiredTests,
        testingSection: s.testing_section || s.testingSection,
        testType: s.test_type || s.testType,
        assignedEngineer: s.assigned_engineer || s.assignedEngineer,
        testRequestId: s.test_request_id || s.testRequestId,
        allocationDate: s.allocation_date || s.allocationDate,
        dueDate: s.due_date || s.dueDate,
        testResults: s.test_results || s.testResults,
        testDate: s.test_date || s.testDate,
        resultStatus: s.result_status || s.resultStatus,
        verificationStatus: s.verification_status || s.verificationStatus,
        reportNumber: s.report_number || s.reportNumber,
        reportDate: s.report_date || s.reportDate,
        reportingManager: s.reporting_manager || s.reportingManager,
        sampleType: s.sample_type || s.sampleType
      }));
    } catch (error) {
      console.error('[samplesService] getSamples error:', error.message);
      return null;
    }
  },

  /**
   * Insert a new sample into Supabase
   */
  async createSample(sampleData) {
    if (!isSupabaseConfigured) return sampleData;

    try {
      const payload = {
        id: sampleData.id,
        product: sampleData.product,
        applicant: sampleData.applicant,
        sample_type: sampleData.sampleType || sampleData.sample_type,
        date_received: sampleData.dateReceived || sampleData.date_received || new Date().toISOString().split('T')[0],
        forwarded_on: sampleData.forwardedOn || sampleData.forwarded_on,
        quantity: sampleData.quantity || '1.00',
        standard: sampleData.standard,
        required_tests: sampleData.requiredTests || sampleData.required_tests,
        documents: sampleData.documents || [],
        remarks: sampleData.remarks,
        priority: sampleData.priority || 'Medium',
        testing_section: sampleData.testingSection || sampleData.testing_section || 'Mechanical',
        test_type: sampleData.testType || sampleData.test_type || 'All',
        assigned_engineer: sampleData.assignedEngineer || sampleData.assigned_engineer,
        test_request_id: sampleData.testRequestId || sampleData.test_request_id,
        allocation_date: sampleData.allocationDate || sampleData.allocation_date,
        due_date: sampleData.dueDate || sampleData.due_date,
        test_results: sampleData.testResults || sampleData.test_results,
        test_date: sampleData.testDate || sampleData.test_date,
        result_status: sampleData.resultStatus || sampleData.result_status || 'Pending',
        verification_status: sampleData.verificationStatus || sampleData.verification_status || 'Pending Verification',
        report_number: sampleData.reportNumber || sampleData.report_number,
        report_date: sampleData.reportDate || sampleData.report_date,
        reporting_manager: sampleData.reportingManager || sampleData.reporting_manager,
        status: sampleData.status || 'New Sample Received',
        type: sampleData.type || 'New'
      };

      const { data, error } = await supabase
        .from('samples')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { ...sampleData, ...data };
    } catch (error) {
      console.error('[samplesService] createSample error:', error.message);
      return sampleData;
    }
  },

  /**
   * Update an existing sample in Supabase
   */
  async updateSample(id, updateData) {
    if (!isSupabaseConfigured) return updateData;

    try {
      const payload = {};
      if (updateData.status !== undefined) payload.status = updateData.status;
      if (updateData.product !== undefined) payload.product = updateData.product;
      if (updateData.applicant !== undefined) payload.applicant = updateData.applicant;
      if (updateData.sampleType !== undefined || updateData.sample_type !== undefined) {
        payload.sample_type = updateData.sampleType || updateData.sample_type;
      }
      if (updateData.standard !== undefined) payload.standard = updateData.standard;
      if (updateData.requiredTests !== undefined || updateData.required_tests !== undefined) {
        payload.required_tests = updateData.requiredTests || updateData.required_tests;
      }
      if (updateData.testingSection !== undefined || updateData.testing_section !== undefined) {
        payload.testing_section = updateData.testingSection || updateData.testing_section;
      }
      if (updateData.testType !== undefined || updateData.test_type !== undefined) {
        payload.test_type = updateData.testType || updateData.test_type;
      }
      if (updateData.assignedEngineer !== undefined || updateData.assigned_engineer !== undefined) {
        payload.assigned_engineer = updateData.assignedEngineer || updateData.assigned_engineer;
      }
      if (updateData.allocationDate !== undefined || updateData.allocation_date !== undefined) {
        payload.allocation_date = updateData.allocationDate || updateData.allocation_date;
      }
      if (updateData.dueDate !== undefined || updateData.due_date !== undefined) {
        payload.due_date = updateData.dueDate || updateData.due_date;
      }
      if (updateData.testResults !== undefined || updateData.test_results !== undefined) {
        payload.test_results = updateData.testResults || updateData.test_results;
      }
      if (updateData.testDate !== undefined || updateData.test_date !== undefined) {
        payload.test_date = updateData.testDate || updateData.test_date;
      }
      if (updateData.resultStatus !== undefined || updateData.result_status !== undefined) {
        payload.result_status = updateData.resultStatus || updateData.result_status;
      }
      if (updateData.verificationStatus !== undefined || updateData.verification_status !== undefined) {
        payload.verification_status = updateData.verificationStatus || updateData.verification_status;
      }
      if (updateData.reportNumber !== undefined || updateData.report_number !== undefined) {
        payload.report_number = updateData.reportNumber || updateData.report_number;
      }
      if (updateData.reportDate !== undefined || updateData.report_date !== undefined) {
        payload.report_date = updateData.reportDate || updateData.report_date;
      }
      if (updateData.reportingManager !== undefined || updateData.reporting_manager !== undefined) {
        payload.reporting_manager = updateData.reportingManager || updateData.reporting_manager;
      }
      if (updateData.documents !== undefined) payload.documents = updateData.documents;
      if (updateData.remarks !== undefined) payload.remarks = updateData.remarks;
      if (updateData.priority !== undefined) payload.priority = updateData.priority;

      const { data, error } = await supabase
        .from('samples')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...updateData, ...data };
    } catch (error) {
      console.error('[samplesService] updateSample error:', error.message);
      return updateData;
    }
  },

  /**
   * Delete a sample from Supabase
   */
  async deleteSample(id) {
    if (!isSupabaseConfigured) return { id };

    try {
      const { error } = await supabase
        .from('samples')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id };
    } catch (error) {
      console.error('[samplesService] deleteSample error:', error.message);
      return { id };
    }
  },

  /**
   * Subscribe to real-time changes on the 'samples' table
   */
  subscribeToSamples(onPayload) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };

    const channel = supabase
      .channel('public:samples')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'samples' },
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
