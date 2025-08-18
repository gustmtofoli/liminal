import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const audioApi = {
  // Get all available sound environments
  async getEnvironments() {
    try {
      const response = await apiClient.get('/audio/environments');
      return response.data;
    } catch (error) {
      console.error('Error fetching environments:', error);
      throw error;
    }
  },

  // Generate audio for a specific environment
  async generateAudio(environmentId, duration = 30, volume = 0.7) {
    try {
      console.log(`📡 Making API request to generate audio:`, {
        environmentId,
        duration,
        volume,
        url: `${API_BASE_URL}/audio/generate/${environmentId}`
      });
      
      const response = await apiClient.get(`/audio/generate/${environmentId}`, {
        params: { duration, volume },
        responseType: 'blob' // For audio data
      });
      
      console.log(`✅ API response received:`, {
        status: response.status,
        contentType: response.headers['content-type'],
        dataSize: response.data.size
      });
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error generating audio for ${environmentId}:`, error);
      throw error;
    }
  },

  // Stream audio for a specific environment
  async streamAudio(environmentId, options = {}) {
    try {
      const response = await apiClient.post(`/audio/stream/${environmentId}`, options, {
        responseType: 'stream'
      });
      return response.data;
    } catch (error) {
      console.error(`Error streaming audio for ${environmentId}:`, error);
      throw error;
    }
  },

  // Search for samples in Freesound
  async searchSamples(query) {
    try {
      const response = await apiClient.get('/audio/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching samples for "${query}":`, error);
      throw error;
    }
  },

  // Check if backend is healthy
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }
};

export default audioApi;