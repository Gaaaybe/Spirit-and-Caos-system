import { useState, useEffect } from 'react';
import { Dices, Hash, Plus, History, X, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { Button, Modal, Badge } from '../ui';
import { rollDamage } from '../utils/diceRoller';

interface RollHistoryItem {
  id: string;
  formula: string;
  total: number;
  rolls: number[];
  timestamp: Date;
}

interface FreeDiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FreeDiceRollerModal({ isOpen, onClose }: FreeDiceRollerModalProps) {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState<{ total: number; rolls: number[]; formula: string; allAttempts?: number[] } | null>(null);
  const [history, setHistory] = useState<RollHistoryItem[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  
  // Vantagem / Desvantagem
  const [rule, setRule] = useState<'advantage' | 'disadvantage' | 'normal'>('normal');
  const [extraDice, setExtraDice] = useState(0);

  // Carregar histórico da sessão
  useEffect(() => {
    const saved = sessionStorage.getItem('aetherium-dice-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch (e) {
        console.error('Erro ao carregar histórico de dados', e);
      }
    }
  }, []);

  // Salvar histórico sempre que mudar
  useEffect(() => {
    sessionStorage.setItem('aetherium-dice-history', JSON.stringify(history));
  }, [history]);

  const handleQuickDice = (dice: string) => {
    if (formula === '') {
      setFormula(dice);
    } else {
      const lastChar = formula.trim().slice(-1);
      if (['+', '-'].includes(lastChar)) {
        setFormula(prev => `${prev}${dice}`);
      } else {
        setFormula(prev => `${prev} + ${dice}`);
      }
    }
  };

  const handleRoll = () => {
    if (!formula.trim()) return;

    setIsRolling(true);
    
    // Pequeno delay para efeito visual
    setTimeout(() => {
      try {
        const attemptsCount = rule === 'normal' ? 1 : 1 + extraDice;
        const attempts: { total: number; rolls: number[] }[] = [];
        
        for (let i = 0; i < attemptsCount; i++) {
          attempts.push(rollDamage(formula));
        }

        let bestAttempt: { total: number; rolls: number[] };
        
        if (rule === 'advantage') {
          bestAttempt = attempts.reduce((prev, curr) => curr.total > prev.total ? curr : prev);
        } else if (rule === 'disadvantage') {
          bestAttempt = attempts.reduce((prev, curr) => curr.total < prev.total ? curr : prev);
        } else {
          bestAttempt = attempts[0];
        }

        const newItem: RollHistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          formula: formula.trim() + (rule !== 'normal' ? ` (${rule === 'advantage' ? 'V' : 'D'}:${extraDice})` : ''),
          total: bestAttempt.total,
          rolls: bestAttempt.rolls,
          timestamp: new Date(),
        };

        setResult({
          total: bestAttempt.total,
          rolls: bestAttempt.rolls,
          formula: formula.trim(),
          allAttempts: rule !== 'normal' ? attempts.map(a => a.total) : undefined
        });
        
        setHistory(prev => [newItem, ...prev].slice(0, 20)); // Limite de 20 itens
      } catch (e) {
        setResult(null);
      } finally {
        setIsRolling(false);
      }
    }, 400);
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('aetherium-dice-history');
  };

  const clearFormula = () => {
    setFormula('');
    setResult(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Diceroller Livre" size="md">
      <div className="space-y-6 py-2">
        {/* --- CAMPO DE ENTRADA --- */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
            <Hash className="w-5 h-5" />
          </div>
          <input 
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRoll()}
            placeholder="Ex: 2d10 + 1d6 + 5"
            className="w-full h-16 pl-12 pr-12 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-xl font-black text-indigo-600 dark:text-indigo-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
          />
          {formula && (
            <button 
              onClick={clearFormula}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* --- BOTÕES DE DADOS RÁPIDOS --- */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '1d100'].map((d) => (
            <button
              key={d}
              onClick={() => handleQuickDice(d)}
              className="h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-black text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95"
            >
              <Plus className="w-3 h-3 opacity-50" /> {d.replace('1d', 'D')}
            </button>
          ))}
          <button 
            onClick={() => setFormula(prev => prev + ' + ')}
            className="h-10 rounded-xl bg-indigo-500 text-white font-black hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center col-span-1"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* --- REGRAS DE VANTAGEM --- */}
        <div className="space-y-3">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 font-bold">
            {(['disadvantage', 'normal', 'advantage'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRule(r);
                  if (r === 'normal') setExtraDice(0);
                  else if (extraDice === 0) setExtraDice(1);
                }}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  rule === r 
                    ? (r === 'advantage' ? 'bg-emerald-500 text-white shadow-sm' : r === 'disadvantage' ? 'bg-red-500 text-white shadow-sm' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm')
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {r === 'advantage' ? 'Vantagem' : r === 'disadvantage' ? 'Desvantagem' : 'Normal'}
              </button>
            ))}
          </div>

          {rule !== 'normal' && (
            <div className="flex items-center justify-between px-2 animate-in slide-in-from-top-2 duration-200">
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Dados Extras (+{extraDice})</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setExtraDice(num)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border transition-all ${
                      extraDice === num 
                        ? 'bg-indigo-500 border-indigo-600 text-white' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- RESULTADO PRINCIPAL --- */}
        <div className="relative min-h-[140px]">
          {isRolling ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/50 dark:bg-gray-900/50 rounded-2xl animate-in fade-in duration-200">
               <Dices className="w-12 h-12 text-indigo-500 animate-bounce" />
               <p className="text-sm font-black text-indigo-600 uppercase tracking-widest animate-pulse">Lançando Dados...</p>
            </div>
          ) : result ? (
            <div className={`p-6 rounded-2xl shadow-xl transition-all animate-in zoom-in-95 duration-300 ${
              rule === 'advantage' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 
              rule === 'disadvantage' ? 'bg-gradient-to-br from-red-500 to-orange-600' :
              'bg-gradient-to-br from-indigo-500 to-purple-600'
            } text-white shadow-indigo-500/20`}>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-white/20 text-white border-none uppercase font-black text-[10px] tracking-widest">{result.formula}</Badge>
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-black leading-none drop-shadow-md">{result.total}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-black text-white/60 tracking-widest mb-1 italic">Detalhamento</p>
                  <p className="text-xs font-bold text-white/90 truncate bg-black/10 rounded-lg p-2 border border-white/10">
                    [{result.rolls.join(', ')}]
                  </p>
                </div>
              </div>
              
              {result.allAttempts && result.allAttempts.length > 1 && (
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                  {result.allAttempts.map((attempt, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[10px] font-black px-2 py-1 rounded ${
                        attempt === result.total 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'bg-white/10 text-white/40 line-through'
                      }`}
                    >
                      {attempt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 gap-2 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
              <Dices className="w-10 h-10 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Clique em Rolar ou pressione Enter</p>
            </div>
          )}
        </div>

        <Button 
          onClick={handleRoll}
          disabled={!formula.trim() || isRolling}
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-lg shadow-indigo-500/30 gap-3 transition-all"
        >
          <Zap className="w-5 h-5" /> ROLAR DADOS
        </Button>

        {/* --- HISTÓRICO --- */}
        {history.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-gray-500">
                <History className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Recentes</span>
              </div>
              <button 
                onClick={clearHistory}
                className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-tighter"
              >
                Limpar
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setFormula(item.formula)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-50/10 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.total}</span>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.formula}</span>
                      <span className="text-[10px] font-medium text-gray-300 dark:text-gray-600 italic">[{item.rolls.slice(0, 5).join(', ')}{item.rolls.length > 5 ? '...' : ''}]</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
