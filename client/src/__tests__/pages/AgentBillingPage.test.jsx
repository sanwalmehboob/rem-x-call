import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AgentBillingPage from '../../pages/agent/AgentBillingPage';
import { api } from '../../lib/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/api', () => ({ api: { get: vi.fn() } }));

const mockSub = {
  planId: 1,
  planName: 'Pro',
  status: 'active',
  billingCycle: 'monthly',
  trialEndsAt: '2026-06-15T00:00:00.000Z',
  discountPercent: 10,
  features: { dialerEnabled: true, chatEnabled: true, recordingEnabled: false, whiteLabelEnabled: false },
};

const renderPage = () => render(<BrowserRouter><AgentBillingPage /></BrowserRouter>);

describe('AgentBillingPage Component', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders heading', () => {
    api.get.mockResolvedValue({ data: mockSub });
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /subscription & billings/i })).toBeInTheDocument();
  });

  it('fetches subscription from /subscriptions/current', async () => {
    api.get.mockResolvedValue({ data: mockSub });
    renderPage();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/subscriptions/current');
    });
  });

  it('displays plan name and active status', async () => {
    api.get.mockResolvedValue({ data: mockSub });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('displays billing cycle', async () => {
    api.get.mockResolvedValue({ data: mockSub });
    renderPage();
    await waitFor(() => expect(screen.getByText('monthly')).toBeInTheDocument());
  });

  it('displays discount percentage', async () => {
    api.get.mockResolvedValue({ data: mockSub });
    renderPage();
    await waitFor(() => expect(screen.getByText('10%')).toBeInTheDocument());
  });

  it('displays feature badges', async () => {
    api.get.mockResolvedValue({ data: mockSub });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Dialer/i)).toBeInTheDocument();
      expect(screen.getByText(/Chat/i)).toBeInTheDocument();
    });
  });

  it('shows no subscription state when 404', async () => {
    api.get.mockRejectedValue({ response: { status: 404, data: {} } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No Active Subscription')).toBeInTheDocument();
    });
  });

  it('shows error message on server failure', async () => {
    api.get.mockRejectedValue({ response: { status: 500, data: { message: 'DB error' } } });
    renderPage();
    await waitFor(() => expect(screen.getByText('DB error')).toBeInTheDocument());
  });

  it('shows empty billing history message', async () => {
    api.get.mockResolvedValue({ data: mockSub });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No billing history available yet.')).toBeInTheDocument();
    });
  });
});
