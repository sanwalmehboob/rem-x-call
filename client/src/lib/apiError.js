/**
 * Human-readable message from an axios/fetch-style error (or unknown throw).
 */
export function getApiErrorMessage(error) {
  if (!error || typeof error !== 'object') {
    return 'Something went wrong. Please try again.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (data && typeof data === 'object') {
    const msg = data.message;
    if (typeof msg === 'string' && msg.trim()) {
      return msg.trim();
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }
  }

  if (typeof data === 'string' && data.trim()) {
    const t = data.trim();
    if (t.startsWith('{')) {
      try {
        const parsed = JSON.parse(t);
        if (typeof parsed.message === 'string' && parsed.message.trim()) {
          return parsed.message.trim();
        }
      } catch {
        /* ignore */
      }
    }
    if (t.startsWith('<')) {
      return misconfiguredApiMessage(status);
    }
    return t.length > 200 ? `${t.slice(0, 200)}…` : t;
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot reach the server. Check that it is running and VITE_API_URL matches the API (e.g. http://localhost:5000).';
  }

  const m = error.message;
  if (typeof m === 'string' && m.startsWith('Request failed with status code')) {
    if (status === 404) {
      return misconfiguredApiMessage(404);
    }
    if (status === 401) {
      return 'Incorrect email or password.';
    }
    return `The server returned an error (${status ?? 'unknown'}). Check VITE_API_URL and that the API is running.`;
  }

  if (typeof m === 'string' && m.trim()) {
    return m.trim();
  }

  return 'Unable to sign in. Please try again.';
}

function misconfiguredApiMessage(status) {
  return `The app could not reach the JSON API (HTTP ${status ?? 'error'}). In dev, either set VITE_API_URL=http://localhost:5000 in client/.env or keep the default relative /v1 and run the backend on port 5000 (Vite proxies /v1 there).`;
}
