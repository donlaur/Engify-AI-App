/**
 * NextAuth.js Type Extensions
 * 
 * Extend default types to include our custom fields
 */

import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    organizationId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
      organizationId: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    organizationId: string | null;
  }
}
