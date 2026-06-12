import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import { api } from '../../lib/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <ForgotPassword />
    </MemoryRouter>
  );

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading and email input', () => {
    renderPage();

    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', () => {
    renderPage();

    const emailInput = screen.getByPlaceholderText('Enter Email');
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(screen.getByText('This email is not registered')).toBeInTheDocument();
  });

  it('calls /auth/forgot-password API with valid email', async () => {
    api.post.mockResolvedValue({ data: { message: 'OTP sent' } });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@example.com' });
    });
  });

  it('navigates to OTP page with email state on success', async () => {
    api.post.mockResolvedValue({ data: { message: 'OTP sent' } });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/otp-verification', {
        state: { email: 'user@example.com' },
      });
    });
  });

  it('shows server error message when API fails', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'Email not found' } },
    });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: 'unknown@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeInTheDocument();
    });
  });

  it('trims whitespace from email before sending', async () => {
    api.post.mockResolvedValue({ data: {} });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Enter Email'), {
      target: { value: '  admin@example.com  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'admin@example.com' });
    });
  });
});
