import type { ProgressEvent } from '../types';

const MAX_EVENTS_PER_JOB = 50;

interface StoredJobData {
  events: ProgressEvent[];
  lastUpdated: string;
}

export class LocalJobStore {
  private getKey(jobId: string): string {
    return `botcheck_job_${jobId}`;
  }

  saveEvent(jobId: string, event: ProgressEvent): void {
    try {
      const key = this.getKey(jobId);
      const existing = this.getStoredData(jobId);
      
      // Add timestamp if not present
      const eventWithTime: ProgressEvent = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      };

      // Add to events array, keeping only the last N events
      const updatedEvents = [...existing.events, eventWithTime].slice(-MAX_EVENTS_PER_JOB);
      
      const data: StoredJobData = {
        events: updatedEvents,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save event to localStorage:', error);
    }
  }

  getEvents(jobId: string): ProgressEvent[] {
    return this.getStoredData(jobId).events;
  }

  private getStoredData(jobId: string): StoredJobData {
    try {
      const key = this.getKey(jobId);
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const data: StoredJobData = JSON.parse(stored);
        return data;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    return {
      events: [],
      lastUpdated: new Date().toISOString()
    };
  }

  clearJob(jobId: string): void {
    try {
      const key = this.getKey(jobId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear job from localStorage:', error);
    }
  }

  getAllJobIds(): string[] {
    try {
      const jobIds: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('botcheck_job_')) {
          const jobId = key.replace('botcheck_job_', '');
          jobIds.push(jobId);
        }
      }
      return jobIds;
    } catch (error) {
      console.warn('Failed to get job IDs:', error);
      return [];
    }
  }
}

export const localJobStore = new LocalJobStore();
