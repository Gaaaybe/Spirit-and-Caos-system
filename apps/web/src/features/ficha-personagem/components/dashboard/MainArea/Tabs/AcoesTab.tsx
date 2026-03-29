import { useState, useEffect } from 'react';
import { CharacterResponse } from '@/services/characters.types';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, DynamicIcon } from '@/shared/ui';
import { Sword, Zap, Shield, Repeat, Package, Activity, Dices, Plus, Minus, RotateCcw, Search } from 'lucide-react';
import { ACOES_COMBATE } from '@/data';
import { DiceRoller } from '@/shared/components/DiceRoller';
import { getItemById } from '@/services/items.service';
import { getPowerById } from '@/services/powers.service';
import type { ItemResponse, WeaponItemResponse, PoderResponse } from '@/services/types';

interface AcoesTabProps {
  character: CharacterResponse;
}

export function AcoesTab({ character }: AcoesTabProps) {
  const [detailedItems, setDetailedItems] = useState<Record<string, ItemResponse>>({});
  const [detailedPowers, setDetailedPowers] = useState<Record<string, PoderResponse>>({});

  // Contadores locais de turno
  const [actions, setActions] = useState(0);
  const [movement, setMovement] = useState(0);

  // Busca e Filtro de Ações de Combate
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [rollingAction, setRollingAction] = useState<{
    name: string;
    damage?: string;
    modifier: number;
    damageModifier?: number;
    critMargin?: number;
    critMultiplier?: number;
    efficiencyBonus?: number;
  } | null>(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      const itemIds = character.equipment.hands.map(i => i.itemId);
      const uniqueIds = Array.from(new Set(itemIds));

      const newDetails: Record<string, ItemResponse> = { ...detailedItems };
      let changed = false;

      for (const id of uniqueIds) {
        if (!newDetails[id]) {
          try {
            const detail = await getItemById(id);
            newDetails[id] = detail;
            changed = true;
          } catch (err) {
            console.error(`Erro ao buscar item ${id}`, err);
          }
        }
      }

      if (changed) {
        setDetailedItems(newDetails);
      }
    };

    fetchItemDetails();
  }, [character.equipment.hands]);

  useEffect(() => {
    const fetchPowerDetails = async () => {
      const powerIds = character.powers.map(p => p.powerId);
      const uniqueIds = Array.from(new Set(powerIds));

      const newDetails: Record<string, PoderResponse> = { ...detailedPowers };
      let changed = false;

      for (const id of uniqueIds) {
        if (!newDetails[id]) {
          try {
            const detail = await getPowerById(id);
            newDetails[id] = detail;
            changed = true;
          } catch (err) {
            console.error(`Erro ao buscar poder ${id}`, err);
          }
        }
      }

      if (changed) {
        setDetailedPowers(newDetails);
      }
    };

    fetchPowerDetails();
  }, [character.powers]);

  // Filtra itens e poderes que seriam exibidos como ações
  const equippedPowers = character.powers.filter(p => p.isEquipped);
  const equippedItems = character.equipment.hands;

  const filteredCombatActions = ACOES_COMBATE.filter(acao => {
    const matchesSearch = acao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acao.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || acao.tipo === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">
      {/* ─── Gerenciamento de Turno ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md bg-white dark:bg-gray-900 overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between text-gray-500 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-red-500" />
                Ações de Turno
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full hover:bg-red-50 p-0 flex items-center justify-center transition-transform hover:rotate-180 duration-500" onClick={() => { setActions(1); setMovement(1); }} title="Reiniciar Turno">
                <RotateCcw className="w-10 h-10 text-red-500" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-around py-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Ação Padrão</span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg border-red-100 p-0 flex items-center justify-center" onClick={() => setActions(Math.max(0, actions - 1))}>
                  <Minus className="w-4 h-4 text-red-500" />
                </Button>
                <span className="text-3xl font-black text-red-600 w-8 text-center">{actions}</span>
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg border-red-100 p-0 flex items-center justify-center" onClick={() => setActions(actions + 1)}>
                  <Plus className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Movimento</span>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg border-emerald-100 p-0 flex items-center justify-center" onClick={() => setMovement(Math.max(0, movement - 1))}>
                  <Minus className="w-4 h-4 text-emerald-500" />
                </Button>
                <span className="text-3xl font-black text-emerald-600 w-8 text-center">{movement}</span>
                <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg border-emerald-100 p-0 flex items-center justify-center" onClick={() => setMovement(movement + 1)}>
                  <Plus className="w-4 h-4 text-emerald-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-900 border-l-4 border-l-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-blue-500" />
              Recursos / Reações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Inspiração</span>
              </div>
              <span className="text-lg font-black text-amber-600">{character.inspiration}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Reação / Rodada</span>
              </div>
              <span className="text-lg font-black text-blue-600">1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Ações Ativas (Itens e Poderes) ─────────────────────────────── */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-wider">
                <Package className="w-4 h-4 text-indigo-500" />
                Equipamentos em Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equippedItems.length > 0 ? equippedItems.map((item, idx) => {
                  const itemDetail = detailedItems[item.itemId] as WeaponItemResponse | undefined;

                  return (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 group hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-lg bg-white dark:bg-gray-900 border-[0.5px] border-gray-200 dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden">
                          {itemDetail?.icone ? (
                            <DynamicIcon name={itemDetail.icone} className="w-7 h-7 text-gray-400 group-hover:text-purple-500 transition-colors" />
                          ) : (
                            <Sword className="w-7 h-7 text-gray-400 group-hover:text-purple-500 transition-colors" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 italic">
                            {itemDetail?.nome || item.itemId}
                          </h4>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                            {itemDetail?.danos?.map(d => d.dado).join(' + ') || 'Arma Atacante'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-white dark:bg-gray-900 border-none shadow-sm">Padrão</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-[10px] font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1 active:scale-95"
                          onClick={() => {
                            const escalonamentoBase = itemDetail?.atributoEscalonamento || itemDetail?.danos?.[0]?.base || 'FISICA';
                            const escalonamento = escalonamentoBase.toUpperCase();
                            const map: Record<string, keyof CharacterResponse['attributes']> = { 'FOR': 'strength', 'DES': 'dexterity', 'CON': 'constitution', 'INT': 'intelligence', 'SAB': 'wisdom', 'CAR': 'charisma', 'FISICA': character.attributes.keyPhysical, 'MENTAL': character.attributes.keyMental };
                            const attrKey = map[escalonamento] || character.attributes.keyPhysical || 'strength';
                            const mod = (character.attributes[attrKey] as any)?.rollModifier || 0;

                            setRollingAction({
                              name: itemDetail?.nome || 'Ataque',
                              damage: itemDetail?.danos?.map(d => d.dado).join(' + '),
                              modifier: mod,
                              damageModifier: mod,
                              critMargin: itemDetail?.critMargin,
                              critMultiplier: itemDetail?.critMultiplier,
                              efficiencyBonus: character.efficiencyBonus
                            });
                          }}
                        >
                          <Dices className="w-4 h-4" /> Atacar
                        </Button>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-gray-500 italic py-2">Nenhuma arma equipada.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-purple-500" />
                Poderes Equipados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equippedPowers.filter(p => {
                  const detail = detailedPowers[p.powerId];
                  return (detail?.parametros?.acao || 0) > 0 && (detail?.parametros?.acao !== 5);
                }).length > 0 ? (
                  character.powers
                    .filter(p => {
                      const detail = detailedPowers[p.powerId];
                      return p.isEquipped && (detail?.parametros?.acao || 0) > 0 && (detail?.parametros?.acao !== 5);
                    })
                    .map((power) => {
                      const powerDetail = detailedPowers[power.powerId];
                      return (
                        <div key={power.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 group hover:border-purple-500/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-lg bg-white dark:bg-gray-900 border-[0.5px] border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center overflow-hidden">
                              {powerDetail?.icone ? (
                                <DynamicIcon name={powerDetail.icone} className="w-7 h-7 text-purple-400" />
                              ) : (
                                <Zap className="w-7 h-7 text-purple-400" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                {powerDetail?.nome || power.powerId}
                              </h4>
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Poder Ativo</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-white dark:bg-gray-900 border-none shadow-sm">
                              {powerDetail?.parametros?.acao === 1 ? 'Padrão' : powerDetail?.parametros?.acao === 2 ? 'Livre' : 'Varia'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-[10px] font-bold border-purple-200 text-purple-600 hover:bg-purple-50 gap-1 active:scale-95"
                              onClick={() => {
                                const key = character.attributes.keyMental || 'intelligence';
                                const attr = character.attributes[key];
                                const mod = attr.rollModifier;
                                setRollingAction({
                                  name: powerDetail?.nome || power.powerId,
                                  modifier: mod,
                                  efficiencyBonus: character.efficiencyBonus
                                });
                              }}
                            >
                              <Zap className="w-4 h-4" /> Usar
                            </Button>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm text-gray-500 italic py-2">Nenhum poder ativo equipado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Efeitos Passivos e Ações Gerais ────────────────────────────── */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-gray-900 border-l-4 border-l-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-emerald-500" />
                Efeitos Passivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Poderes Passivos */}
                {character.powers
                  .filter(p => {
                    const detail = detailedPowers[p.powerId];
                    return p.isEquipped && (detail?.parametros?.acao === 5 || detail?.parametros?.duracao === 4);
                  })
                  .map(p => {
                    const detail = detailedPowers[p.powerId];
                    return (
                      <div key={p.id} className="p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 group">
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded-lg bg-white dark:bg-gray-900 border-[0.5px] border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center overflow-hidden">
                            {detail?.icone ? (
                              <DynamicIcon name={detail.icone} className="w-7 h-7 text-emerald-500" />
                            ) : (
                              <Shield className="w-7 h-7 text-emerald-500" />
                            )}
                          </div>
                          <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-100">{detail?.nome || p.powerId}</h4>
                        </div>
                        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 pl-7 italic line-clamp-2">{detail?.descricao}</p>
                      </div>
                    );
                  })
                }

                {/* Condições e Estados */}
                {character.conditions.length > 0 ? character.conditions.map((cond) => (
                  <div key={cond} className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <div>
                      <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-100">{cond}</h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold tracking-tighter">Condição Ativa</p>
                    </div>
                  </div>
                )) : null}

                {character.powers.filter(p => {
                  const detail = detailedPowers[p.powerId];
                  return p.isEquipped && (detail?.parametros?.acao === 5 || detail?.parametros?.duracao === 4);
                }).length === 0 && character.conditions.length === 0 && (
                    <p className="text-sm text-gray-500 italic py-2">Nenhum efeito passivo relevante.</p>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white dark:bg-gray-900 flex flex-col h-[500px]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-wider">
                  <Sword className="w-4 h-4 text-gray-500" />
                  Guia de Ações
                </CardTitle>
              </div>
              <div className="relative group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar regra ou ação..."
                  className="w-full pl-8 pr-4 py-1.5 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
                {['ALL', 'PADRAO', 'MOVIMENTO', 'COMPLETA', 'REACAO', 'LIVRE', 'REGRA'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${selectedCategory === cat
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    {cat === 'ALL' ? 'Tudo' : cat === 'PADRAO' ? 'Padrão' : cat === 'COMPLETA' ? 'Completa' : cat === 'REACAO' ? 'Reação' : cat === 'LIVRE' ? 'Livre' : cat === 'REGRA' ? 'Regras' : 'Mover'}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar pt-0 mt-2">
              <div className="space-y-3 pr-1">
                {filteredCombatActions.length > 0 ? filteredCombatActions.map((action) => (
                  <div key={action.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border-[0.5px] border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-black text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">{action.nome}</h4>
                      <Badge variant="secondary" className={`text-[8px] font-black uppercase px-1.5 py-0 border-none ${action.tipo === 'PADRAO' ? 'bg-red-50 text-red-600' :
                          action.tipo === 'MOVIMENTO' ? 'bg-emerald-50 text-emerald-600' :
                            action.tipo === 'COMPLETA' ? 'bg-amber-50 text-amber-600' :
                              action.tipo === 'REACAO' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {action.tipo}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed italic">{action.descricao}</p>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-50">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs italic">Nenhuma regra encontrada.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DiceRoller
        isOpen={!!rollingAction}
        onClose={() => setRollingAction(null)}
        label={rollingAction?.name || ''}
        modifier={rollingAction?.modifier || 0}
        damageFormula={rollingAction?.damage}
        damageModifier={rollingAction?.damageModifier}
        critMargin={rollingAction?.critMargin}
        critMultiplier={rollingAction?.critMultiplier}
        efficiencyBonus={rollingAction?.efficiencyBonus}
        initialApplyEfficiency={true}
        modifierLabel="Bônus de Ataque"
        rollButtonLabel="Atacar"
      />
    </div>
  );
}
