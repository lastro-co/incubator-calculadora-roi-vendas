import type { JWT } from 'next-auth/jwt';
import { TokenService } from './token.service';

// Mock environment
jest.mock('../env', () => ({
  env: {
    KEYCLOAK_ID: 'test-client-id',
    KEYCLOAK_SECRET: 'test-client-secret',
    KEYCLOAK_ISSUER: 'http://localhost:8080/auth/realms/test',
  },
}));

// Mock fetch - needs to override MSW
const mockFetch = jest.fn();

// Store original fetch to restore it
const originalFetch = global.fetch;

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    service = new TokenService();
    // Override fetch to bypass MSW for these tests
    global.fetch = mockFetch;
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh token', async () => {
      const mockToken: JWT = {
        accessToken: 'old-access-token',
        refreshToken: 'valid-refresh-token',
        expiresAt: Date.now() - 1000,
      };

      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        id_token: 'new-id-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.refreshAccessToken(mockToken);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/auth/realms/test/protocol/openid-connect/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(URLSearchParams),
        }
      );

      expect(result).toEqual({
        ...mockToken,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
        expiresAt: expect.any(Number),
      });

      expect(result.expiresAt).toBeGreaterThan(Date.now() + 3_500_000); // Should be ~3600 seconds from now
    });

    it('should handle refresh token error', async () => {
      const mockToken: JWT = {
        accessToken: 'old-access-token',
        refreshToken: 'invalid-refresh-token',
        expiresAt: Date.now() - 1000,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await service.refreshAccessToken(mockToken);

      expect(result).toEqual({
        ...mockToken,
        error: 'RefreshAccessTokenError',
      });
    });

    it('should handle network error during refresh', async () => {
      const mockToken: JWT = {
        accessToken: 'old-access-token',
        refreshToken: 'valid-refresh-token',
        expiresAt: Date.now() - 1000,
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.refreshAccessToken(mockToken);

      expect(result).toEqual({
        ...mockToken,
        error: 'RefreshAccessTokenError',
      });
    });

    it('should preserve refresh token if not provided in response', async () => {
      const mockToken: JWT = {
        accessToken: 'old-access-token',
        refreshToken: 'original-refresh-token',
        expiresAt: Date.now() - 1000,
      };

      const mockResponse = {
        access_token: 'new-access-token',
        expires_in: 3600,
        // No refresh_token in response
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.refreshAccessToken(mockToken);

      expect(result.refreshToken).toBe('original-refresh-token');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredToken: JWT = {
        expiresAt: Date.now() - 1000, // 1 second ago
      };

      expect(service.isTokenExpired(expiredToken)).toBe(true);
    });

    it('should return false for valid token', () => {
      const validToken: JWT = {
        expiresAt: Date.now() + 3_600_000, // 1 hour from now
      };

      expect(service.isTokenExpired(validToken)).toBe(false);
    });

    it('should return true for token without expiresAt field', () => {
      const tokenWithoutExpiry: JWT = {};

      expect(service.isTokenExpired(tokenWithoutExpiry)).toBe(true);
    });
  });

  describe('hasValidAccessToken', () => {
    it('should return true for valid token', () => {
      const validToken: JWT = {
        accessToken: 'valid-access-token',
        expiresAt: Date.now() + 3_600_000, // 1 hour from now
      };

      expect(service.hasValidAccessToken(validToken)).toBe(true);
    });

    it('should return false for expired token', () => {
      const expiredToken: JWT = {
        accessToken: 'expired-access-token',
        expiresAt: Date.now() - 1000, // 1 second ago
      };

      expect(service.hasValidAccessToken(expiredToken)).toBe(false);
    });

    it('should return false for token with error', () => {
      const errorToken: JWT = {
        accessToken: 'access-token',
        expiresAt: Date.now() + 3_600_000,
        error: 'RefreshAccessTokenError',
      };

      expect(service.hasValidAccessToken(errorToken)).toBe(false);
    });

    it('should return false for token without accessToken', () => {
      const tokenWithoutAccess: JWT = {
        expiresAt: Date.now() + 3_600_000,
      };

      expect(service.hasValidAccessToken(tokenWithoutAccess)).toBe(false);
    });
  });
});
