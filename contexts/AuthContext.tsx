import React, { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiClient from '../src/api/apiClient';
import { useToast } from '../components/ui/ToastProvider';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const checkUserSession = async () => {
            console.log("AuthContext: Verificando sesión al cargar...");
            const authTokens = localStorage.getItem('authTokens');
            if (authTokens) {
                console.log("AuthContext: Se encontraron tokens. Verificando perfil...");
                try {
                    const response = await apiClient.get('/profile/');
                    setUser(response.data);
                    console.log("AuthContext: Perfil verificado con éxito.");
                } catch (error) {
                    console.error("AuthContext: Error al verificar perfil. Limpiando tokens.", error);
                    localStorage.removeItem('authTokens');
                }
            } else {
                console.log("AuthContext: No se encontraron tokens en localStorage.");
            }
            setLoading(false);
        };
        checkUserSession();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            console.log("AuthContext: Iniciando petición de login...");
            const tokenResponse = await apiClient.post('/token/', { username, password });
            console.log("AuthContext: Petición de token exitosa. Respuesta:", tokenResponse.data);

            // --- Punto de control clave ---
            console.log("AuthContext: Intentando guardar tokens en localStorage...");
            localStorage.setItem('authTokens', JSON.stringify(tokenResponse.data));
            console.log("AuthContext: Tokens supuestamente guardados. Verifícalo en la pestaña 'Aplicación'.");
            
            const profileResponse = await apiClient.get('/profile/');
            console.log("AuthContext: Perfil obtenido con éxito.", profileResponse.data);
            const loggedInUser = profileResponse.data;
            setUser(loggedInUser);

            addToast({
                type: 'success',
                title: `¡Bienvenido, ${loggedInUser.first_name || loggedInUser.username}!`,
                message: `Ha iniciado sesión como ${loggedInUser.role?.name || 'Usuario'}.`
            });

        } catch (error) {
            console.error("AuthContext: Ocurrió un error en el proceso de login.", error);
            throw error;
        }
    };

    const logout = () => {
        addToast({ 
            type: 'info', 
            title: 'Sesión Cerrada', 
            message: 'Ha cerrado sesión exitosamente.' 
        });
        localStorage.removeItem('authTokens');
        setUser(null);
    };

    const value = { user, login, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};