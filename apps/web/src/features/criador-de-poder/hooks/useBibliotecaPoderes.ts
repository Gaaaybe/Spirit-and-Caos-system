import { useLocalStorage } from '../../../shared/hooks';
import { Poder } from '../regras/calculadoraCusto';
import type { PoderSalvo } from '../types';
import { hydratePoder, formatarMensagensHydration, SCHEMA_VERSION, type PoderComVersion } from '../utils/poderHydration';

export function useBibliotecaPoderes() {
  const [poderes, setPoderes] = useLocalStorage<PoderSalvo[]>('biblioteca-poderes', []);

  // Salvar ou atualizar um poder
  const salvarPoder = (poder: Poder) => {
    const agora = new Date().toISOString();
    
    // Adiciona versão do schema ao salvar
    const poderComVersion = { ...poder, schemaVersion: SCHEMA_VERSION };
    
    // Verifica se já existe um poder com esse ID na biblioteca
    const poderExistente = poderes.find((p: PoderSalvo) => p.id === poder.id);
    
    if (poderExistente) {
      // Atualiza o poder existente
      setPoderes((prev: PoderSalvo[]) => 
        prev.map((p: PoderSalvo) => 
          p.id === poder.id 
            ? { ...poderComVersion, id: poder.id, dataCriacao: p.dataCriacao, dataModificacao: agora }
            : p
        )
      );
      return { ...poderComVersion, dataCriacao: poderExistente.dataCriacao, dataModificacao: agora } as PoderSalvo;
    } else {
      // Cria um novo poder
      const poderSalvo: PoderSalvo = {
        ...poderComVersion,
        id: poder.id || Date.now().toString(),
        dataCriacao: agora,
        dataModificacao: agora,
      };

      setPoderes((prev: PoderSalvo[]) => [...prev, poderSalvo]);
      return poderSalvo;
    }
  };

  // Atualizar um poder existente
  const atualizarPoder = (id: string, poder: Poder) => {
    setPoderes((prev: PoderSalvo[]) => 
      prev.map((p: PoderSalvo) => 
        p.id === id 
          ? { ...poder, id, dataCriacao: p.dataCriacao, dataModificacao: new Date().toISOString() }
          : p
      )
    );
  };

  // Deletar um poder
  const deletarPoder = (id: string) => {
    setPoderes((prev: PoderSalvo[]) => prev.filter((p: PoderSalvo) => p.id !== id));
  };

  // Buscar um poder por ID
  const buscarPoder = (id: string): PoderSalvo | undefined => {
    return poderes.find((p: PoderSalvo) => p.id === id);
  };

  // Buscar um poder por ID com hydration (validação e atualização automática)
  const buscarPoderComHydration = (id: string): { 
    poder: PoderSalvo | undefined; 
    hydrationInfo?: ReturnType<typeof formatarMensagensHydration>;
  } => {
    const poderSalvo = poderes.find((p: PoderSalvo) => p.id === id);
    
    if (!poderSalvo) {
      return { poder: undefined };
    }
    
    // Aplica hydration (validação e atualização)
    const result = hydratePoder(poderSalvo as PoderComVersion);
    const hydrationInfo = formatarMensagensHydration(result);
    
    // Se houve mudanças, atualiza o poder no localStorage
    if (hydrationInfo.hasIssues) {
      const agora = new Date().toISOString();
      const poderAtualizado: PoderSalvo = {
        ...result.poder,
        id: poderSalvo.id,
        dataCriacao: poderSalvo.dataCriacao,
        dataModificacao: agora,
      } as PoderSalvo;
      
      setPoderes((prev: PoderSalvo[]) => 
        prev.map((p: PoderSalvo) => 
          p.id === id ? poderAtualizado : p
        )
      );
      
      return { poder: poderAtualizado, hydrationInfo };
    }
    
    return { poder: poderSalvo };
  };

  // Duplicar um poder
  const duplicarPoder = (id: string) => {
    const poderOriginal = buscarPoder(id);
    if (!poderOriginal) return;

    const agora = new Date().toISOString();
    const poderDuplicado: PoderSalvo = {
      ...poderOriginal,
      id: Date.now().toString(),
      nome: `${poderOriginal.nome} (Cópia)`,
      dataCriacao: agora,
      dataModificacao: agora,
    };

    setPoderes((prev: PoderSalvo[]) => [...prev, poderDuplicado]);
    return poderDuplicado;
  };

  // Exportar como JSON
  const exportarPoder = (id: string) => {
    const poder = buscarPoder(id);
    if (!poder) return;

    const dataStr = JSON.stringify(poder, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${poder.nome.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Importar de JSON
  const importarPoder = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validar se é um array (biblioteca) ao invés de um poder individual
      if (Array.isArray(parsed)) {
        throw new Error('Arquivo contém uma biblioteca. Use "Importar Tudo" para bibliotecas.');
      }
      
      // Validar se tem as propriedades básicas de um poder
      if (!parsed || typeof parsed !== 'object' || !parsed.nome) {
        throw new Error('Formato de poder inválido');
      }
      
      // Aplica hydration no poder importado
      const result = hydratePoder(parsed as PoderComVersion);
      const poder = result.poder;
      const hydrationInfo = formatarMensagensHydration(result);
      
      const agora = new Date().toISOString();
      const poderImportado: PoderSalvo = {
        ...poder,
        id: Date.now().toString(),
        dataCriacao: agora,
        dataModificacao: agora,
      } as PoderSalvo;

      setPoderes((prev: PoderSalvo[]) => [...prev, poderImportado]);
      
      return { 
        poder: poderImportado, 
        hydrationInfo: hydrationInfo.hasIssues ? hydrationInfo : undefined 
      };
    } catch (error) {
      console.error('Erro ao importar poder:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('JSON inválido');
    }
  };

  // Exportar biblioteca completa
  const exportarBiblioteca = () => {
    const dataStr = JSON.stringify(poderes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `biblioteca-poderes-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Importar biblioteca completa
  const importarBiblioteca = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content);
          
          if (!Array.isArray(imported)) {
            throw new Error('Arquivo contém um poder individual. Use "Importar Poder" para poderes individuais.');
          }
          
          // Mesclar com biblioteca existente
          setPoderes(prev => {
            const merged = [...prev];
            
            imported.forEach((poder: PoderSalvo) => {
              const index = merged.findIndex(p => p.id === poder.id);
              if (index >= 0) {
                merged[index] = poder;
              } else {
                merged.push(poder);
              }
            });
            
            return merged;
          });
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  return {
    poderes,
    salvarPoder,
    atualizarPoder,
    deletarPoder,
    buscarPoder,
    buscarPoderComHydration,
    duplicarPoder,
    exportarPoder,
    importarPoder,
    exportarBiblioteca,
    importarBiblioteca,
  };
}
