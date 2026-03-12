import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

function isUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
}

/**
 * Renderiza um ícone Lucide pelo nome (ex: "Sword", "Flame") ou uma imagem por URL.
 * Retorna null se o nome não corresponder a nenhum ícone Lucide e não for URL.
 */
export function DynamicIcon({ name, className, ...props }: DynamicIconProps) {
  if (isUrl(name)) {
    return (
      <img
        src={name}
        alt=""
        className={className as string}
        style={{ display: 'block', objectFit: 'cover', width: '100%', height: '100%' }}
      />
    );
  }

  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!Icon) return null;
  return <Icon className={className} {...props} />;
}
