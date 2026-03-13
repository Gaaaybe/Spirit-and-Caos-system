import { Copy, FileText, Gem, Package, Shield, Sword, Eye, Sparkles, BookOpen } from 'lucide-react';
import { Button, Card, CardContent, Modal, ModalFooter, toast, DynamicIcon } from '@/shared/ui';
import { DOMINIOS } from '@/data';
import type { AcervoResponse, DomainName, PoderResponse } from '@/services/types';

interface ResumoItemProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: string;
  nome: string;
  icone?: string;
  descricao: string;
  dominio: {
    name: DomainName;
    areaConhecimento?: string;
    peculiarId?: string;
  };
  custoBase: number;
  nivelCalculado: number;
  custoRealCalculado: number;
  precoVendaCalculado: number;
  selectedPowers: PoderResponse[];
  selectedPowerArrays: AcervoResponse[];
  onOpenPowerDetails: (powerId: string) => void;
  onOpenPowerArrayDetails: (powerArrayId: string) => void;
}

function tipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    weapon: 'Arma',
    'defensive-equipment': 'Equipamento Defensivo',
    consumable: 'Consumível',
    artifact: 'Artefato',
    accessory: 'Acessório',
  };

  return labels[tipo] ?? tipo;
}

function dominioLabel(dominio: ResumoItemProps['dominio']): string {
  const base = DOMINIOS.find((d) => d.id === dominio.name)?.nome ?? dominio.name;

  if (dominio.name === 'cientifico' && dominio.areaConhecimento) {
    return `${base} - ${dominio.areaConhecimento}`;
  }

  return base;
}

export function ResumoItem({
  isOpen,
  onClose,
  tipo,
  nome,
  icone,
  descricao,
  dominio,
  custoBase,
  nivelCalculado,
  custoRealCalculado,
  precoVendaCalculado,
  selectedPowers,
  selectedPowerArrays,
  onOpenPowerDetails,
  onOpenPowerArrayDetails,
}: ResumoItemProps) {
  const itemIcon = icone?.trim() ?? '';
  const itemIconEhUrl = /^https?:\/\//i.test(itemIcon);

  const copiarResumo = () => {
    const texto = [
      `=== ${nome || 'Item sem nome'} ===`,
      `Tipo: ${tipoLabel(tipo)}`,
      `Domínio: ${dominioLabel(dominio)}`,
      `Descrição: ${descricao || 'Sem descrição'}`,
      `Custo Base: ${custoBase}`,
      `Nível: ${nivelCalculado}`,
      `Custo Real: ${custoRealCalculado}`,
      `Preço de Venda: ${precoVendaCalculado}`,
      `Poderes vinculados (${selectedPowers.length}): ${selectedPowers.map((p) => p.nome).join(', ') || '-'}`,
      `Acervos vinculados (${selectedPowerArrays.length}): ${selectedPowerArrays.map((a) => a.nome).join(', ') || '-'}`,
    ].join('\n');

    navigator.clipboard.writeText(texto);
    toast.success('Resumo do item copiado para a área de transferência.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-6">
        <div className="relative -mt-6 -mx-6 p-8 bg-gradient-to-br from-espirito-600 to-espirito-800 dark:from-espirito-700 dark:to-espirito-900 text-white rounded-t-lg overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-widest opacity-80 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Resumo do Item
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl border border-white/20 overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                {itemIcon ? (
                  itemIconEhUrl ? (
                    <img src={itemIcon} alt={nome || 'Icone do item'} className="w-full h-full object-cover" />
                  ) : (
                    <DynamicIcon name={itemIcon} className="w-full h-full" />
                  )
                ) : (
                  <Package className="w-6 h-6 text-white/80" />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-3xl font-bold">{nome || 'Item sem nome'}</h2>
                <p className="mt-2 text-sm opacity-90">{tipoLabel(tipo)} | {dominioLabel(dominio)}</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Custo Base</p>
              <p className="text-xl font-bold">{custoBase}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Nível</p>
              <p className="text-xl font-bold">{nivelCalculado}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Custo Real</p>
              <p className="text-xl font-bold">{custoRealCalculado}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500">Preço de Venda</p>
              <p className="text-xl font-bold">{precoVendaCalculado}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">Descrição</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {descricao || 'Sem descrição preenchida.'}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2 mb-3">
                <Sword className="w-4 h-4" /> Poderes Vinculados ({selectedPowers.length})
              </p>
              <div className="space-y-2">
                {selectedPowers.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum poder vinculado</p>
                ) : (
                  selectedPowers.map((power) => (
                    <button
                      key={power.id}
                      type="button"
                      onClick={() => onOpenPowerDetails(power.id)}
                      className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
                            {power.icone ? (
                              <DynamicIcon name={power.icone} className="w-full h-full" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{power.nome}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{power.descricao || 'Sem descrição.'}</p>
                            <p className="text-[11px] text-gray-500 mt-1">Efeitos: {power.effects.length}</p>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" /> Acervos Vinculados ({selectedPowerArrays.length})
              </p>
              <div className="space-y-2">
                {selectedPowerArrays.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum acervo vinculado</p>
                ) : (
                  selectedPowerArrays.map((powerArray) => (
                    <button
                      key={powerArray.id}
                      type="button"
                      onClick={() => onOpenPowerArrayDetails(powerArray.id)}
                      className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
                            {powerArray.icone ? (
                              <DynamicIcon name={powerArray.icone} className="w-full h-full" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{powerArray.nome}</p>
                            <p className="text-xs text-gray-500 line-clamp-2">{powerArray.descricao || 'Sem descrição.'}</p>
                            <p className="text-[11px] text-gray-500 mt-1">Poderes: {powerArray.powers.length}</p>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-espirito-200 dark:border-espirito-800 bg-espirito-50/60 dark:bg-espirito-900/20 p-4">
          <p className="text-sm text-espirito-800 dark:text-espirito-200 flex items-center gap-2">
            <Gem className="w-4 h-4" />
            O nível do item é calculado automaticamente pela soma dos graus de todos os efeitos dos poderes e acervos vinculados.
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={copiarResumo}>
          <Copy className="w-4 h-4 mr-2" /> Copiar Resumo
        </Button>
        <Button variant="outline" onClick={onClose}>
          <Package className="w-4 h-4 mr-2" /> Fechar
        </Button>
      </ModalFooter>
    </Modal>
  );
}