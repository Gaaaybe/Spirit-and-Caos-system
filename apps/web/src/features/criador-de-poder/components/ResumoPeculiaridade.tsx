import { Sparkles, Globe, Copy, Zap } from 'lucide-react';
import { Modal, ModalFooter, Button, Badge, toast, DynamicIcon } from '../../../shared/ui';
import { MarkdownText } from '../../../shared/components';
import { getThemeByDomain, PatternOverlay } from '../../../shared/utils/summary-themes';
import type { PeculiaridadeResponse } from '../../../services/types';

interface ResumoPeculiaridadeProps {
  isOpen: boolean;
  onClose: () => void;
  peculiaridade: PeculiaridadeResponse;
}

export function ResumoPeculiaridade({ isOpen, onClose, peculiaridade }: ResumoPeculiaridadeProps) {
  
  const gerarTextoResumo = () => {
    let texto = `🏺 === PECULIARIDADE: ${peculiaridade.nome} ===\n\n`;
    
    if (peculiaridade.espiritual) {
      texto += `Natureza: Espiritual\n\n`;
    } else {
      texto += `Natureza: Não Espiritual\n\n`;
    }
    
    if (peculiaridade.descricao) {
      texto += `${peculiaridade.descricao}\n`;
    }
    
    return texto;
  };

  const copiarResumo = () => {
    const texto = gerarTextoResumo();
    navigator.clipboard.writeText(texto);
    toast.success('Dados da peculiaridade copiados!');
  };

  const theme = getThemeByDomain('peculiar');
  const IconWatermark = theme.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Premium com Gradiente Dinâmico */}
        <div className={`relative -mt-6 -mx-6 p-8 bg-gradient-to-br ${theme.bgGradient} ${theme.textColor} rounded-t-lg overflow-hidden transition-colors duration-500`}>
          {/* Padrão decorativo dinâmico */}
          <PatternOverlay pattern={theme.pattern} />
          
          {/* Ícone Watermark Gigante */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
            <IconWatermark className="w-96 h-96 transform rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Ícone 80x80px */}
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl p-2 transform hover:scale-105 transition-transform">
                {peculiaridade.icone ? (
                  <DynamicIcon name={peculiaridade.icone} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Sparkles className="w-16 h-16 text-purple-100" />
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-black tracking-tight uppercase drop-shadow-md">
                    {peculiaridade.nome}
                  </h2>
                  <Badge variant="success" className="bg-green-400 text-green-950 font-black border-none px-3">Customizado</Badge>
                  {peculiaridade.espiritual && (
                    <Badge variant="info" className="bg-blue-400 text-blue-950 font-black border-none px-3">Espiritual</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-purple-100 text-sm font-medium">
                  {peculiaridade.isPublic && (
                    <span className="flex items-center gap-1.5 opacity-90">
                      <Globe className="w-4 h-4" /> Público
                    </span>
                  )}
                  <span className="opacity-70">
                    Criado em {new Date(peculiaridade.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal (Markdown de Elite) */}
        <div className="prose prose-lg dark:prose-invert max-w-none bg-gray-50/50 dark:bg-gray-900/30 p-6 sm:p-10 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner">
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
             <MarkdownText>{peculiaridade.descricao}</MarkdownText>
          </div>
        </div>

        {/* Dica técnica */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 text-purple-700 dark:text-purple-300">
          <Zap className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs">
            Esta peculiaridade pode ser vinculada a qualquer <strong>Poder</strong> ou <strong>Acervo</strong> através do domínio <strong>Peculiar</strong> no Criador.
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={copiarResumo} className="flex-1 sm:flex-none gap-2">
          <Copy className="w-4 h-4" />
          Copiar Dados
        </Button>
        <Button onClick={onClose} variant="primary" className="flex-1 sm:flex-none px-8">
          Fechar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
