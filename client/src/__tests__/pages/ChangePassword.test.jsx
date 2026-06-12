import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChangePassword from '../../pages/ChangePassword';
import { api } from '../../lib/api';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: { post: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const PW_KEY = 'remxcall_pw_reset_token';
const renderPage = () => render(<MemoryRouter><ChangePassword /></MemoryRouter>);

describe('ChangePassword Component', () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.setItem(PW_KEY, 'valid-token'); });
  afterEach(() => sessionStorage.clear());

  it('renders heading and password fields', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', () => {
    renderPage();
    const [pw, cpw] = screen.getAllByPlaceholderText('* * * * * * *');
    fireEvent.change(pw, { target: { value: 'Password123!' } });
    fireEvent.change(cpw, { target: { value: 'Different!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  it('shows error when password is too short', () => {
    renderPage();
    const [pw, cpw] = screen.getAllByPlaceholderText('* * * * * * *');
    fireEvent.change(pw, { target: { value: 'short' } });
    fireEvent.change(cpw, { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('calls API and navigates on success', async () => {
    api.post.mockResolvedValue({ data: {} });
    renderPage();
    const [pw, cpw] = screen.getAllByPlaceholderText('* * * * * * *');
    fireEvent.change(pw, { target: { value: 'NewPass123!' } });
    fireEvent.change(cpw, { target: { value: 'NewPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', { resetToken: 'valid-token', newPassword: 'NewPass123!' });
      expect(sessionStorage.getItem(PW_KEY)).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/password-success');
    });
  });

  it('shows server error on API failure', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'Token expired' } } });
    renderPage();
    const [pw, cpw] = screen.getAllByPlaceholderText('* * * * * * *');
    fireEvent.change(pw, { target: { value: 'ValidPass1!' } });
    fireEvent.change(cpw, { target: { value: 'ValidPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: /change password/i }));
    await waitFor(() => expect(screen.getByText('Token expired')).toBeInTheDocument());
  });

  it('redirects if no reset token', () => {
    sessionStorage.clear();
    renderPage();
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password', { replace: true });
  });
});
