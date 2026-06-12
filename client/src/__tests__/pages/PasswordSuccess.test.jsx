import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PasswordSuccess from '../../pages/PasswordSuccess';
import { describe, it, expect, vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = () => render(<MemoryRouter><PasswordSuccess /></MemoryRouter>);

describe('PasswordSuccess Component', () => {
  it('renders success message', () => {
    renderPage();
    expect(screen.getByText('Password Changed Successfully')).toBeInTheDocument();
    expect(screen.getByText(/your password has been updated/i)).toBeInTheDocument();
  });

  it('navigates to /login when button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /back to login/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
