import { NextResponse } from 'next/server';
import { checkOAuthRateLimit } from '@/lib/rate-limit/oauth';

// JWKS endpoint for public key distribution
// MCP servers and clients use this to verify JWT signatures

// For simplicity, we use symmetric keys (HS256) for MVP
// In production, you'd use asymmetric keys (RS256) with proper key rotation

async function getPublicKey() {
  // For HS256, the "public" key is the same secret
  // This is a simplified approach for MVP
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
  
  // Create a mock key for JWKS compatibility
  return {
    kty: 'oct',
    use: 'sig',
    alg: 'HS256',
    kid: 'mcp-key-1',
    k: Buffer.from(secret).toString('base64url'),
  };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting by IP or fallback to user agent
    const identifier = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       request.headers.get('user-agent') || 
                       'unknown';
    const rateLimitResult = await checkOAuthRateLimit('jwks', identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', error_description: 'Too many key requests' },
        { status: 429 }
      );
    }

    const publicKey = await getPublicKey();
    
    return NextResponse.json({
      keys: [publicKey],
    });
  } catch (error) {
    console.error('[JWKS] Error generating keys:', error);
    return NextResponse.json(
      { error: 'Unable to generate keys' },
      { status: 500 }
    );
  }
}
