import { useState } from 'react';
import { Plus, User, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Badge, ConfirmDialog } from '@/shared/ui';
import { useCharacters } from '../hooks/useCharacters';
import { Charactermancer } from './Charactermancer';

export function CharacterSheetPage() {
  const { characters, isLoading, deleteCharacter } = useCharacters();
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const [isCharactermancerOpen, setIsCharactermancerOpen] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Meus Personagens
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie suas fichas de personagem de Spirit & Caos
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCharactermancerOpen(true)}>
          <Plus className="w-4 h-4" /> Novo Personagem
        </Button>
      </div>

      {characters.length === 0 ? (
        <EmptyState
          icon={<User className="w-16 h-16 text-gray-400" />}
          title="Nenhum personagem encontrado"
          description="Você ainda não criou nenhuma ficha de personagem."
          action={{
            label: 'Criar Primeiro Personagem',
            onClick: () => setIsCharactermancerOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card 
              key={character.id} 
              className="flex flex-col hover:border-purple-500 transition-colors cursor-pointer group"
              onClick={() => navigate(`/personagens/${character.id}`)}
            >
              <div className="flex items-start justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                    {character.art ? (
                      <img src={character.art} alt={character.narrative.identity} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
                      {character.narrative.identity}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      Nível {character.level} • Rank {character.calamityRank}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs py-0 h-5">
                        {character.spiritualPrinciple.stage === 'DIVINE' ? 'Divino' : 'Mortal'}
                      </Badge>
                      <Badge variant="default" className="text-xs py-0 h-5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {character.pda.total} PdA
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 border-y border-gray-100 dark:border-gray-800 text-sm">
                <div className="p-3 text-center border-r border-gray-100 dark:border-gray-800">
                  <div className="font-semibold text-red-600 dark:text-red-400">{character.health.currentPV} / {character.health.maxPV}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">PV</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">{character.energy.currentPE} / {character.energy.maxPE}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">PE</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 mt-auto flex justify-between items-center rounded-b-xl border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500">
                  Atualizado em {formatDate(character.updatedAt || character.createdAt)}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar">
                    <Edit3 className="w-4 h-4 text-gray-500 hover:text-purple-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20" 
                    title="Excluir"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCharacterToDelete(character.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!characterToDelete}
        title="Excluir Personagem"
        message="Tem certeza que deseja excluir esta ficha permanentemente? Esta ação não pode ser desfeita e todos os itens clonados e histórico de campanha serão perdidos."
        confirmText="Excluir Personagem"
        cancelText="Cancelar"
        icon={<ShieldAlert className="w-6 h-6 text-red-600" />}
        confirmStyle="destructive"
        onConfirm={async () => {
          if (characterToDelete) {
            await deleteCharacter(characterToDelete);
            setCharacterToDelete(null);
          }
        }}
        onCancel={() => setCharacterToDelete(null)}
      />

      <Charactermancer
        isOpen={isCharactermancerOpen}
        onClose={() => setIsCharactermancerOpen(false)}
        onSuccess={(id) => {
          // In the future this could redirect directly to the character sheet
          console.log('Personagem criado com ID:', id);
        }}
      />
    </div>
  );
}
