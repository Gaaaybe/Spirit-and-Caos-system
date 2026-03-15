import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, X } from 'lucide-react';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Badge } from '../../../shared/ui/Badge';
import type { AttackEntry, DamageEntry, AttributeName } from '../types';

interface FormAtaquePersonagemProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attack: AttackEntry) => void;
  initialData: AttackEntry;
}

const ATTRIBUTE_OPTIONS = [
  { value: '', label: 'Nenhum' },
  { value: 'Força', label: 'Força' },
  { value: 'Destreza', label: 'Destreza' },
  { value: 'Constituição', label: 'Constituição' },
  { value: 'Inteligência', label: 'Inteligência' },
  { value: 'Sabedoria', label: 'Sabedoria' },
  { value: 'Carisma', label: 'Carisma' },
];

export function FormAtaquePersonagem({
  isOpen,
  onClose,
  onSave,
  initialData,
}: FormAtaquePersonagemProps) {
  const [formData, setFormData] = useState<AttackEntry>(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleAddDamage = () => {
    setFormData((prev) => ({
      ...prev,
      damages: [
        ...prev.damages,
        {
          id: `dmg-${Date.now()}`,
          type: 'Corte',
          formula: '1d6',
          critRange: 20,
          critMultiplier: 2,
        },
      ],
    }));
  };

  const handleUpdateDamage = (id: string, updates: Partial<DamageEntry>) => {
    setFormData((prev) => ({
      ...prev,
      damages: prev.damages.map((dmg) => (dmg.id === id ? { ...dmg, ...updates } : dmg)),
    }));
  };

  const handleRemoveDamage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      damages: prev.damages.filter((dmg) => dmg.id !== id),
    }));
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert('O ataque precisa de um nome.');
      return;
    }
    if (formData.damages.length === 0) {
      alert('O ataque precisa de pelo menos um dano configurado.');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData.name === 'Novo Ataque' ? 'Criar Ataque' : 'Editar Ataque'} size="lg">
      <div className="space-y-6">
        {/* Configurações de Acerto */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
            Configuração de Acerto
          </h4>
          
          <Input
            label="Nome do Ataque"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Espada Longa Flamejante"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Atributo Base"
              value={formData.attribute || ''}
              onChange={(e) => setFormData({ ...formData, attribute: e.target.value as AttributeName || undefined })}
              options={ATTRIBUTE_OPTIONS.map(opt => opt.value)} // Simplifying for basic Select component
            />
            
            <Input
              label="Bônus Fixo (Misc)"
              type="number"
              value={formData.miscBonus}
              onChange={(e) => setFormData({ ...formData, miscBonus: parseInt(e.target.value) || 0 })}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={formData.useEfficiency}
              onChange={(e) => setFormData({ ...formData, useEfficiency: e.target.checked })}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-200 block">Somar Bônus de Eficiência</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Adiciona o bônus de eficiência do personagem ao acerto.</span>
            </div>
          </label>
        </div>

        {/* Configurações de Dano */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Danos</h4>
            <Button size="sm" variant="outline" onClick={handleAddDamage}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar Dano
            </Button>
          </div>

          {formData.damages.map((dmg, index) => (
            <div key={dmg.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative">
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="sm" className="!p-1 text-slate-400 hover:text-red-500" onClick={() => handleRemoveDamage(dmg.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">Dano {index + 1}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  label="Tipo"
                  value={dmg.type}
                  onChange={(e) => handleUpdateDamage(dmg.id, { type: e.target.value })}
                  placeholder="Ex: Corte"
                />
                <Input
                  label="Fórmula"
                  value={dmg.formula}
                  onChange={(e) => handleUpdateDamage(dmg.id, { formula: e.target.value })}
                  placeholder="Ex: 2d6+4"
                />
                <Input
                  label="Margem Crítico"
                  type="number"
                  min="2"
                  max="20"
                  value={dmg.critRange}
                  onChange={(e) => handleUpdateDamage(dmg.id, { critRange: parseInt(e.target.value) || 20 })}
                  helperText="Ex: 19 (para 19-20)"
                />
                <Input
                  label="Multiplicador"
                  type="number"
                  min="1"
                  value={dmg.critMultiplier}
                  onChange={(e) => handleUpdateDamage(dmg.id, { critMultiplier: parseInt(e.target.value) || 2 })}
                  helperText="Ex: 2 (para x2)"
                />
              </div>
            </div>
          ))}

          {formData.damages.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">Nenhum dano configurado.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Salvar Ataque</Button>
      </div>
    </Modal>
  );
}
