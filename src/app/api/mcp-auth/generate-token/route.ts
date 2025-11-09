import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

// Generate MCP token for authenticated users
// This endpoint creates a JWT that the MCP server can use to access bug reports

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
const CLIENT_ID = 'engify-mcp-client';

export async function POST() {
  try {
    // Verify user is authenticated
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'unauthorized', error_description: 'You must be logged in to generate MCP tokens' },
        { status: 401 }
      );
    }

    // Generate MCP token with user context
    const token = await new SignJWT({
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      clientId: CLIENT_ID,
      scope: 'read write', // MCP server permissions
      resource: 'urn:mcp:bug-reporter', // RFC 8707 Resource Indicator
      jti: nanoid(), // Unique token ID
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(`${process.env.NEXTAUTH_URL}`)
      .setAudience('urn:mcp:bug-reporter') // Resource-specific audience
      .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_EXPIRY)
      .sign(JWT_SECRET);

    console.log(`[MCP Auth] Generated token for user ${session.user.id}`);

    return NextResponse.json({
      token,
      expires_in: TOKEN_EXPIRY,
      token_type: 'Bearer',
      scope: 'read write',
      resource: 'urn:mcp:bug-reporter',
    });

  } catch (error) {
    console.error('[MCP Auth] Token generation error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
