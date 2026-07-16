import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axiosConfig';
import { jwtDecode } from 'jwt-decode'; // 🚀 Importación para decodificar el payload del JWT

// Interfaz del Usuario según los roles de tu backend
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'ADMIN' | 'PSICOLOGO' | 'PACIENTE';
}

// Interfaz de las funciones y estados que expone el contexto
interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Persistencia de sesión leyendo del almacenamiento local
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser) as Usuario);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // 1. Enviamos la petición POST al backend
    const { data } = await api.post<any>('/auth/login', { email, password });
    
    // 2. Extraemos el token adaptándonos a lo que responda tu NestJS
    const token = data.accessToken || data.token || data;
    
    if (!token) {
      throw new Error('No se recibió un token válido del servidor.');
    }

    // 3. Decodificamos el payload real del JWT firmado por NestJS
    const decoded: any = jwtDecode(token);

    // 4. Mapeamos las propiedades reales de tu JWT (ajustando a los nombres que envía tu backend en el Payload)
    const usuarioReal: Usuario = {
      id: decoded.sub || decoded.id || '1',
      email: decoded.email || email,
      nombre: decoded.nombre || 'Usuario',
      apellido: decoded.apellido || 'Registrado',
      rol: decoded.rol || 'PACIENTE', // Extrae dinámicamente: PACIENTE, ADMIN o PSICOLOGO
    };
    
    // 5. Guardamos de forma segura en el almacenamiento local
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuarioReal));
    
    // 6. Seteamos el estado global
    setUser(usuarioReal);
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};