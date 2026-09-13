const API_BASE = 'http://localhost:5000/api';

/**
 * Fetch helper with timeout and fallback logic
 */
async function fetchWithFallback(endpoint, options = {}, fallbackData = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec timeout

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[API Client] Fallback mode active for ${endpoint}:`, error.message);
    return fallbackData;
  }
}

export const apiService = {
  // Check health
  async checkHealth() {
    return await fetchWithFallback('/health', {}, { status: 'offline' });
  },

  // Auth Login
  async login(role, email) {
    return await fetchWithFallback('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, email })
    }, { authenticated: true, role });
  },

  // Samples
  async getSamples(fallback) {
    const data = await fetchWithFallback('/samples', { method: 'GET' }, fallback);
    return data || fallback;
  },

  async createSample(sampleData) {
    return await fetchWithFallback('/samples', {
      method: 'POST',
      body: JSON.stringify(sampleData)
    }, sampleData);
  },

  async updateSample(id, updateData) {
    return await fetchWithFallback(`/samples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }, updateData);
  },

  async deleteSample(id) {
    return await fetchWithFallback(`/samples/${id}`, { method: 'DELETE' }, { id });
  },

  // Workflow Status Transition
  async transitionSample(sampleId, status, extraFields = {}) {
    return await fetchWithFallback('/samples/transition', {
      method: 'POST',
      body: JSON.stringify({ sampleId, status, extraFields })
    }, { success: true, sampleId, status });
  },

  // Generate Formal Test Request (Sample Cell)
  async generateTestRequest(requestData) {
    return await fetchWithFallback('/test-requests/generate', {
      method: 'POST',
      body: JSON.stringify(requestData)
    }, requestData);
  },

  // Clarifications
  async getClarifications(fallback) {
    const data = await fetchWithFallback('/clarifications', { method: 'GET' }, fallback);
    return data || fallback;
  },

  async createClarification(clarData) {
    return await fetchWithFallback('/clarifications', {
      method: 'POST',
      body: JSON.stringify(clarData)
    }, clarData);
  },

  async updateClarification(id, updateData) {
    return await fetchWithFallback(`/clarifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }, updateData);
  },

  // User Manuals
  async getManuals(fallback) {
    const data = await fetchWithFallback('/manuals', { method: 'GET' }, fallback);
    return data || fallback;
  },

  async createManual(manualData) {
    return await fetchWithFallback('/manuals', {
      method: 'POST',
      body: JSON.stringify(manualData)
    }, manualData);
  },

  async updateManual(id, updateData) {
    return await fetchWithFallback(`/manuals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }, updateData);
  },

  async deleteManual(id) {
    return await fetchWithFallback(`/manuals/${id}`, { method: 'DELETE' }, { id });
  },

  // Audit Logs
  async getLogs(fallback) {
    const data = await fetchWithFallback('/logs', { method: 'GET' }, fallback);
    return data || fallback;
  },

  async addLog(logText) {
    return await fetchWithFallback('/logs', {
      method: 'POST',
      body: JSON.stringify({ text: logText })
    }, { id: Date.now(), time: new Date().toLocaleString(), text: logText });
  }
};
