import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthProvider } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { headers: { common: {} } },
  },
  setAuthToken: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

describe('Login Component Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders all essential input fields and texts perfectly', async () => {
    renderLogin();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^login$/i })).not.toBeDisabled();
    });

    expect(screen.getByText('Welcome to RemXCall')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('shows an error message if the email is incorrectly formatted', async () => {
    renderLogin();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^login$/i })).not.toBeDisabled();
    });

    const emailInput = screen.getByPlaceholderText('Enter Email');
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    fireEvent.change(emailInput, { target: { value: 'just-a-fake-email' } });
    fireEvent.click(loginButton);

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('shows an error when password is shorter than 8 characters', async () => {
    renderLogin();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^login$/i })).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: 'ok@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('shows server error message when login fails', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'Incorrect email or password' } },
    });

    renderLogin();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^login$/i })).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: 'a@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'password12' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password')).toBeInTheDocument();
    });
  });

  it('submits credentials and navigates to the dashboard on success', async () => {
    api.post.mockResolvedValue({
      data: {
        user: { id: 1, email: 'a@example.com' },
        tokens: { access: { token: 'test-access-token' } },
      },
    });

    renderLogin();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^login$/i })).not.toBeDisabled();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: 'a@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Password'), {
      target: { value: 'password12' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'a@example.com',
        password: 'password12',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
