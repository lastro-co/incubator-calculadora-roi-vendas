// Mock dompurify — Jest runs in jsdom where DOMPurify works, but we want to
// isolate tests to our own escapeHtml + sanitizeHref logic.
jest.mock('dompurify', () => ({
  __esModule: true,
  default: { sanitize: (html: string) => html },
}));

import { markdownToHtml } from '../markdown';

describe('markdownToHtml', () => {
  describe('empty / falsy input', () => {
    it('returns empty string for empty input', () => {
      expect(markdownToHtml('')).toBe('');
    });

    it('returns empty string for null-ish input', () => {
      // @ts-expect-error — testing runtime guard
      expect(markdownToHtml(null)).toBe('');
      // @ts-expect-error — testing runtime guard
      expect(markdownToHtml(undefined)).toBe('');
    });
  });

  describe('plain text', () => {
    it('returns plain text unchanged', () => {
      expect(markdownToHtml('Hello world')).toBe('Hello world');
    });
  });

  describe('bold and italic', () => {
    it('converts **bold** to <strong>', () => {
      expect(markdownToHtml('This is **bold** text')).toBe(
        'This is <strong>bold</strong> text'
      );
    });

    it('converts *italic* to <em>', () => {
      expect(markdownToHtml('This is *italic* text')).toBe(
        'This is <em>italic</em> text'
      );
    });

    it('handles bold inside italic context', () => {
      const result = markdownToHtml('**bold** and *italic*');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });
  });

  describe('markdown links', () => {
    it('converts [text](url) to anchor tag', () => {
      const result = markdownToHtml('[Click here](https://example.com)');
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('Click here');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('rejects javascript: protocol in links', () => {
      const jsUrl = `[evil](${'javascript'}:alert(1))`;
      const result = markdownToHtml(jsUrl);
      expect(result).not.toContain('href');
      expect(result).toContain('evil');
    });

    it('rejects data: protocol in links', () => {
      const result = markdownToHtml(
        '[evil](data:text/html,<script>alert(1)</script>)'
      );
      expect(result).not.toContain('href');
    });
  });

  describe('plain URLs', () => {
    it('converts plain https URLs to links', () => {
      const result = markdownToHtml('Visit https://example.com today');
      expect(result).toContain('href="https://example.com"');
    });

    it('converts WhatsApp URLs with label "Abrir whatsapp"', () => {
      const result = markdownToHtml('https://wa.me/5511999999999');
      expect(result).toContain('Abrir whatsapp');
      expect(result).toContain('href="https://wa.me/5511999999999"');
    });

    it('does not double-wrap URLs already in markdown links', () => {
      const result = markdownToHtml('[My link](https://example.com)');
      // Should have exactly one <a> tag, not nested
      const anchorCount = (result.match(/<a /g) || []).length;
      expect(anchorCount).toBe(1);
    });
  });

  describe('line breaks', () => {
    it('converts double newlines to <br><br>', () => {
      const result = markdownToHtml('Line 1\n\nLine 2');
      expect(result).toBe('Line 1<br><br>Line 2');
    });

    it('converts single newlines to <br>', () => {
      const result = markdownToHtml('Line 1\nLine 2');
      expect(result).toBe('Line 1<br>Line 2');
    });
  });

  describe('XSS prevention', () => {
    it('escapes HTML tags in input', () => {
      const result = markdownToHtml('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    it('escapes HTML attributes in input', () => {
      const result = markdownToHtml('<img src=x onerror=alert(1)>');
      // The <img tag is escaped to &lt;img — no real HTML element
      expect(result).not.toContain('<img');
      expect(result).toContain('&lt;img');
    });

    it('does not allow iframe tags', () => {
      const result = markdownToHtml('<iframe src="https://evil.com"></iframe>');
      expect(result).not.toContain('<iframe');
    });

    it('escapes ampersands correctly in URLs', () => {
      const result = markdownToHtml('https://example.com/path?a=1&b=2');
      expect(result).toContain('href=');
      // Should be a valid link, not broken
      expect(result).toContain('<a ');
    });
  });
});
