import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user } = useUser()
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    console.log(storedUser)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log(!parsedUser)
        if (!parsedUser) navigate("/login");

      } catch {
        localStorage.removeItem('currentUser');
        navigate("/login")
      }
    } else navigate("/login")
  }, [])





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
