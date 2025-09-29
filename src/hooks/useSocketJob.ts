import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ProgressEventSchema } from '../types';
import type { ProgressEvent } from '../types';
import { localJobStore } from '../utils/localStore';
import { apiService } from '../services/api';

interface UseSocketJobOptions {
  jobId: string;
  onProgress?: (event: ProgressEvent) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseSocketJobReturn {
  events: ProgressEvent[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  retryConnection: () => void;
  clearEvents: () => void;
  replayEvents: () => void;
}

export function useSocketJob(options: UseSocketJobOptions): UseSocketJobReturn {
  const { jobId, onProgress, onError, onConnect, onDisconnect } = options;
  
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000); // Start with 1 second

  // Load events from localStorage on mount
  useEffect(() => {
    const storedEvents = localJobStore.getEvents(jobId);
    setEvents(storedEvents);
  }, [jobId]);

  const addEvent = useCallback((event: ProgressEvent) => {
    try {
      // Validate event with Zod
      const validatedEvent = ProgressEventSchema.parse(event);
      
      setEvents(prev => {
        // Prevent duplicate events (based on jobId + timestamp + stage)
        const isDuplicate = prev.some(e => 
          e.jobId === validatedEvent.jobId && 
          e.timestamp === validatedEvent.timestamp && 
          e.stage === validatedEvent.stage
        );
        
        if (isDuplicate) return prev;
        
        const newEvents = [...prev, validatedEvent];
        return newEvents.slice(-200); // Keep last 200 events in memory
      });

      // Save to localStorage
      localJobStore.saveEvent(jobId, validatedEvent);
      
      // Call callback
      onProgress?.(validatedEvent);
      
    } catch (validationError) {
      console.warn('Invalid progress event received:', validationError);
      onError?.('Received invalid progress data from server');
    }
  }, [jobId, onProgress, onError]);

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    
    // Socket.IO connection options
    const socketOptions: any = {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    };

    // Add API key if available
    const apiKey = apiService.getApiKey();
    if (apiKey) {
      socketOptions.auth = { token: apiKey };
      socketOptions.query = { token: apiKey };
    }

    const socket = io(socketUrl, socketOptions);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000;
      
      // Join job room
      socket.emit('joinJobRoom', { jobId });
      onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.();
      
      // Auto-reconnect unless disconnected intentionally
      if (reason !== 'io client disconnect') {
        scheduleReconnect();
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnecting(false);
      setError(`Connection failed: ${err.message}`);
      scheduleReconnect();
    });

    // Listen for progress events
    socket.on('progress', (data: any) => {
      try {
        addEvent(data);
      } catch (err) {
        console.error('Error processing progress event:', err);
      }
    });

    // Handle job-specific events if server supports them
    socket.on(`job:${jobId}:progress`, (data: any) => {
      try {
        addEvent(data);
      } catch (err) {
        console.error('Error processing job progress event:', err);
      }
    });

  }, [jobId, addEvent, onConnect, onDisconnect]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setError('Failed to connect after multiple attempts');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // Cap at 30 seconds
      connectSocket();
    }, reconnectDelay.current);
  }, [connectSocket]);

  const retryConnection = useCallback(() => {
    reconnectAttempts.current = 0;
    reconnectDelay.current = 1000;
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    connectSocket();
  }, [connectSocket]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    localJobStore.clearJob(jobId);
  }, [jobId]);

  const replayEvents = useCallback(() => {
    const storedEvents = localJobStore.getEvents(jobId);
    setEvents([]);
    
    // Replay events with small delays for visual effect
    storedEvents.forEach((event, index) => {
      setTimeout(() => {
        setEvents(prev => [...prev, event]);
      }, index * 100);
    });
  }, [jobId]);

  // Connect on mount and jobId change
  useEffect(() => {
    connectSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  return {
    events,
    isConnected,
    isConnecting,
    error,
    retryConnection,
    clearEvents,
    replayEvents,
  };
}