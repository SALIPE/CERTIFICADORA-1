import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { post } from '../services/WebService';
import { User, UserContextType } from '../types/User';

const URI = "http://localhost:5000/api"

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuário do localStorage ao montar
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    try {
      const response = await post(`${URI}/auth/login`,
        { email, senha: password });
      let token = response.token;
      let user: User = response.usuario;
      setUser(user);

      localStorage.setItem('user', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user.perfil;
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    }
  };

  const register = (nome: string, email: string, password: string) => {
    // Validações básicas
    if (!nome || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (!email.includes('@')) {
      throw new Error('Email inválido');
    }

    // Simular verificação de email já registrado
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.some((u: User) => u.email === email)) {
      throw new Error('Email já registrado');
    }

    // Criar novo voluntário
    const newUser: User = {
      id: Date.now().toString(),
      email,
      nome,
      perfil: 'VOLUNTARIO',
      ativo: true,
    };

    // Salvar na lista de usuários
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    // Fazer login automático
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value: UserContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.perfil === 'ADMIN' || false,
    isVoluntario: user?.perfil === 'VOLUNTARIO' || false,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider');
  }
  return context;
};
