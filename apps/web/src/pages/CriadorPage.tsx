import { useState } from 'react';
import { Package, Zap } from 'lucide-react';
import { CriadorDePoder } from '../features/criador-de-poder';
import { CriadorDeItem } from '../features/criador-de-item';
import { ModalAtalhos } from '../features/criador-de-poder/components/ModalAtalhos';
import { Button } from '../shared/ui';
import { useFirstVisit, useLocalStorage } from '../shared/hooks';

export function CriadorPage() {
  const [aba, setAba] = useLocalStorage<'poderes' | 'itens'>('criador-aba-ativa', 'poderes');
  const [mostrarAtalhos, setMostrarAtalhos] = useState(false);
  const [isFirstVisit, markAsVisited] = useFirstVisit('atalhos-visto');
  const abaAtiva = aba === 'itens' ? 'itens' : 'poderes';

  const abrirAtalhos = () => {
    setMostrarAtalhos(true);
    if (isFirstVisit) {
      markAsVisited();
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 flex gap-1">
        <button
          onClick={() => setAba('poderes')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            abaAtiva === 'poderes'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" /> Poderes
        </button>
        <button
          onClick={() => setAba('itens')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            abaAtiva === 'itens'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Package className="w-4 h-4" /> Itens
        </button>
      </div>

      {/* Botão de atalhos flutuante */}
      <div className={`fixed bottom-6 right-6 z-30 ${abaAtiva !== 'poderes' ? 'hidden' : ''}`}>
        <div className="relative">
          <Button 
            onClick={abrirAtalhos} 
            variant="ghost" 
            title="Atalhos de teclado (?)" 
            aria-label="Atalhos de teclado"
            className="shadow-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          >
            ⌨️
          </Button>
          {isFirstVisit && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-espirito-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-espirito-500"></span>
            </span>
          )}
        </div>
      </div>

      {abaAtiva === 'poderes' ? <CriadorDePoder /> : <CriadorDeItem />}
      
      <ModalAtalhos
        isOpen={mostrarAtalhos}
        onClose={() => setMostrarAtalhos(false)}
      />
    </div>
  );
}
