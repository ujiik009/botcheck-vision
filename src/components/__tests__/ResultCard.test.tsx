import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResultCard } from '../ResultCard';
import type { ScoringResult } from '../../types';

const mockResult: ScoringResult = {
  human_score: 85,
  confidence: 92,
  summary_bullets: [
    'Account shows consistent human behavior patterns',
    'Natural engagement timing observed',
    'Diverse content types and topics'
  ],
  top_signals: [
    {
      signal: 'posting_pattern_variance',
      value: 0.82,
      weight: 0.9,
      explain: 'Highly variable posting times indicate human behavior'
    }
  ],
  action_table: [
    {
      action: 'Monitor for automation tools',
      priority: 'low' as const,
      rationale: 'Score indicates likely human account',
      estimated_effort: '1-2 hours'
    }
  ],
  username: 'test_user',
  analysis_date: '2024-01-01T00:00:00Z'
};

describe('ResultCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<ResultCard result={mockResult} />);
    expect(container).toBeDefined();
  });

  it('displays human score', () => {
    const { getByText } = render(<ResultCard result={mockResult} />);
    expect(getByText('85')).toBeDefined();
    expect(getByText('Human Score')).toBeDefined();
  });

  it('shows confidence level', () => {
    const { getByText } = render(<ResultCard result={mockResult} />);
    expect(getByText('Confidence: 92%')).toBeDefined();
  });

  it('renders summary bullets', () => {
    const { getByText } = render(<ResultCard result={mockResult} />);
    expect(getByText('Account shows consistent human behavior patterns')).toBeDefined();
  });
});