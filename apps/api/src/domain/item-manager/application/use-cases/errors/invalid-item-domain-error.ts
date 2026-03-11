import type { UseCaseError } from '@/core/errors/use-case-errors';

export class InvalidItemDomainError extends Error implements UseCaseError {
  constructor(message?: string) {
    super(message ?? 'Domínio do poder não é compatível com o domínio do item');
    this.name = 'InvalidItemDomainError';
  }
}
