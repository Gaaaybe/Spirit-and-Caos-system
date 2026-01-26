/**
 * Hook para Gerenciar Vitais (PV e PE)
 * Tracking de mudanças com histórico para sincronização futura
 */

import { useCallback, useState } from 'react';
import type { Vitals, VitalChangeLog } from '../types';

interface UseVitalsManagerProps {
  vitals: Vitals;
  onVitalsChange: (vitals: Vitals) => void;
}

interface UseVitalsManagerReturn {
  // Modificar PV
  aplicarDano: (valor: number, fonte?: string) => void;
  curarDano: (valor: number, fonte?: string) => void;
  adicionarPVTemp: (valor: number, fonte?: string) => void;
  removerPVTemp: () => void;
  
  // Modificar PE
  gastarPE: (valor: number, fonte?: string) => void;
  recuperarPE: (valor: number, fonte?: string) => void;
  adicionarPETemp: (valor: number, fonte?: string) => void;
  removerPETemp: () => void;
  
  // Contadores de morte
  adicionarContadorMorte: () => void;
  removerContadorMorte: () => void;
  resetarContadoresMorte: () => void;
  
  // Histórico
  historico: VitalChangeLog[];
  limparHistorico: () => void;
  
  // Helpers
  estaMorto: boolean;
  estaInconsciente: boolean;
  percentualPV: number;
  percentualPE: number;
}

export function useVitalsManager({ 
  vitals, 
  onVitalsChange 
}: UseVitalsManagerProps): UseVitalsManagerReturn {
  
  const [historico, setHistorico] = useState<VitalChangeLog[]>([]);
  
  /**
   * Adiciona entrada no histórico
   */
  const adicionarHistorico = useCallback((log: Omit<VitalChangeLog, 'timestamp'>) => {
    setHistorico(prev => [
      ...prev,
      { ...log, timestamp: Date.now() }
    ]);
  }, []);
  
  // ========================================
  // MODIFICADORES DE PV
  // ========================================
  
  const aplicarDano = useCallback((valor: number, fonte?: string) => {
    const danoReal = Math.max(0, valor);
    
    // Primeiro remove PV temporário
    let pvTempRestante = vitals.pv.temp;
    let danoRestante = danoReal;
    
    if (pvTempRestante > 0) {
      const danoAbsorvido = Math.min(pvTempRestante, danoRestante);
      pvTempRestante -= danoAbsorvido;
      danoRestante -= danoAbsorvido;
    }
    
    // Depois aplica no PV atual
    const novoPV = Math.max(0, vitals.pv.current - danoRestante);
    
    onVitalsChange({
      ...vitals,
      pv: {
        ...vitals.pv,
        current: novoPV,
        temp: pvTempRestante,
      },
    });
    
    adicionarHistorico({
      tipo: 'dano',
      recurso: 'pv',
      valor: danoReal,
      fonte,
    });
  }, [vitals, onVitalsChange, adicionarHistorico]);
  
  const curarDano = useCallback((valor: number, fonte?: string) => {
    const curaReal = Math.max(0, valor);
    const novoPV = Math.min(vitals.pv.max, vitals.pv.current + curaReal);
    
    onVitalsChange({
      ...vitals,
      pv: {
        ...vitals.pv,
        current: novoPV,
      },
    });
    
    adicionarHistorico({
      tipo: 'cura',
      recurso: 'pv',
      valor: curaReal,
      fonte,
    });
  }, [vitals, onVitalsChange, adicionarHistorico]);
  
  const adicionarPVTemp = useCallback((valor: number, fonte?: string) => {
    const bonusReal = Math.max(0, valor);
    
    onVitalsChange({
      ...vitals,
      pv: {
        ...vitals.pv,
        temp: vitals.pv.temp + bonusReal,
      },
    });
    
    adicionarHistorico({
      tipo: 'temp',
      recurso: 'pv',
      valor: bonusReal,
      fonte,
    });
  }, [vitals, onVitalsChange, adicionarHistorico]);
  
  const removerPVTemp = useCallback(() => {
    if (vitals.pv.temp > 0) {
      onVitalsChange({
        ...vitals,
        pv: {
          ...vitals.pv,
          temp: 0,
        },
      });
    }
  }, [vitals, onVitalsChange]);
  
  // ========================================
  // MODIFICADORES DE PE
  // ========================================
  
  const gastarPE = useCallback((valor: number, fonte?: string) => {
    const gastoReal = Math.max(0, valor);
    
    // Primeiro gasta PE temporário
    let peTempRestante = vitals.pe.temp;
    let gastoRestante = gastoReal;
    
    if (peTempRestante > 0) {
      const gastoTemp = Math.min(peTempRestante, gastoRestante);
      peTempRestante -= gastoTemp;
      gastoRestante -= gastoTemp;
    }
    
    // Depois gasta PE normal
    const novoPE = Math.max(0, vitals.pe.current - gastoRestante);
    
    onVitalsChange({
      ...vitals,
      pe: {
        ...vitals.pe,
        current: novoPE,
        temp: peTempRestante,
      },
    });
    
    adicionarHistorico({
      tipo: 'pe-gasto',
      recurso: 'pe',
      valor: gastoReal,
      fonte,
    });
  }, [vitals, onVitalsChange, adicionarHistorico]);
  
  const recuperarPE = useCallback((valor: number, fonte?: string) => {
    const recuperacaoReal = Math.max(0, valor);
    const novoPE = Math.min(vitals.pe.max, vitals.pe.current + recuperacaoReal);
    
    onVitalsChange({
      ...vitals,
      pe: {
        ...vitals.pe,
        current: novoPE,
      },
    });
    
    adicionarHistorico({
      tipo: 'pe-recuperado',
      recurso: 'pe',
      valor: recuperacaoReal,
      fonte,
    });
  }, [vitals, onVitalsChange, adicionarHistorico]);
  
  const adicionarPETemp = useCallback((valor: number, fonte?: string) => {
    const bonusReal = Math.max(0, valor);
    
    onVitalsChange({
      ...vitals,
      pe: {
        ...vitals.pe,
        temp: vitals.pe.temp + bonusReal,
      },
    });
    
    adicionarHistorico({
      tipo: 'temp',
      recurso: 'pe',
      valor: bonusReal,
      fonte,
    });
  }, [vitals, onVitalsChange, adicionarHistorico]);
  
  const removerPETemp = useCallback(() => {
    if (vitals.pe.temp > 0) {
      onVitalsChange({
        ...vitals,
        pe: {
          ...vitals.pe,
          temp: 0,
        },
      });
    }
  }, [vitals, onVitalsChange]);
  
  // ========================================
  // CONTADORES DE MORTE
  // ========================================
  
  const adicionarContadorMorte = useCallback(() => {
    if (vitals.deathCounters < 3) {
      onVitalsChange({
        ...vitals,
        deathCounters: vitals.deathCounters + 1,
      });
    }
  }, [vitals, onVitalsChange]);
  
  const removerContadorMorte = useCallback(() => {
    if (vitals.deathCounters > 0) {
      onVitalsChange({
        ...vitals,
        deathCounters: vitals.deathCounters - 1,
      });
    }
  }, [vitals, onVitalsChange]);
  
  const resetarContadoresMorte = useCallback(() => {
    if (vitals.deathCounters > 0) {
      onVitalsChange({
        ...vitals,
        deathCounters: 0,
      });
    }
  }, [vitals, onVitalsChange]);
  
  // ========================================
  // HISTÓRICO
  // ========================================
  
  const limparHistorico = useCallback(() => {
    setHistorico([]);
  }, []);
  
  // ========================================
  // HELPERS
  // ========================================
  
  const estaMorto = vitals.deathCounters >= 3;
  const estaInconsciente = vitals.pv.current <= 0;
  const percentualPV = vitals.pv.max > 0 
    ? Math.round((vitals.pv.current / vitals.pv.max) * 100) 
    : 0;
  const percentualPE = vitals.pe.max > 0 
    ? Math.round((vitals.pe.current / vitals.pe.max) * 100) 
    : 0;
  
  return {
    // PV
    aplicarDano,
    curarDano,
    adicionarPVTemp,
    removerPVTemp,
    
    // PE
    gastarPE,
    recuperarPE,
    adicionarPETemp,
    removerPETemp,
    
    // Contadores
    adicionarContadorMorte,
    removerContadorMorte,
    resetarContadoresMorte,
    
    // Histórico
    historico,
    limparHistorico,
    
    // Helpers
    estaMorto,
    estaInconsciente,
    percentualPV,
    percentualPE,
  };
}
