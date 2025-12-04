import { ReactNode } from 'react';
import { Button } from './Button';
import { Package, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  tips?: string[];
}

export function EmptyState({
  icon = <Package className="w-16 h-16 text-gray-400" />,
  title,
  description,
  action,
  secondaryAction,
  tips
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="text-6xl mb-4 animate-bounce flex justify-center">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {action && (
            <Button onClick={action.onClick} variant="primary">
              {action.icon && <span className="mr-2 flex items-center">{action.icon}</span>}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.icon && <span className="mr-2 flex items-center">{secondaryAction.icon}</span>}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className="w-full max-w-md mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Dicas:
            </p>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
