import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AgentDashboardHome from '../../pages/agent/AgentDashboardHome';
import { api } from '../../lib/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

vi.mock('../../lib/api', () => ({ api: { get: vi.fn() } }));

const mockStats = { totalCalls: 250, totalCallsChange: 15.2, followUps: 40, followUpsChange: -5 };
const mockCalls = [
  { id: 1, startedAt: '2026-05-10T10:00:00Z', durationSeconds: 120, status: 'completed', contact: { fullName: 'Alice', phone: '+1555111' } },
  { id: 2, startedAt: '2026-05-11T08:00:00Z', durationSeconds: 0, status: 'missed', contact: { fullName: 'Bob', phone: '+1555222' } },
];

const renderPage = () => render(<BrowserRouter><AgentDashboardHome /></BrowserRouter>);

describe('AgentDashboardHome Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/dashboard/stats') return Promise.resolve({ data: mockStats });
      if (url === '/dashboard/recent-calls') return Promise.resolve({ data: { recentCalls: mockCalls } });
      return Promise.resolve({ data: {} });
    });
  });

  it('renders dashboard heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /dashboard/i })).toBeInTheDocument();
  });

  it('fetches stats from /dashboard/stats', async () => {
    renderPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/dashboard/stats', expect.any(Object));
    });
  });

  it('displays total calls from API', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('250')).toBeInTheDocument());
  });

  it('displays follow-ups count from API', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('40')).toBeInTheDocument());
  });

  it('renders recent calls table with contact names', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('shows empty state when no recent calls', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/dashboard/stats') return Promise.resolve({ data: mockStats });
      if (url === '/dashboard/recent-calls') return Promise.resolve({ data: { recentCalls: [] } });
      return Promise.resolve({ data: {} });
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('No call activity yet.')).toBeInTheDocument());
  });

  it('handles API failure gracefully', async () => {
    api.get.mockRejectedValue(new Error('Network Error'));
    renderPage();
    await waitFor(() => expect(screen.getByText('No call activity yet.')).toBeInTheDocument());
  });
});
