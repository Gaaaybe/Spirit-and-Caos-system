import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Rota protegida: redireciona para /entrar caso o usuário não esteja autenticado.
 * Preserva a rota original em `state.from` para redirecionamento pós-login.
 */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
