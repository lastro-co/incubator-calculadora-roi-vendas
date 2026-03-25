// Regex constants for URL normalization
const TRAILING_SLASHES = /\/+$/;
const LEADING_SLASHES = /^\/+/;

/**
 * Service responsible for URL construction and query parameter handling
 * Single Responsibility: URL building and parameter serialization
 */
export class UrlBuilderService {
  buildUrl(
    input: RequestInfo | string,
    params?: Record<string, string | number | boolean>
  ): string {
    // Use base URL with new URL to avoid '//' and ensure absolute URLs
    let url: string;
    if (typeof input === 'string') {
      if (input.startsWith('http')) {
        url = input;
      } else {
        const base = process.env.NEXT_PUBLIC_BFF_URL;
        if (!base) {
          throw new Error(
            'NEXT_PUBLIC_BFF_URL is not defined for building relative URLs'
          );
        }
        url = `${base.replace(TRAILING_SLASHES, '')}/${input.replace(LEADING_SLASHES, '')}`;
      }
    } else {
      // Support URL and Request; fallback to string if no 'url' property
      url = (input as any).url ?? input.toString();
    }

    const requestUrl = new URL(url);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        // Convert all values to strings, including booleans
        let stringValue: string;
        if (typeof value === 'boolean') {
          stringValue = value ? 'true' : 'false';
        } else {
          stringValue = String(value);
        }
        requestUrl.searchParams.append(key, stringValue);
      }
    }

    return requestUrl.toString();
  }

  extractBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return url;
    }
  }
}
