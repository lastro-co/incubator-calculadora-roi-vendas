import DOMPurify from 'dompurify';

const LINK_CLASS =
  'inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 hover:underline';

// External link icon SVG (static, trusted markup)
const externalIcon =
  '<svg class="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>';

const SAFE_PROTOCOL_RE = /^https?:\/\//i;

/**
 * HTML-escape a string so it's safe to embed in HTML.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Return the href only if it uses a safe protocol, otherwise return empty string.
 */
function sanitizeHref(url: string): string {
  const trimmed = url.trim();
  if (SAFE_PROTOCOL_RE.test(trimmed)) {
    return trimmed;
  }
  return '';
}

/**
 * Build an <a> tag with a validated href.
 * Returns just the escaped label text if the URL is not safe.
 *
 * Note: href is already HTML-escaped by the initial escapeHtml() pass,
 * so we use it directly — do NOT double-escape.
 */
function buildLink(href: string, label: string): string {
  const safeHref = sanitizeHref(href);
  if (!safeHref) {
    return label;
  }
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="${LINK_CLASS}">${label}${externalIcon}</a>`;
}

/**
 * Convert simple markdown to HTML.
 * Handles: bold, italic, links, plain URLs, line breaks.
 *
 * Security:
 *  1. HTML-escapes the raw input first
 *  2. Validates link protocols (http/https only)
 *  3. Runs DOMPurify.sanitize on the final output
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) {
    return '';
  }

  // 1. HTML-escape the raw markdown so user content can't inject tags
  let html = escapeHtml(markdown);

  // 2. Markdown replacements on the escaped text

  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert markdown links [text](url) to <a> with validated href
  // After escaping, parentheses in URLs remain literal but quotes are escaped
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, text: string, url: string) => buildLink(url, text)
  );

  // Convert plain URLs to clickable links
  // Lookbehinds prevent re-matching URLs already inside href="..." from buildLink

  // WhatsApp links
  html = html.replace(
    /(?<!href=")(https?:\/\/wa\.me\/[^\s&]+(?:&amp;[^\s&]+)*)/g,
    (_match, url: string) => buildLink(url, 'Abrir whatsapp')
  );

  // Remaining URLs
  html = html.replace(
    /(?<!href=")https?:\/\/[^\s&]+(?:&amp;[^\s&]+)*/g,
    (url) => buildLink(url, url)
  );

  // Convert line breaks
  html = html.replace(/ {2}\n/g, '<br>');
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');

  // 3. Final sanitization pass (client-only — DOMPurify needs a DOM).
  //    On the server, escapeHtml + sanitizeHref already prevent XSS.
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['a', 'strong', 'em', 'br', 'svg', 'path'],
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'class',
        // SVG attributes
        'fill',
        'stroke',
        'viewBox',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-width',
        'd',
      ],
    });
  }

  return html;
}
