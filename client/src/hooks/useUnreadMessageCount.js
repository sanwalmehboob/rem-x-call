import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Unread = messages not from you with status !== read (company-scoped for agents).
 */
export function useUnreadMessageCount(intervalMs = 25000) {
  const { token } = useAuth();
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!token) {
      setCount(0);
      return;
    }
    try {
      const { data } = await api.get('/messages/unread-count');
      const n = Number(data?.count);
      setCount(Number.isFinite(n) && n > 0 ? Math.min(99, n) : 0);
    } catch {
      setCount(0);
    }
  }, [token]);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, intervalMs);
    const onFocus = () => fetchCount();
    const onChanged = () => fetchCount();
    window.addEventListener('focus', onFocus);
    window.addEventListener('remxcall:messages-changed', onChanged);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('remxcall:messages-changed', onChanged);
    };
  }, [fetchCount, intervalMs]);

  return count;
}
