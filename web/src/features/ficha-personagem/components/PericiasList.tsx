/**
 * Lista de Perícias com toggle eficiente/ineficiente
 */

import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Input } from '../../../shared/ui/Input';
import { Tooltip } from '../../../shared/ui/Tooltip';
import type { SkillsState, Attributes } from '../types';
import { SKILL_CATEGORIES, getSkillAttribute } from '../types/skillsMap';

interface PericiasListProps {
  skills: SkillsState;
  modificadores: Attributes;
  bonusEficiencia: number;
  keyAttributePhysical: keyof Attributes;
  keyAttributeMental: keyof Attributes;
  onUpdateSkill: (
    skillId: string,
    updates: {
      isEfficient?: boolean;
      isInefficient?: boolean;
      trainingLevel?: number;
      miscBonus?: number;
    }
  ) => void;
  calcularBonusPericia: (skillId: string) => number;
}

export function PericiasList({
  skills,
  modificadores,
  bonusEficiencia,
  keyAttributePhysical,
  keyAttributeMental,
  onUpdateSkill,
  calcularBonusPericia,
}: PericiasListProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Perícias</h3>

        {/* Info do bônus de eficiência */}
        <div className="p-3 bg-blue-50 rounded text-sm">
          <p className="text-blue-800">
            <strong>Bônus de Eficiência:</strong> +{bonusEficiencia}
          </p>
          <p className="text-blue-600 text-xs mt-1">
            Aplicado quando a perícia está marcada como "Eficiente"
          </p>
        </div>

        {/* Lista por categoria */}
        {Object.entries(SKILL_CATEGORIES).map(([categoria, skillIds]) => (
          <div key={categoria} className="space-y-3">
            <h4 className="font-bold text-lg border-b pb-2">{categoria}</h4>

            <div className="space-y-2">
              {skillIds.map((skillId) => {
                const skill = skills[skillId] || {
                  id: skillId,
                  isEfficient: false,
                  isInefficient: false,
                  trainingLevel: 0,
                  miscBonus: 0,
                };
                
                // Definir qual atributo mostrar
                let atributoBase = getSkillAttribute(skillId);
                if (skillId === 'Atletismo') {
                  atributoBase = keyAttributePhysical;
                } else if (skillId === 'Espiritismo') {
                  atributoBase = keyAttributeMental;
                }
                
                const bonusTotal = calcularBonusPericia(skillId);

                return (
                  <div
                    key={skillId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    {/* Nome da perícia */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{skillId}</span>
                        <Badge variant="secondary" size="sm">
                          {atributoBase} {modificadores[atributoBase] >= 0 ? '+' : ''}
                          {modificadores[atributoBase]}
                        </Badge>
                      </div>
                    </div>

                    {/* Treino */}
                    <Tooltip content="Nível de Treino">
                      <div className="w-20">
                        <Input
                          type="number"
                          value={skill.trainingLevel}
                          onChange={(e) =>
                            onUpdateSkill(skillId, {
                              trainingLevel: parseInt(e.target.value) || 0,
                            })
                          }
                          min={0}
                          placeholder="Treino"
                          className="text-center text-sm"
                        />
                      </div>
                    </Tooltip>

                    {/* Misc */}
                    <Tooltip content="Bônus Diversos">
                      <div className="w-20">
                        <Input
                          type="number"
                          value={skill.miscBonus}
                          onChange={(e) =>
                            onUpdateSkill(skillId, {
                              miscBonus: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="Misc"
                          className="text-center text-sm"
                        />
                      </div>
                    </Tooltip>

                    {/* Toggles */}
                    <div className="flex gap-1">
                      <Tooltip content="Eficiente: +Bônus de Eficiência">
                        <button
                          onClick={() =>
                            onUpdateSkill(skillId, {
                              isEfficient: !skill.isEfficient,
                              isInefficient: false, // Desativa ineficiente se ativar eficiente
                            })
                          }
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            skill.isEfficient
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          EF
                        </button>
                      </Tooltip>

                      <Tooltip content="Ineficiente: -Bônus de Eficiência">
                        <button
                          onClick={() =>
                            onUpdateSkill(skillId, {
                              isInefficient: !skill.isInefficient,
                              isEfficient: false, // Desativa eficiente se ativar ineficiente
                            })
                          }
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            skill.isInefficient
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          IN
                        </button>
                      </Tooltip>
                    </div>

                    {/* Bônus Total */}
                    <Badge
                      variant={bonusTotal >= 0 ? 'success' : 'warning'}
                      className="text-lg font-mono w-16 text-center"
                    >
                      {bonusTotal >= 0 ? '+' : ''}
                      {bonusTotal}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
