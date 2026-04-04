import type { UseCaseError } from './use-case-errors';

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Resource not found');
  }
}
