import { NextRequest } from 'next/server';
import { GET } from '@/app/api/mcp-auth/authorize/route';
import { POST as TOKEN_POST } from '@/app/api/mcp-auth/token/route';
import { POST as OBO_POST } from '@/app/api/auth/obo-exchange/route';
import { GET as JWKS_GET } from '@/app/api/auth/jwks/route';
import { kv } from '@vercel/kv';

// Mock KV
jest.mock('@vercel/kv', () => ({
  kv: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    zrange: jest.fn(),
    zadd: jest.fn(),
    expire: jest.fn(),
  },
}));

// Mock NextAuth
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe('OAuth 2.1 Authorization Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/mcp-auth/authorize', () => {
    it('should reject requests with missing parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/mcp-auth/authorize?redirect_uri=http://localhost:12345');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('invalid_request');
    });

    it('should reject non-localhost redirect URIs', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/mcp-auth/authorize?' +
        'redirect_uri=https://evil.com&' +
        'client_id=engify-mcp-client&' +
        'code_challenge=test&' +
        'code_challenge_method=S256&' +
        'state=test&' +
        'resource=urn:mcp:bug-reporter'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('invalid_redirect_uri');
    });

    it('should validate PKCE method is S256', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/mcp-auth/authorize?' +
        'redirect_uri=http://localhost:12345&' +
        'client_id=engify-mcp-client&' +
        'code_challenge=test&' +
        'code_challenge_method=plain&' +
        'state=test&' +
        'resource=urn:mcp:bug-reporter'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('invalid_request');
      expect(data.error_description).toContain('PKCE method must be S256');
    });
  });

  describe('/api/mcp-auth/token', () => {
    it('should reject unsupported grant types', async () => {
      const formData = new FormData();
      formData.append('grant_type', 'password');
      
      const request = new NextRequest('http://localhost:3000/api/mcp-auth/token', {
        method: 'POST',
        body: formData,
      });
      
      const response = await TOKEN_POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('unsupported_grant_type');
    });

    it('should validate authorization code', async () => {
      (kv.get as jest.Mock).mockResolvedValue(null);
      
      const formData = new FormData();
      formData.append('grant_type', 'authorization_code');
      formData.append('code', 'invalid-code');
      formData.append('redirect_uri', 'http://localhost:12345');
      formData.append('client_id', 'engify-mcp-client');
      formData.append('code_verifier', 'test-verifier');
      
      const request = new NextRequest('http://localhost:3000/api/mcp-auth/token', {
        method: 'POST',
        body: formData,
      });
      
      const response = await TOKEN_POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('invalid_grant');
    });
  });

  describe('/api/auth/obo-exchange', () => {
    it('should validate grant type', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/obo-exchange', {
        method: 'POST',
        body: JSON.stringify({
          grant_type: 'authorization_code',
          subject_token: 'test',
          subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          resource: 'urn:mcp:bug-reporter',
          audience: 'urn:engify:rag-service',
        }),
      });
      
      const response = await OBO_POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('unsupported_grant_type');
    });
  });

  describe('/api/auth/jwks', () => {
    it('should return JWKS response', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/jwks');
      
      const response = await JWKS_GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.keys).toHaveLength(1);
      expect(data.keys[0].alg).toBe('HS256');
      expect(data.keys[0].kty).toBe('oct');
    });
  });
});
