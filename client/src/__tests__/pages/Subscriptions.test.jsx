import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Subscriptions from '../../pages/Subscriptions';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPlan = {
  id: 1,
  name: 'Starter',
  priceMonthly: 29,
  billingCycle: 'monthly',
  maxAgents: 5,
  contactLimitLabel: null,
  dialerEnabled: true,
  chatEnabled: true,
  recordingEnabled: false,
  whiteLabelEnabled: false,
  isActive: true,
};

const renderWithRouter = (ui, { route = '/billing' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Subscriptions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({
      data: {
        plans: [mockPlan],
        pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
      },
    });
  });

  it('renders all subscriptions properly', async () => {
    renderWithRouter(<Subscriptions />);

    expect(screen.getByRole('heading', { level: 1, name: /subscriptions/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Starter')).toBeInTheDocument();
    });
    expect(screen.getByText('$29')).toBeInTheDocument();
  });

  it('opens Add Subscription Modal', async () => {
    renderWithRouter(<Subscriptions />);

    await waitFor(() => expect(screen.getByText('Starter')).toBeInTheDocument());

    const addBtn = screen.getByRole('button', { name: /add new subscription/i });
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { level: 2, name: /add new subscription/i })).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('opens and closes the Edit Subscription modal', async () => {
    renderWithRouter(<Subscriptions />);

    await waitFor(() => expect(screen.getByText('Starter')).toBeInTheDocument());

    const table = await screen.findByRole('table');
    const rowMenuButtons = table.querySelectorAll('tbody tr td:last-child button[type="button"]');
    expect(rowMenuButtons.length).toBeGreaterThan(0);
    fireEvent.click(rowMenuButtons[0]);

    const editBtn = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);

    expect(screen.getByRole('heading', { level: 2, name: /edit subscription/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update subscription/i })).toBeInTheDocument();
  });
});
