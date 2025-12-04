import { useMemo } from 'react';
import { Zap, Package, Globe, Sparkles, Copy } from 'lucide-react';
import { Modal, ModalFooter, Button, Badge, Card, CardContent, toast } from '../../../shared/ui';
import { Poder, ModificacaoAplicada } from '../regras/calculadoraCusto';
import { MODIFICACOES, Modificacao } from '../../../data';
import { useCustomItems } from '../../../shared/hooks';
import type { DetalhesPoder } from '../types';

interface ResumoPoderProps {
  isOpen: boolean;
  onClose: () => void;
  poder: Poder;
  detalhes: DetalhesPoder;
}

export function ResumoPoder({ isOpen, onClose, poder, detalhes }: ResumoPoderProps) {
  const { customModificacoes } = useCustomItems();
  const todasModificacoes = useMemo(
    () => [...MODIFICACOES, ...customModificacoes],
    [customModificacoes]
  );

  const formatarModificacaoString = (mod: ModificacaoAplicada, modBase?: Modificacao) => {
    let modTexto = modBase?.nome || mod.modificacaoBaseId;
    
    // Calcular custo da modificação (incluindo configuração)
    const grauMod = mod.grauModificacao || 1;
    let custoPorGrauMod = modBase?.custoPorGrau || 0;
    let custoFixoMod = modBase?.custoFixo || 0;
    
    // Adiciona modificador de configuração se houver
    if (mod.parametros?.configuracaoSelecionada && modBase?.configuracoes) {
      const config = modBase.configuracoes.opcoes.find(c => c.id === mod.parametros?.configuracaoSelecionada);
      if (config) {
        if (config.modificadorCusto !== undefined) {
          custoPorGrauMod += config.modificadorCusto;
        }
        if (config.modificadorCustoFixo !== undefined) {
          custoFixoMod += config.modificadorCustoFixo;
        }
      }
    }
    
    const custoMod = custoFixoMod + (custoPorGrauMod * grauMod);
    
    if (mod.grauModificacao && mod.grauModificacao > 1) {
      modTexto += ` ${mod.grauModificacao}`;
    }

    if (custoMod !== 0) {
      modTexto += ` ${custoMod > 0 ? '+' : ''}${custoMod}`;
    }
    
    // Adiciona nome da configuração se houver
    if (mod.parametros?.configuracaoSelecionada && modBase?.configuracoes) {
      const config = modBase.configuracoes.opcoes.find(c => c.id === mod.parametros?.configuracaoSelecionada);
      if (config) {
        modTexto += ` (${config.nome})`;
      }
    }
    
    if (mod.parametros?.descricao) {
      modTexto += ` (${mod.parametros.descricao})`;
    }
    
    if (mod.parametros?.opcao) {
      modTexto += ` [${mod.parametros.opcao}]`;
    }
    
    return modTexto;
  };

  const gerarTextoResumo = () => {
    let texto = `=== ${poder.nome} ===\n\n`;
    
    if (poder.descricao) {
      texto += `${poder.descricao}\n\n`;
    }
    
    texto += `CUSTO TOTAL: ${detalhes.custoPdATotal} PdA\n`;
    texto += `PE TOTAL: ${detalhes.peTotal} PE\n`;
    texto += `ESPAÇOS TOTAIS: ${detalhes.espacosTotal} Espaços\n\n`;
    
    // Modificações Globais
    if (poder.modificacoesGlobais.length > 0) {
      texto += `MODIFICAÇÕES GLOBAIS:\n`;
      poder.modificacoesGlobais.forEach(mod => {
        const modBase = todasModificacoes.find(m => m.id === mod.modificacaoBaseId);
        const modTexto = formatarModificacaoString(mod, modBase);
        texto += `- ${modTexto}\n`;
      });
      texto += `\n`;
    }
    
    // Efeitos
    texto += `EFEITOS:\n`;
    detalhes.efeitosDetalhados.forEach((efDet) => {
      if (!efDet) return;
      const ef = efDet;
      
      texto += `\n${ef.efeitoBase.nome} - Grau ${ef.efeito.grau} (${ef.custoTotal} PdA)\n`;
      
      // Input customizado se houver
      if (ef.efeito.inputCustomizado) {
        texto += `  Especificação: ${ef.efeito.inputCustomizado}\n`;
      }
      
      // Configuração selecionada
      if (ef.efeito.configuracaoSelecionada && ef.efeitoBase.configuracoes) {
        const config = ef.efeitoBase.configuracoes.opcoes.find(c => c.id === ef.efeito.configuracaoSelecionada);
        if (config) {
          texto += `  Configuração: ${config.nome}\n`;
        }
      }

      if (ef.efeito.modificacoesLocais.length > 0) {
        texto += `  Modificações:\n`;
        ef.efeito.modificacoesLocais.forEach((mod) => {
          const modBase = todasModificacoes.find(m => m.id === mod.modificacaoBaseId);
          const modTexto = formatarModificacaoString(mod, modBase);
          texto += `    - ${modTexto}\n`;
        });
      }
    });
    
    return texto;
  };

  const copiarResumo = () => {
    const texto = gerarTextoResumo();
    navigator.clipboard.writeText(texto);
    toast.success('Resumo copiado para a área de transferência!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Premium com Gradiente */}
        <div className="relative -mt-6 -mx-6 p-8 bg-gradient-to-br from-espirito-600 to-espirito-800 dark:from-espirito-700 dark:to-espirito-900 text-white rounded-t-lg overflow-hidden">
          {/* Padrão decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-8 h-8 text-yellow-300" />
                  <h2 className="text-3xl font-bold">{poder.nome}</h2>
                </div>
                {poder.descricao && (
                  <p className="text-espirito-100 text-lg max-w-2xl leading-relaxed">
                    {poder.descricao}
                  </p>
                )}
              </div>
              
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                <p className="text-espirito-200 text-sm mb-1">Custo Total</p>
                <p className="text-4xl font-bold text-yellow-300">{detalhes.custoPdATotal}</p>
                <p className="text-xs text-espirito-200">PdA</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-espirito-200 text-xs mb-1">Efeitos</p>
                <p className="text-2xl font-bold">{poder.efeitos.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-espirito-200 text-xs mb-1">Modificações</p>
                <p className="text-2xl font-bold">
                  {poder.modificacoesGlobais.length + poder.efeitos.reduce((acc, ef) => acc + ef.modificacoesLocais.length, 0)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-espirito-200 text-xs mb-1 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" /> PE Total
                </p>
                <p className="text-2xl font-bold">{detalhes.peTotal}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-espirito-200 text-xs mb-1 flex items-center justify-center gap-1">
                  <Package className="w-3 h-3" /> Espaços
                </p>
                <p className="text-2xl font-bold">{detalhes.espacosTotal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modificações Globais */}
        {poder.modificacoesGlobais.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                Modificações Globais
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {poder.modificacoesGlobais.map((mod) => {
                const modBase = todasModificacoes.find(m => m.id === mod.modificacaoBaseId);
                return (
                  <Badge key={mod.id} variant="info" size="lg" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {formatarModificacaoString(mod, modBase)}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de Efeitos */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-espirito-600 dark:text-espirito-400" />
            Efeitos Detalhados
          </h3>
          
          {detalhes.efeitosDetalhados.map((efDet) => {
            if (!efDet) return null;
            const { efeito, efeitoBase, custoTotal } = efDet;

            return (
              <Card key={efeito.id} className="overflow-hidden border-l-4 border-l-espirito-500">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg text-espirito-700 dark:text-espirito-300">
                          {efeitoBase.nome}
                        </h4>
                        <Badge variant="secondary">Grau {efeito.grau}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {efeitoBase.descricao}
                      </p>
                      {efeito.inputCustomizado && (
                        <p className="text-sm font-medium text-espirito-600 dark:text-espirito-400 mt-1">
                          Especificação: {efeito.inputCustomizado}
                        </p>
                      )}
                      {efeito.configuracaoSelecionada && efeitoBase.configuracoes && (
                        <p className="text-sm font-medium text-espirito-600 dark:text-espirito-400 mt-1">
                          Configuração: {efeitoBase.configuracoes.opcoes.find(c => c.id === efeito.configuracaoSelecionada)?.nome}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-espirito-600 dark:text-espirito-400">
                        {custoTotal}
                      </span>
                      <span className="text-xs text-gray-500 block">PdA</span>
                    </div>
                  </div>

                  {/* Modificações Locais */}
                  {efeito.modificacoesLocais.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Modificações</p>
                      <div className="flex flex-wrap gap-2">
                        {efeito.modificacoesLocais.map((mod) => {
                          const modBase = todasModificacoes.find(m => m.id === mod.modificacaoBaseId);
                          return (
                            <Badge key={mod.id} variant="secondary" className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {formatarModificacaoString(mod, modBase)}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={copiarResumo} className="w-full sm:w-auto">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Resumo
        </Button>
        <Button onClick={onClose} className="w-full sm:w-auto">
          Fechar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
