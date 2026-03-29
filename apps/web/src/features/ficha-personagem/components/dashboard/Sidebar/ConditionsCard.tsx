import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/ui';
import { AlertTriangle, Info } from 'lucide-react';


interface ConditionsCardProps {
  conditions: string[];
}

export function ConditionsCard({ conditions }: ConditionsCardProps) {
  return (
    <Card className="border-none shadow-md bg-white dark:bg-gray-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-bold flex items-center gap-2 text-gray-500 uppercase tracking-widest">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Condições e Estados
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
          {conditions.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-gray-400 italic">
              <Info className="w-3 h-3 text-gray-400" />
              Nenhuma condição ativa
            </div>
          ) : (
            conditions.map((condition) => (
              <Badge key={condition} variant="outline" className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px] px-2 py-0.5">
                {condition}
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
