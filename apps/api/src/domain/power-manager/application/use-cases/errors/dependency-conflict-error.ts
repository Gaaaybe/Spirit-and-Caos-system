import type { UseCaseError } from '@/core/errors/use-case-errors';

export class DependencyConflictError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message);
    this.name = 'DependencyConflictError';
  }
}
