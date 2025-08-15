import React, { ReactNode } from 'react';
import ToastProvider from '../components/ui/ToastProvider';
import { AuthProvider } from './AuthContext';
import { DataProvider } from './DataContext';
import { ConfigProvider } from './ConfigContext';
import { SystemProvider } from './SystemContext';

const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <ToastProvider>
            <SystemProvider>
                <AuthProvider>
                    <ConfigProvider>
                        <DataProvider>
                            {children}
                        </DataProvider>
                    </ConfigProvider>
                </AuthProvider>
            </SystemProvider>
        </ToastProvider>
    );
};

export default AppProviders;
