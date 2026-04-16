import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types/User';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.perfil !== requiredRole) {
    // Redirecionar para o dashboard apropriado se tentar acessar rota de outro tipo
    if (user?.perfil === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/voluntario/eventos" replace />;
    }
  }

  return children;
}
