import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contacts from '../../pages/Contacts';
import { api } from '../../lib/api';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithRouter = (ui, { route = '/contacts/unassigned' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Contacts Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders unassigned contacts from API', async () => {
    api.get.mockResolvedValue({
      data: {
        contacts: [
          {
            id: 1,
            fullName: 'Christina Williams',
            phone: '032702830298',
            companyName: 'Business Name',
            createdAt: '2026-01-12T00:00:00.000Z',
          },
        ],
      },
    });

    renderWithRouter(<Contacts />, { route: '/contacts/unassigned' });

    expect(screen.getByRole('heading', { level: 1, name: /contact management/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Christina Williams')).toBeInTheDocument();
      expect(screen.getByText('032702830298')).toBeInTheDocument();
    });
  });

  it('renders assigned contacts from API on assigned tab', async () => {
    api.get.mockResolvedValue({
      data: {
        contacts: [
          {
            id: 7,
            fullName: 'Michael Smith',
            phone: '783649205872',
            companyName: 'Tech Innovations',
            status: 'active',
            assignedAgentId: 22,
            assignedAgent: {
              id: 22,
              username: 'Emily Johnson',
              email: 'emily@example.com',
            },
            createdAt: '2026-03-18T00:00:00.000Z',
          },
        ],
      },
    });

    renderWithRouter(<Contacts />, { route: '/contacts/assigned' });

    await waitFor(() => {
      expect(screen.getByText('Michael Smith')).toBeInTheDocument();
      expect(screen.getByText('Emily Johnson')).toBeInTheDocument();
    });
  });

  it('shows API error banner when fetch fails', async () => {
    api.get.mockRejectedValue({
      response: { status: 500, data: { message: 'Server unavailable' } },
    });

    renderWithRouter(<Contacts />, { route: '/contacts/unassigned' });

    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeInTheDocument();
    });
  });
});
