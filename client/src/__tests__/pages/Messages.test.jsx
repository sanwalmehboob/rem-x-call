import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Messages from '../../pages/Messages';
import { api } from '../../lib/api';

const socketMock = {
  connected: true,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: 1, role: 'admin', username: 'admin' },
  }),
}));

vi.mock('../../lib/socket', () => ({
  connectSocket: vi.fn(() => socketMock),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(() => socketMock),
}));

describe('Messages Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url, config) => {
      if (url === '/messages/conversations') {
        return Promise.resolve({
          data: {
            conversations: [
              {
                company: { id: 1, name: 'ACME Corp' },
                agent: { id: 5, username: 'agent1', email: 'a@example.com' },
                lastMessage: null,
              },
              {
                company: { id: 2, name: 'Beta Solutions' },
                agent: { id: 6, username: 'agent2', email: 'b@example.com' },
                lastMessage: null,
              },
            ],
          },
        });
      }

      if (url === '/messages/peer') {
        return Promise.resolve({
          data: { peer: { username: 'agent1', email: 'a@example.com' } },
        });
      }

      if (url === '/messages' && config?.params?.companyId === 1) {
        return Promise.resolve({
          data: {
            messages: [
              {
                id: 11,
                companyId: 1,
                senderUserId: 5,
                content: 'Initial message',
                sentAt: '2026-04-15T10:00:00.000Z',
                sender: { id: 5, username: 'agent1' },
              },
            ],
          },
        });
      }

      return Promise.resolve({ data: { messages: [] } });
    });
    api.post.mockResolvedValue({
      data: {
        message: {
          id: 20,
          companyId: 1,
          senderUserId: 1,
          content: 'Hello team',
          sentAt: '2026-04-15T10:30:00.000Z',
          sender: { id: 1, username: 'admin' },
        },
      },
    });
  });

  it('renders threads and initial messages from API', async () => {
    render(
      <MemoryRouter initialEntries={['/messages']}>
        <Messages />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: /messages/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('ACME Corp').length).toBeGreaterThan(0);
      expect(screen.getByText('Beta Solutions')).toBeInTheDocument();
      expect(screen.getAllByText('Initial message').length).toBeGreaterThan(0);
    });
  });

  it('sends a message through API from UI', async () => {
    render(
      <MemoryRouter initialEntries={['/messages']}>
        <Messages />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getAllByText('ACME Corp').length).toBeGreaterThan(0));

    const input = screen.getByPlaceholderText('Type message');
    fireEvent.change(input, { target: { value: 'Hello team' } });

    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/messages', {
        companyId: 1,
        content: 'Hello team',
      });
    });
  });
});
