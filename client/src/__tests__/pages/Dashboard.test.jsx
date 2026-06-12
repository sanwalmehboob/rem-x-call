import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../lib/api';

// Recharts needs ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      role: 'admin',
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@example.com',
    },
    token: 'some-token',
  }),
}));

const renderDashboard = () => render(<BrowserRouter><Dashboard /></BrowserRouter>);

describe('Dashboard Main Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/companies') return Promise.resolve({ data: { companies: [] } });
      if (url === '/subscription-plans') return Promise.resolve({ data: { plans: [] } });
      if (url === '/contacts') return Promise.resolve({ data: { contacts: [] } });
      if (url === '/dashboard/stats') return Promise.resolve({ data: { agents: { total: 0, active: 0 }, subscriptions: { total: 0, active: 0 }, contacts: { total: 0, active: 0 }, totalCalls: 0, followUps: 0 } });
      if (url === '/dashboard/recent-calls') return Promise.resolve({ data: { recentCalls: [] } });
      if (url === '/dashboard/agent-performance') return Promise.resolve({ data: { agentPerformance: [], meta: { currentPage: 1, totalPages: 1 } } });
      return Promise.resolve({ data: {} });
    });
  });

  it('keeps original dashboard design and shows empty values', async () => {
    renderDashboard();

    expect(screen.getByRole('heading', { level: 1, name: /dashboard/i })).toBeInTheDocument();
    expect(await screen.findByText('Agents Overview')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions Overview')).toBeInTheDocument();
    expect(screen.getByText('Contacts Overview')).toBeInTheDocument();
    expect(screen.getByText('No Live call activities yet to found')).toBeInTheDocument();
    expect(screen.getByText('No agent performance overview yet')).toBeInTheDocument();
  });
});
