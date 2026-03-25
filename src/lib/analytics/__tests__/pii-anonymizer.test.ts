import {
  type AnonymizedClientInfo,
  anonymizeCoordinates,
  anonymizeIP,
} from '../pii-anonymizer';

describe('PII Anonymizer', () => {
  describe('anonymizeIP', () => {
    it('should hash IPv4 addresses consistently', () => {
      const ip = '192.168.1.1';
      const hash1 = anonymizeIP(ip);
      const hash2 = anonymizeIP(ip);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
      expect(hash1).not.toContain(ip);
    });

    it('should hash IPv6 addresses consistently', () => {
      const ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      const hash1 = anonymizeIP(ip);
      const hash2 = anonymizeIP(ip);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash1).not.toContain(ip);
    });

    it('should produce different hashes for different IPs', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      const hash1 = anonymizeIP(ip1);
      const hash2 = anonymizeIP(ip2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('anonymizeCoordinates', () => {
    it('should quantize coordinates to 1 decimal place (~10km)', () => {
      const result = anonymizeCoordinates(37.774_929_5, -122.419_415_5);

      expect(result.latitude).toBe(37.8);
      expect(result.longitude).toBe(-122.4);
    });

    it('should round coordinates correctly', () => {
      expect(anonymizeCoordinates(37.74, -122.41)).toEqual({
        latitude: 37.7,
        longitude: -122.4,
      });

      expect(anonymizeCoordinates(37.75, -122.44)).toEqual({
        latitude: 37.8,
        longitude: -122.4,
      });
    });

    it('should handle negative coordinates', () => {
      const result = anonymizeCoordinates(-23.550_519_9, -46.633_309_4);

      expect(result.latitude).toBe(-23.6);
      expect(result.longitude).toBe(-46.6);
    });

    it('should handle zero coordinates', () => {
      const result = anonymizeCoordinates(0.0, 0.0);

      expect(result.latitude).toBe(0);
      expect(result.longitude).toBe(0);
    });
  });

  describe('applyPIIControls integration', () => {
    it('should keep non-PII fields regardless of PII setting', () => {
      const mockClientInfo: AnonymizedClientInfo = {
        library: 'http/2.0',
        platform: 'Chrome',
        os_name: 'Mac OS',
        os_version: '10.15.7',
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        ip: '192.168.1.1',
        latitude: 37.774_929_5,
        longitude: -122.419_415_5,
        language: 'en',
      };

      // Non-PII fields that should always be present
      expect(mockClientInfo.library).toBe('http/2.0');
      expect(mockClientInfo.platform).toBe('Chrome');
      expect(mockClientInfo.os_name).toBe('Mac OS');
      expect(mockClientInfo.country).toBe('US');
    });
  });
});
