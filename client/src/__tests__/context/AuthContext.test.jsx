import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { api, setAuthToken } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  },
  setAuthToken: vi.fn(),
}));

function TestHarness() {
  const { logout, isAuthenticated, isReady } = useAuth();

  return (
    <div>
      <p data-testid="ready">{String(isReady)}</p>
      <p data-testid="authed">{String(isAuthenticated)}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext logout', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { user: { id: 1, email: 'seed@example.com' } } });
    api.post.mockResolvedValue({});
  });

  it('calls backend logout and clears local session when token exists', async () => {
    localStorage.setItem('remxcall_access_token', 'token-1');
    localStorage.setItem('remxcall_user', JSON.stringify({ id: 1, email: 'seed@example.com' }));

    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').textContent).toBe('true');
      expect(screen.getByTestId('authed').textContent).toBe('true');
    });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorage.getItem('remxcall_access_token')).toBeNull();
      expect(localStorage.getItem('remxcall_user')).toBeNull();
      expect(setAuthToken).toHaveBeenCalledWith(null);
      expect(screen.getByTestId('authed').textContent).toBe('false');
    });
  });

  it('does not clear session during hydrate when /auth/me fails with server error', async () => {
    localStorage.setItem('remxcall_access_token', 'token-2');
    localStorage.setItem('remxcall_user', JSON.stringify({ id: 2, email: 'cached@example.com' }));
    api.get.mockRejectedValue({ response: { status: 500 } });

    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').textContent).toBe('true');
      expect(screen.getByTestId('authed').textContent).toBe('true');
      expect(localStorage.getItem('remxcall_access_token')).toBe('token-2');
      expect(localStorage.getItem('remxcall_user')).toContain('cached@example.com');
    });
  });
});
