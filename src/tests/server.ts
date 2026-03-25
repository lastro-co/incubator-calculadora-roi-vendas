import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Re-export MSW utilities for consistent imports
export { HttpResponse, http } from 'msw';
