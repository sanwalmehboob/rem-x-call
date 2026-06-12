import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reports from '../../pages/Reports';
import { describe, it, expect } from 'vitest';

// Fix ResizeObserver issue for Recharts running in Vitest
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Reports Component', () => {
  it('renders all report statistics elements correctly', () => {
    render(<Reports />, { wrapper: BrowserRouter });
    
    expect(screen.getByRole('heading', { level: 1, name: /reports & analytics/i })).toBeInTheDocument();
    
    // Check main stats
    expect(screen.getByText('Call Statistics')).toBeInTheDocument();
    
    // Total Calls container text (since 42,310 appears multiple times, use specific checks)
    expect(screen.getByText('1,000')).toBeInTheDocument();
    
    // Check Generated revenue
    expect(screen.getByText('Generated Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5000')).toBeInTheDocument();
    expect(screen.getByText('$2000')).toBeInTheDocument();
  });
});
