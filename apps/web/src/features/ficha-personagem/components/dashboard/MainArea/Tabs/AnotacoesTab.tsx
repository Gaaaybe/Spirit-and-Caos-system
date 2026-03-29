import { Card, CardHeader, CardTitle, CardContent, Button } from '@/shared/ui';
import { StickyNote, Save } from 'lucide-react';
import { useState } from 'react';

export function AnotacoesTab() {
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="border-none shadow-md bg-white dark:bg-gray-900 h-[500px] flex flex-col">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-500 uppercase tracking-wider">
            <StickyNote className="w-4 h-4 text-yellow-500" />
            Anotações Gerais
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <textarea
            className="w-full h-full p-6 bg-transparent resize-none focus:outline-none text-gray-700 dark:text-gray-300 custom-scrollbar"
            placeholder="Escreva suas anotações aqui..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
