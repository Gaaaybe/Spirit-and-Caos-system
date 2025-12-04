import { ZodError } from 'zod';
import { poderSchema, poderParaSalvarSchema } from '../schemas/poder.schema';
import type { Poder } from '../regras/calculadoraCusto';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Hook para validar poderes usando Zod
 */
export function usePoderValidation() {
  /**
   * Valida um poder completo
   */
  const validarPoder = (poder: Poder): ValidationResult => {
    try {
      poderSchema.parse(poder);
      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          isValid: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        };
      }
      return {
        isValid: false,
        errors: [{ field: 'unknown', message: 'Erro desconhecido na validação' }],
      };
    }
  };

  /**
   * Valida poder antes de salvar (regras mais rigorosas)
   */
  const validarParaSalvar = (poder: Poder): ValidationResult => {
    try {
      poderParaSalvarSchema.parse(poder);
      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          isValid: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        };
      }
      return {
        isValid: false,
        errors: [{ field: 'unknown', message: 'Erro desconhecido na validação' }],
      };
    }
  };

  /**
   * Valida apenas o nome do poder
   */
  const validarNome = (nome: string): ValidationResult => {
    try {
      const schema = poderSchema.pick({ nome: true });
      schema.parse({ nome });
      return {
        isValid: true,
        errors: [],
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          isValid: false,
          errors: error.issues.map((err) => ({
            field: 'nome',
            message: err.message,
          })),
        };
      }
      return {
        isValid: false,
        errors: [{ field: 'nome', message: 'Nome inválido' }],
      };
    }
  };

  /**
   * Valida grau de efeito
   */
  const validarGrau = (grau: number): ValidationResult => {
    if (grau < 1) {
      return {
        isValid: false,
        errors: [{ field: 'grau', message: 'Grau mínimo é 1' }],
      };
    }
    if (grau > 20) {
      return {
        isValid: false,
        errors: [{ field: 'grau', message: 'Grau máximo é 20' }],
      };
    }
    if (!Number.isInteger(grau)) {
      return {
        isValid: false,
        errors: [{ field: 'grau', message: 'Grau deve ser um número inteiro' }],
      };
    }
    return {
      isValid: true,
      errors: [],
    };
  };

  /**
   * Helper para extrair a primeira mensagem de erro
   */
  const getFirstError = (result: ValidationResult): string | undefined => {
    return result.isValid ? undefined : result.errors[0]?.message;
  };

  return {
    validarPoder,
    validarParaSalvar,
    validarNome,
    validarGrau,
    getFirstError,
  };
}
