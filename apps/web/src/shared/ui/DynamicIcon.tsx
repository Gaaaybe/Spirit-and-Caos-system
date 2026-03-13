import type { HTMLAttributes } from 'react';

interface DynamicIconProps extends HTMLAttributes<HTMLImageElement> {
  name: string;
}

function isUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
}

/**
 * Renderiza apenas ícones baseados em link (URL absoluta ou caminho relativo).
 */
export function DynamicIcon({ name, className, ...props }: DynamicIconProps) {
  if (!isUrl(name)) return null;

  return (
    <img
      src={name}
      alt=""
      className={className as string}
      style={{ display: 'block', objectFit: 'cover', width: '100%', height: '100%' }}
      {...props}
    />
  );
}
