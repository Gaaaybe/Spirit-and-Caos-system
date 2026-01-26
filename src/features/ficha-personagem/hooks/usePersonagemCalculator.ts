/**
 * Hook principal da Calculadora de Personagem
 * Gerencia estado e cálculos automatizados
 * 
 * Segue padrão de usePoderCalculator
 */

import { useState, useMemo, useCallback } from 'react';
import type { Personagem, PersonagemCalculado, Attributes, AttributeTempBonuses, SkillName } from '../types';
import {
  calcularModificadores,
  calcularPontosAtributoDisponiveis,
  calcularPVMax,
  calcularPEMax,
  calcularCD,
  buscarBonusEficiencia,
  calcularBonusPericia,
  calcularRDBloqueio,
  calcularPdAUsados,
  calcularEspacosUsados,
} from '../regras/calculadoraPersonagem';
import { ALL_SKILLS } from '../types/skillsMap';

// ========================================
// ESTADO INICIAL
// ========================================

function criarPersonagemInicial(): Personagem {
  const agora = new Date().toISOString();
  
  // Criar skills vazias
  const skills: Personagem['skills'] = {};
  ALL_SKILLS.forEach(skill => {
    skills[skill] = {
      id: skill,
      isEfficient: false,
      isInefficient: false,
      trainingLevel: 0,
      miscBonus: 0,
    };
  });
  
  return {
    id: `char-${Date.now()}`,
    header: {
      name: 'Novo Personagem',
      identity: '',
      origin: '',
      level: 1,
      calamityRank: 'Raposa',
      keyAttributeMental: 'Inteligência',
      keyAttributePhysical: 'Destreza',
      inspiration: 0,
      runics: 0,
      complications: [],
      motivations: [],
    },
    attributes: {
      Força: 10,
      Destreza: 10,
      Constituição: 10,
      Inteligência: 10,
      Sabedoria: 10,
      Carisma: 10,
    },
    attributeTempBonuses: {
      Força: 0,
      Destreza: 0,
      Constituição: 0,
      Inteligência: 0,
      Sabedoria: 0,
      Carisma: 0,
    },
    vitals: {
      pv: {
        current: 20,
        max: 20,
        temp: 0,
      },
      pe: {
        current: 10,
        max: 10,
        temp: 0,
      },
      deathCounters: 0,
    },
    skills,
    dominios: [],
    poderes: [],
    inventory: {
      equipped: {
        mainHand: null,
        offHand: null,
        extraHands: [],
        suit: null,
        accessory: null,
      },
      quickSlots: [],
      backpack: [],
    },
    pdaTotal: 15,
    pdaExtras: 0,
    espacosDisponiveis: 10,
    dataCriacao: agora,
    dataModificacao: agora,
  };
}

// ========================================
// HOOK PRINCIPAL
// ========================================

export function usePersonagemCalculator(personagemInicial?: Personagem) {
  const [personagem, setPersonagem] = useState<Personagem>(
    () => personagemInicial || criarPersonagemInicial()
  );
  
  // ========================================
  // CÁLCULOS DERIVADOS (MEMOIZADOS)
  // ========================================
  
  const calculado = useMemo<PersonagemCalculado>(() => {
    const mods = calcularModificadores(personagem.attributes, personagem.attributeTempBonuses);
    const bonusEficiencia = buscarBonusEficiencia(personagem.header.level);
    
    // Pontos de Atributo disponíveis
    const pontosAtributoDisponiveis = calcularPontosAtributoDisponiveis(
      personagem.header.level,
      personagem.attributes
    );
    
    // Classe de Dificuldade
    const modMental = mods[personagem.header.keyAttributeMental];
    const modPhysical = mods[personagem.header.keyAttributePhysical];
    
    const cdMental = calcularCD(personagem.header.level, modMental);
    const cdPhysical = calcularCD(personagem.header.level, modPhysical);
    
    // Vitais Máximos
    const pvMax = calcularPVMax(personagem.header.level, mods.Constituição);
    const peMax = calcularPEMax(modMental, modPhysical);
    
    // PdA e Espaços
    const pdaUsados = calcularPdAUsados(personagem.poderes);
    const espacosUsados = calcularEspacosUsados(personagem.poderes);
    
    // RD (TODO: calcular poderes passivos)
    const rdPoderesPassivos = 0; // Placeholder
    const rdBloqueio = calcularRDBloqueio(
      personagem.inventory.equipped.suit,
      personagem.inventory.equipped.mainHand,
      personagem.inventory.equipped.offHand,
      personagem.inventory.equipped.extraHands,
      mods.Constituição, // Mod Fortitude = Mod CON
      rdPoderesPassivos
    );
    
    return {
      modificadores: mods,
      pontosAtributoDisponiveis,
      pvMax,
      peMax,
      deslocamento: 9, // Padrão: 9 metros
      cdMental,
      cdPhysical,
      pdaUsados,
      pdaDisponiveis: personagem.pdaTotal - pdaUsados,
      espacosUsados,
      rdBloqueio,
      bonusEficiencia,
    };
  }, [
    personagem.attributes,
    personagem.attributeTempBonuses,
    personagem.header.level,
    personagem.header.keyAttributeMental,
    personagem.header.keyAttributePhysical,
    personagem.poderes,
    personagem.pdaTotal,
    personagem.inventory.equipped,
  ]);
  
  // ========================================
  // AÇÕES DE MODIFICAÇÃO
  // ========================================
  
  const atualizarNivel = useCallback((nivel: number) => {
    setPersonagem(prev => ({
      ...prev,
      header: { ...prev.header, level: nivel },
      dataModificacao: new Date().toISOString(),
    }));
  }, []);
  
  const atualizarAtributo = useCallback((atributo: keyof Attributes, valor: number) => {
    setPersonagem(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [atributo]: valor },
      dataModificacao: new Date().toISOString(),
    }));
  }, []);
  
  const atualizarBonusTemp = useCallback((atributo: keyof AttributeTempBonuses, valor: number) => {
    setPersonagem(prev => ({
      ...prev,
      attributeTempBonuses: { ...prev.attributeTempBonuses, [atributo]: valor },
      dataModificacao: new Date().toISOString(),
    }));
  }, []);
  
  const atualizarPV = useCallback((valor: number, tipo: 'current' | 'temp') => {
    setPersonagem(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        pv: { ...prev.vitals.pv, [tipo]: Math.max(0, valor) },
      },
      dataModificacao: new Date().toISOString(),
    }));
  }, []);
  
  const atualizarPE = useCallback((valor: number, tipo: 'current' | 'temp') => {
    setPersonagem(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        pe: { ...prev.vitals.pe, [tipo]: Math.max(0, valor) },
      },
      dataModificacao: new Date().toISOString(),
    }));
  }, []);
  
  const atualizarPericia = useCallback((skillName: SkillName, updates: Partial<Personagem['skills'][string]>) => {
    setPersonagem(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillName]: { ...prev.skills[skillName], ...updates },
      },
      dataModificacao: new Date().toISOString(),
    }));
  }, []);
  
  const resetarPersonagem = useCallback(() => {
    setPersonagem(criarPersonagemInicial());
  }, []);
  
  const carregarPersonagem = useCallback((novoPersonagem: Personagem) => {
    setPersonagem(novoPersonagem);
  }, []);
  
  // ========================================
  // HELPER: CALCULAR BÔNUS DE PERÍCIA
  // ========================================
  
  const obterBonusPericia = useCallback((skillName: SkillName): number => {
    const skill = personagem.skills[skillName];
    if (!skill) return 0;
    
    return calcularBonusPericia(
      skill,
      skillName,
      calculado.modificadores,
      calculado.bonusEficiencia
    );
  }, [personagem.skills, calculado.modificadores, calculado.bonusEficiencia]);
  
  // ========================================
  // RETORNO
  // ========================================
  
  return {
    personagem,
    calculado,
    
    // Ações
    setPersonagem,
    atualizarNivel,
    atualizarAtributo,
    atualizarBonusTemp,
    atualizarPV,
    atualizarPE,
    atualizarPericia,
    resetarPersonagem,
    carregarPersonagem,
    
    // Helpers
    obterBonusPericia,
  };
}
