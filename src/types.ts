import { z } from 'zod';

// Job status stages
export const JobStage = z.enum([
  'started',
  'fetching', 
  'parsing',
  'saving',
  'analyzing',
  'completed',
  'error'
]);

export type JobStage = z.infer<typeof JobStage>;

// Progress event from socket
export const ProgressEventSchema = z.object({
  jobId: z.string(),
  stage: JobStage,
  message: z.string(),
  timestamp: z.string().optional(),
  data: z.any().optional(),
  percent: z.number().min(0).max(100).optional(),
  diagnostics: z.object({
    rounds: z.number().optional(),
    adsSeen: z.number().optional(),
    adsFiltered: z.number().optional(),
    networkIdleUsed: z.boolean().optional(),
  }).optional()
});

export type ProgressEvent = z.infer<typeof ProgressEventSchema>;

// Signal from bot analysis
export const SignalSchema = z.object({
  signal: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  weight: z.number(),
  explain: z.string()
});

export type Signal = z.infer<typeof SignalSchema>;

// Action recommendation
export const ActionSchema = z.object({
  action: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  rationale: z.string(),
  estimated_effort: z.string()
});

export type Action = z.infer<typeof ActionSchema>;

// Final scoring result
export const ScoringResultSchema = z.object({
  human_score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  summary_bullets: z.array(z.string()),
  top_signals: z.array(SignalSchema),
  action_table: z.array(ActionSchema),
  username: z.string().optional(),
  analysis_date: z.string().optional()
});

export type ScoringResult = z.infer<typeof ScoringResultSchema>;

// Job metadata
export const JobMetadataSchema = z.object({
  jobId: z.string(),
  username: z.string().optional(),
  status: JobStage,
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
  error: z.string().optional()
});

export type JobMetadata = z.infer<typeof JobMetadataSchema>;

// API responses
export const StartJobResponseSchema = z.object({
  jobId: z.string()
});

export type StartJobResponse = z.infer<typeof StartJobResponseSchema>;

// Stage to percentage mapping for progress estimation
export const STAGE_PROGRESS: Record<JobStage, number> = {
  started: 5,
  fetching: 25,
  parsing: 45,
  saving: 65,
  analyzing: 85,
  completed: 100,
  error: 0
};

// Get stage color for UI
export const getStageColor = (stage: JobStage): string => {
  const colors = {
    started: 'status-started',
    fetching: 'status-fetching', 
    parsing: 'status-fetching',
    saving: 'status-analyzing',
    analyzing: 'status-analyzing',
    completed: 'status-completed',
    error: 'status-error'
  };
  return colors[stage];
};

// Get human-readable stage name
export const getStageName = (stage: JobStage): string => {
  const names = {
    started: 'Started',
    fetching: 'Fetching Data',
    parsing: 'Parsing Content', 
    saving: 'Saving Results',
    analyzing: 'Analyzing Patterns',
    completed: 'Completed',
    error: 'Error'
  };
  return names[stage];
};