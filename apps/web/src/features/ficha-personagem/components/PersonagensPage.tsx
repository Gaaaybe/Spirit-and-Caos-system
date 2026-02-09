/**
 * Página Principal de Personagens
 * Integra Biblioteca + Editor com controle de estado
 */

import { useState } from 'react';
import { BibliotecaPersonagens } from './BibliotecaPersonagens';
import { EditorPersonagem } from './EditorPersonagem';

type ViewMode = 'biblioteca' | 'editor' | 'criar';

export function PersonagensPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('biblioteca');
  const [editandoId, setEditandoId] = useState<string | undefined>();

  const handleEdit = (id: string) => {
    setEditandoId(id);
    setViewMode('editor');
  };

  const handleCreateNew = () => {
    setEditandoId(undefined);
    setViewMode('criar');
  };

  const handleBackToBiblioteca = () => {
    setEditandoId(undefined);
    setViewMode('biblioteca');
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Personagens</h1>
        <p className="text-gray-600">Gerencie seus personagens de Spirit & Caos</p>
      </div>

      {viewMode === 'biblioteca' && (
        <BibliotecaPersonagens onEdit={handleEdit} onCreateNew={handleCreateNew} />
      )}

      {(viewMode === 'editor' || viewMode === 'criar') && (
        <EditorPersonagem
          personagemId={editandoId}
          onSave={handleBackToBiblioteca}
          onCancel={handleBackToBiblioteca}
        />
      )}
    </div>
  );
}
