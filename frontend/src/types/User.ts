export type UserRole = 'ADMIN' | 'VOLUNTARIO';

export interface User {
  id: string;
  email: string;
  nome: string;
  perfil: UserRole;
  ativo: boolean;
}

export interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVoluntario: boolean;
}
