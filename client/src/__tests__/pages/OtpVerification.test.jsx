import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OtpVerification from '../../pages/OtpVerification';
import { api } from '../../lib/api';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
    useLocation: () => ({ state: { email: 'test@example.com' } }),
  };
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/otp-verification', state: { email: 'test@example.com' } }]}>
      <OtpVerification />
    </MemoryRouter>
  );

describe('OtpVerification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders the heading and shows the email', () => {
    renderPage();

    expect(screen.getByText('OTP Verification')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify code/i })).toBeInTheDocument();
  });

  it('renders 6 OTP input fields', () => {
    renderPage();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('shows error when OTP is incomplete', () => {
    renderPage();

    // Fill only 3 digits
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    fireEvent.change(inputs[1], { target: { value: '2' } });
    fireEvent.change(inputs[2], { target: { value: '3' } });

    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    expect(screen.getByText('Incorrect code. Please try again.')).toBeInTheDocument();
  });

  it('calls /auth/verify-reset-otp with email and full OTP', async () => {
    api.post.mockResolvedValue({ data: { resetToken: 'test-reset-token-123' } });
    renderPage();

    const inputs = screen.getAllByRole('textbox');
    ['1', '2', '3', '4', '5', '6'].forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/verify-reset-otp', {
        email: 'test@example.com',
        otp: '123456',
      });
    });
  });

  it('stores resetToken in sessionStorage and navigates to change-password', async () => {
    api.post.mockResolvedValue({ data: { resetToken: 'my-reset-token' } });
    renderPage();

    const inputs = screen.getAllByRole('textbox');
    ['1', '2', '3', '4', '5', '6'].forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });
    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem('remxcall_pw_reset_token')).toBe('my-reset-token');
      expect(mockNavigate).toHaveBeenCalledWith('/change-password');
    });
  });

  it('shows server error when OTP is invalid', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'Invalid or expired OTP' } },
    });
    renderPage();

    const inputs = screen.getAllByRole('textbox');
    ['9', '9', '9', '9', '9', '9'].forEach((digit, i) => {
      fireEvent.change(inputs[i], { target: { value: digit } });
    });
    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired OTP')).toBeInTheDocument();
    });
  });

  it('calls resend OTP via /auth/forgot-password', async () => {
    api.post.mockResolvedValue({ data: {} });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
    });
  });

  it('handles paste of full OTP code', () => {
    renderPage();

    const inputs = screen.getAllByRole('textbox');
    const pasteEvent = {
      clipboardData: { getData: () => '654321' },
      preventDefault: vi.fn(),
    };

    fireEvent.paste(inputs[0], pasteEvent);

    expect(inputs[0].value).toBe('6');
    expect(inputs[1].value).toBe('5');
    expect(inputs[2].value).toBe('4');
    expect(inputs[3].value).toBe('3');
    expect(inputs[4].value).toBe('2');
    expect(inputs[5].value).toBe('1');
  });
});
