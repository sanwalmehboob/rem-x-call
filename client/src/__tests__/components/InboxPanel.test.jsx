import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InboxPanel from '../../components/InboxPanel';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [
      {
        id: 1,
        title: 'Christine Wilson',
        body: 'renewed their subscription plan',
        createdAt: new Date().toISOString(),
        isRead: false,
        isArchived: false,
      }
    ],
    markRead: vi.fn(),
    archiveNotif: vi.fn(),
    markAllRead: vi.fn(),
    loading: false,
  }),
}));

describe('Inbox Panel Component', () => {
  it('renders all notifications perfectly when opened', () => {
    // Render the panel with isOpen=true
    render(<InboxPanel isOpen={true} />);
    
    // Check main title
    expect(screen.getByRole('heading', { level: 2, name: /inbox/i })).toBeInTheDocument();
    
    // Check notifications logic
    expect(screen.getByText(/Christine Wilson/i)).toBeInTheDocument();
    expect(screen.getByText(/renewed their subscription plan/i)).toBeInTheDocument();
  });

  it('toggles the filter dropdown menu', () => {
    render(<InboxPanel isOpen={true} />);
    
    expect(screen.queryByText('Unread')).not.toBeInTheDocument();
    const filterButton = screen.getByLabelText('Filter');
    
    fireEvent.click(filterButton);
    expect(screen.getByText('All Notifications')).toBeInTheDocument();
    expect(screen.getByText('Unread')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });
});
