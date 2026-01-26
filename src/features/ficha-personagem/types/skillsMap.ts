/**
 * Mapeamento de Perícias para Atributos Base
 * Spirit & Caos RPG System
 */

import type { AttributeName, SkillName } from './index';

/**
 * Mapa que vincula cada perícia ao seu atributo base
 * Usado para calcular o bônus total da perícia
 */
export const SKILL_ATTRIBUTE_MAP: Record<SkillName, AttributeName> = {
  // Perícias Físicas
  'Acrobacia': 'Destreza',
  'Atletismo': 'Força',
  'Cavalgar': 'Destreza',
  'Furtividade': 'Destreza',
  'Iniciativa': 'Destreza',
  'Ladinagem': 'Destreza',
  
  // Perícias Mentais
  'Conhecimento': 'Inteligência',
  'Espiritismo': 'Sabedoria',
  'Exploração': 'Inteligência',
  'Investigação': 'Inteligência',
  'Ofício': 'Inteligência',
  'Religião': 'Inteligência',
  
  // Perícias Sociais
  'Adestrar Animais': 'Carisma',
  'Atuação': 'Carisma',
  'Diplomacia': 'Carisma',
  'Enganação': 'Carisma',
  'Intimidação': 'Carisma',
  
  // Perícias de Percepção/Sabedoria
  'Cura': 'Sabedoria',
  'Intuição': 'Sabedoria',
  'Percepção': 'Sabedoria',
  'Sobrevivência': 'Sabedoria',
  
  // Resistências
  'Fortitude': 'Constituição',
};

/**
 * Lista de todas as perícias do sistema
 */
export const ALL_SKILLS: SkillName[] = [
  'Acrobacia',
  'Adestrar Animais',
  'Atletismo',
  'Atuação',
  'Cavalgar',
  'Conhecimento',
  'Cura',
  'Diplomacia',
  'Enganação',
  'Furtividade',
  'Espiritismo',
  'Religião',
  'Exploração',
  'Intuição',
  'Ladinagem',
  'Ofício',
  'Percepção',
  'Sobrevivência',
  'Investigação',
  'Intimidação',
  'Iniciativa',
  'Fortitude',
];

/**
 * Categorias de perícias (para organização UI)
 */
export const SKILL_CATEGORIES = {
  Físicas: [
    'Acrobacia',
    'Atletismo',
    'Cavalgar',
    'Furtividade',
    'Iniciativa',
    'Ladinagem',
  ] as SkillName[],
  
  Mentais: [
    'Conhecimento',
    'Espiritismo',
    'Exploração',
    'Investigação',
    'Ofício',
    'Religião',
  ] as SkillName[],
  
  Sociais: [
    'Adestrar Animais',
    'Atuação',
    'Diplomacia',
    'Enganação',
    'Intimidação',
  ] as SkillName[],
  
  Percepção: [
    'Cura',
    'Intuição',
    'Percepção',
    'Sobrevivência',
  ] as SkillName[],
  
  Resistência: [
    'Fortitude',
  ] as SkillName[],
};

/**
 * Helper: Obter atributo base de uma perícia
 */
export function getSkillAttribute(skill: SkillName): AttributeName {
  return SKILL_ATTRIBUTE_MAP[skill];
}

/**
 * Helper: Obter categoria de uma perícia
 */
export function getSkillCategory(skill: SkillName): string {
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.includes(skill)) {
      return category;
    }
  }
  return 'Outras';
}
