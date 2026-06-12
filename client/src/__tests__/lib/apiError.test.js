import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '../../lib/apiError';

describe('getApiErrorMessage', () => {
  it('returns API message from response body', () => {
    expect(
      getApiErrorMessage({
        response: { data: { message: 'Incorrect email or password' } },
      })
    ).toBe('Incorrect email or password');
  });

  it('returns incorrect credentials when 401 has no body message', () => {
    expect(
      getApiErrorMessage({
        message: 'Request failed with status code 401',
        response: { status: 401, data: {} },
      })
    ).toBe('Incorrect email or password.');
  });

  it('hints API URL when response is 404 without JSON message', () => {
    const msg = getApiErrorMessage({
      message: 'Request failed with status code 404',
      response: { status: 404, data: {} },
    });
    expect(msg).toContain('VITE_API_URL');
    expect(msg).toContain('5000');
  });

  it('handles network errors', () => {
    expect(
      getApiErrorMessage({
        code: 'ERR_NETWORK',
        message: 'Network Error',
      })
    ).toContain('Cannot reach the server');
  });
});
