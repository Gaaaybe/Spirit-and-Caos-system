import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../shared/ui';
import { CharacterSheetDashboard } from '../features/ficha-personagem';

export function CharacterSheetDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Link to="/personagens">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
            <ChevronLeft className="w-4 h-4" /> Voltar para lista
          </Button>
        </Link>
      </div>
      
      <CharacterSheetDashboard characterId={id} />
    </div>
  );
}
