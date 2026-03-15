import { useState } from 'react';
import { Target, Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { AttackRollerModal } from './AttackRollerModal';
import { FormAtaquePersonagem } from './FormAtaquePersonagem';
import type { AttackEntry, Attributes } from '../types';

interface AtaquesListProps {
  attacks: AttackEntry[];
  attributes: Attributes;
  modificadores: Attributes;
  bonusEficiencia: number;
  onUpdateAttacks: (attacks: AttackEntry[]) => void;
}

export function AtaquesList({
  attacks,
  attributes,
  modificadores,
  bonusEficiencia,
  onUpdateAttacks,
}: AtaquesListProps) {
  const [rollingAttack, setRollingAttack] = useState<AttackEntry | null>(null);
  const [editingAttack, setEditingAttack] = useState<AttackEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveAttack = (attack: AttackEntry) => {
    if (isCreating) {
      onUpdateAttacks([...attacks, attack]);
    } else {
      onUpdateAttacks(attacks.map((a) => (a.id === attack.id ? attack : a)));
    }
    setEditingAttack(null);
    setIsCreating(false);
  };

  const handleDeleteAttack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja remover este ataque?')) {
      onUpdateAttacks(attacks.filter((a) => a.id !== id));
    }
  };

  const handleEditAttack = (attack: AttackEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAttack(attack);
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-red-500" />
          Ataques
        </h3>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingAttack({
              id: `atk-${Date.now()}`,
              name: 'Novo Ataque',
              useEfficiency: true,
              miscBonus: 0,
              damages: [{ id: `dmg-${Date.now()}`, type: 'Corte', formula: '1d8', critRange: 20, critMultiplier: 2 }],
            });
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Novo Ataque
        </Button>
      </div>

      {attacks.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
          <p>Nenhum ataque configurado.</p>
          <p className="text-sm mt-1">Crie um ataque para fazer rolagens rápidas.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attacks.map((attack) => {
            // Calcular o bônus final para mostrar na UI
            const attrMod = attack.attribute ? modificadores[attack.attribute] : 0;
            const effBonus = attack.useEfficiency ? bonusEficiencia : 0;
            const totalBonus = attrMod + effBonus + attack.miscBonus;

            return (
              <Card 
                key={attack.id} 
                className="overflow-hidden hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer group"
                onClick={() => setRollingAttack(attack)}
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {attack.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex flex-wrap gap-x-2">
                        {attack.attribute && <span>{attack.attribute}</span>}
                        {attack.useEfficiency && <span>Eficiência</span>}
                        {attack.miscBonus !== 0 && <span>Misc {attack.miscBonus > 0 ? `+${attack.miscBonus}` : attack.miscBonus}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="!p-1.5 h-auto text-slate-500 hover:text-blue-500" onClick={(e) => handleEditAttack(attack, e)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="!p-1.5 h-auto text-slate-500 hover:text-red-500" onClick={(e) => handleDeleteAttack(attack.id, e)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Target className="w-4 h-4" /> Acerto
                      </span>
                      <Badge variant={totalBonus >= 0 ? "success" : "warning"} className="text-base">
                        {totalBonus >= 0 ? '+' : ''}{totalBonus}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      {attack.damages.map((dmg) => (
                        <div key={dmg.id} className="flex items-center justify-between text-sm bg-orange-50/50 dark:bg-orange-900/10 p-1.5 rounded">
                          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-orange-500" /> {dmg.formula} {dmg.type}
                          </span>
                          <Badge variant="outline" size="sm" className="text-xs">
                            {dmg.critRange === 20 ? '20' : `${dmg.critRange}-20`} / x{dmg.critMultiplier}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Rolagem */}
      {rollingAttack && (
        <AttackRollerModal
          attack={rollingAttack}
          attributes={attributes}
          modificadores={modificadores}
          bonusEficiencia={bonusEficiencia}
          onClose={() => setRollingAttack(null)}
        />
      )}

      {/* Modal de Criação/Edição */}
      {editingAttack && (
        <FormAtaquePersonagem
          isOpen={!!editingAttack}
          onClose={() => {
            setEditingAttack(null);
            setIsCreating(false);
          }}
          onSave={handleSaveAttack}
          initialData={editingAttack}
        />
      )}
    </div>
  );
}
