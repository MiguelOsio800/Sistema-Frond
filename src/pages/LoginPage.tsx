import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ConfigContext } from '../../contexts/ConfigContext';
import LoginView from '../../components/auth/LoginView';
import { Navigate } from 'react-router-dom';
import { useToast } from '../../components/ui/ToastProvider';

const LoginPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const config = useContext(ConfigContext);
    const { addToast } = useToast(); // <-- 2. Obtenemos la función para mostrar notificaciones

    // Ya no necesitamos un estado de error local
    // const [error, setError] = useState<string | null>(null);

    if (!auth || !config) {
        throw new Error("LoginPage debe ser usado dentro de los proveedores de contexto (Auth y Config)");
    }

    const handleApiLogin = async (username: string, password: string, rememberMe: boolean) => {
        try {
            await auth.login(username, password);
            if (rememberMe) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }
        } catch (err) {
            // 3. En lugar de setError, llamamos a addToast
            addToast({
                type: 'error',
                title: 'Error de Autenticación',
                message: 'Usuario o contraseña incorrectos.'
            });
        }
    };
    
    if (auth.user) {
        return <Navigate to="/dashboard" />;
    }

    // 4. Eliminamos el div que mostraba el error feo
    return (
        <LoginView
            onLogin={handleApiLogin}
            users={[]}
            companyInfo={config.companyInfo}
        />
    );
};

export default LoginPage;