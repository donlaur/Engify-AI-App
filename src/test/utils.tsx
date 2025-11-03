/**
 * Test Utilities
 *
 * Reusable helpers for testing React components
 */

import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

/**
 * Custom render function with providers
 * Add any global providers here (QueryClient, Theme, etc.)
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed
}

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      session={null}
      basePath="/api/auth"
    >
      {/* Add other providers here as we build them */}
      {/* <QueryClientProvider client={queryClient}> */}
      {children}
      {/* </QueryClientProvider> */}
    </SessionProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return {
    ...render(ui, { wrapper: AllTheProviders, ...options }),
    user: userEvent.setup(),
  };
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
