import { useState } from 'react';
import { Modal, ModalFooter, Button, Badge } from '@/shared/ui';
import { Zap, Clock, Ruler, Timer, Play, Dices } from 'lucide-react';
import { ESCALAS, buscarGrauNaTabela, buscarDominio } from '@/data';
import type { PoderResponse } from '@/services/types';
import { useCatalog } from '@/context/useCatalog';
import { calcularDetalhesPoder, type Poder as PoderCalculo } from '@/features/criador-de-poder/regras/calculadoraCusto';
import { poderResponseToPoder } from '@/features/criador-de-poder/utils/poderApiConverter';
import { DiceRoller } from '@/shared/components/DiceRoller';

function getNomeEscala(tipo: 'acao' | 'alcance' | 'duracao', valor: number): string {
  const escala = ESCALAS[tipo]?.escala.find((e: { valor: number }) => e.valor === valor);
  return escala?.nome || String(valor);
}

const DURACAO_LABELS: Record<number, string> = {
  0: 'Instantâneo',
  1: 'Concentração',
  2: 'Sustentado',
  3: 'Ativado',
  4: 'Permanente',
};

interface PowerUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  power: PoderResponse;
  character: any;
  currentPE: number;
  isUsing: boolean;
  onConfirm: () => void;
}

export function PowerUsageModal({
  isOpen,
  onClose,
  power,
  character,
  currentPE,
  isUsing,
  onConfirm,
}: PowerUsageModalProps) {
  const { efeitos: catalogEfeitos, modificacoes: catalogModificacoes } = useCatalog();

  const poderCalculo = poderResponseToPoder(power) as PoderCalculo;
  const detalhes = calcularDetalhesPoder(poderCalculo, catalogEfeitos, catalogModificacoes);
  const peCost = detalhes.peTotal;
  const duracao = power.parametros.duracao;
  const hasEnoughPE = currentPE >= peCost;

  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [diceRollerConfig, setDiceRollerConfig] = useState<any>({});

  const handleConfirm = () => {
    onConfirm();
  };

  const dominioInfo = buscarDominio(power.dominio.name);
  const isMental = dominioInfo ? dominioInfo.espiritual : false; 

  const keyFisico = character?.attributes?.keyPhysical || 'strength';
  const modFisico = character?.attributes?.[keyFisico]?.rollModifier || 0;
  
  const keyMental = character?.attributes?.keyMental || 'intelligence';
  const modMental = character?.attributes?.[keyMental]?.rollModifier || 0;
  
  const effTeste = isMental ? modMental : modFisico;
  const eficiencia = character?.efficiencyBonus || 0;

  const efeitoComDados = power.effects.find((e: any) => e.effectBaseId.toLowerCase() === 'dano' || e.effectBaseId.toLowerCase().includes('fortalecer'));
  const danoInfo = efeitoComDados ? buscarGrauNaTabela(efeitoComDados.grau) : null;
  const baseDanoFormula = danoInfo ? danoInfo.dano : '';

  const cdInfo = 10 + effTeste + eficiencia;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Usar: ${power.nome}`} size="sm">
      <div className="space-y-5 py-1">
        <div className="flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-1.5 flex-1 text-[11px] text-gray-600 dark:text-gray-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {getNomeEscala('acao', power.parametros.acao)}
            </span>
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-emerald-400" />
              {getNomeEscala('alcance', power.parametros.alcance)}
            </span>
            <span className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              {DURACAO_LABELS[duracao] ?? getNomeEscala('duracao', duracao)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-4 border-l border-gray-200 dark:border-gray-700 min-w-[80px]">
            <Zap className={`w-5 h-5 mb-1 ${hasEnoughPE ? 'text-blue-500' : 'text-red-500'}`} />
            <span className={`text-2xl font-black ${hasEnoughPE ? 'text-blue-600 dark:text-blue-400' : 'text-red-600'}`}>
              {peCost}
            </span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PE</span>
          </div>
        </div>

        {!hasEnoughPE && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-bold">
            <Zap className="w-4 h-4 shrink-0" />
            PE insuficiente — você tem {currentPE} PE, o poder custa {peCost} PE.
          </div>
        )}

        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Assistente de Ação</p>
            <div className="flex flex-wrap gap-2">
               <Button 
                 variant="outline" size="sm" className="h-7 text-[10px] gap-1 px-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
                 onClick={() => {
                   setDiceRollerConfig({
                     label: `Teste de Efeito (${isMental ? 'Mental' : 'Físico'})`,
                     modifier: effTeste,
                     efficiencyBonus: eficiencia,
                     initialApplyEfficiency: true,
                     isModular: false,
                   });
                   setIsDiceRollerOpen(true);
                 }}
               >
                 <Dices className="w-3 h-3" /> Teste: {effTeste >= 0 ? `+${effTeste}` : effTeste}
               </Button>
               
               {baseDanoFormula && (
                 <Button 
                   variant="outline" size="sm" className="h-7 text-[10px] gap-1 px-2 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                   onClick={() => {
                     setDiceRollerConfig({
                       label: 'Modular Dano/Efeito Base',
                       modifier: effTeste,
                       efficiencyBonus: eficiencia,
                       damageFormula: baseDanoFormula,
                       isModular: true,
                     });
                     setIsDiceRollerOpen(true);
                   }}
                 >
                   <Dices className="w-3 h-3 text-amber-500" /> Dado Universal: {baseDanoFormula}
                 </Button>
               )}
            </div>
            
            <div className="flex gap-2 text-[10px] font-bold text-gray-500 mt-2">
               <span title="Dificuldade básica caso o alvo precise resistir à sua Aflição ou Área Especial">
                 CD do Poder (Alvo Resistir): <span className="text-indigo-600 dark:text-indigo-400 font-black">{cdInfo}</span>
               </span>
            </div>
        </div>

        {power.effects && power.effects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {power.effects.map((e: any, i: number) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[9px] px-1.5 py-0 border-indigo-300 text-indigo-600"
              >
                {e.effectBaseId} {e.grau !== 0 && (e.grau > 0 ? `+${e.grau}` : e.grau)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          loading={isUsing}
          disabled={!hasEnoughPE || isUsing}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Play className="w-4 h-4" />
          {peCost > 0 ? `Usar (−${peCost} PE)` : 'Ativar'}
        </Button>
      </ModalFooter>
      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        {...diceRollerConfig}
      />
    </Modal>
  );
}
