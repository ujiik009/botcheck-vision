import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { StartJobResponseSchema, JobMetadataSchema, ScoringResultSchema } from '../types';
import type { StartJobResponse, JobMetadata, ScoringResult } from '../types';

class ApiService {
  private client: AxiosInstance;
  private apiKey: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to inject API key
    this.client.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.headers['x-api-key'] = this.apiKey;
      }
      return config;
    });

    // Load API key from localStorage
    this.loadApiKey();
  }

  setApiKey(key: string | null) {
    this.apiKey = key;
    if (key) {
      localStorage.setItem('botcheck_api_key', key);
    } else {
      localStorage.removeItem('botcheck_api_key');
    }
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  private loadApiKey() {
    const stored = localStorage.getItem('botcheck_api_key');
    if (stored) {
      this.apiKey = stored;
    }
  }

  async startBotCheck(username: string): Promise<StartJobResponse> {
    try {
      const response: AxiosResponse = await this.client.get(`/api/botcheck/${encodeURIComponent(username)}`);
      return StartJobResponseSchema.parse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Failed to start bot check: ${error.message}`);
      }
      throw error;
    }
  }

  async getJobMetadata(jobId: string): Promise<JobMetadata> {
    try {
      const response: AxiosResponse = await this.client.get(`/api/job/${jobId}`);
      return JobMetadataSchema.parse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Job not found');
        }
        throw new Error(error.response?.data?.message || `Failed to get job metadata: ${error.message}`);
      }
      throw error;
    }
  }

  async getJobResult(jobId: string): Promise<ScoringResult> {
    try {
      const response: AxiosResponse = await this.client.get(`/api/job/${jobId}/result`);
      return ScoringResultSchema.parse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Result not ready yet');
        }
        throw new Error(error.response?.data?.message || `Failed to get job result: ${error.message}`);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();