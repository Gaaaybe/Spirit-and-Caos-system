import { useState, useMemo } from 'react';
import { Modificacao } from '../../../data';
import { useFavoritos } from '../../../shared/hooks';

export type OrdenacaoTipo = 'nome-asc' | 'nome-desc' | 'custo-asc' | 'custo-desc' | 'categoria';

export function useModificacaoFilter(todasModificacoes: Modificacao[]) {
  const { isFavoritoModificacao } = useFavoritos();
  
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [favoritosOnly, setFavoritosOnly] = useState(false);
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>('nome-asc');

  // Categorias únicas
  const categorias = useMemo(() => {
    const cats = new Set(todasModificacoes.map(m => m.categoria));
    return Array.from(cats).sort();
  }, [todasModificacoes]);

  // Filtrar e ordenar modificações
  const modificacoesFiltradas = useMemo(() => {
    const resultado = todasModificacoes.filter(mod => {
      const matchBusca = busca === '' ||
                         mod.nome.toLowerCase().includes(busca.toLowerCase()) ||
                         mod.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                         (mod.categoria && mod.categoria.toLowerCase().includes(busca.toLowerCase()));
      const matchTipo = !tipoFiltro || mod.tipo === tipoFiltro;
      const matchCategoria = !categoriaFiltro || mod.categoria === categoriaFiltro;
      const matchFavorito = !favoritosOnly || isFavoritoModificacao(mod.id);
      return matchBusca && matchTipo && matchCategoria && matchFavorito;
    });

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'nome-asc':
          return a.nome.localeCompare(b.nome);
        case 'nome-desc':
          return b.nome.localeCompare(a.nome);
        case 'custo-asc':
          return (Math.abs(a.custoFixo) + Math.abs(a.custoPorGrau)) - (Math.abs(b.custoFixo) + Math.abs(b.custoPorGrau));
        case 'custo-desc':
          return (Math.abs(b.custoFixo) + Math.abs(b.custoPorGrau)) - (Math.abs(a.custoFixo) + Math.abs(a.custoPorGrau));
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        default:
          return 0;
      }
    });

    return resultado;
  }, [todasModificacoes, busca, tipoFiltro, categoriaFiltro, ordenacao, favoritosOnly, isFavoritoModificacao]);

  const limparFiltros = () => {
    setBusca('');
    setTipoFiltro('');
    setCategoriaFiltro('');
  };

  return {
    busca, setBusca,
    tipoFiltro, setTipoFiltro,
    categoriaFiltro, setCategoriaFiltro,
    favoritosOnly, setFavoritosOnly,
    ordenacao, setOrdenacao,
    modificacoesFiltradas,
    categorias,
    limparFiltros
  };
}
