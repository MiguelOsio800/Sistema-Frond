

import React from 'react';
import { Page, CompanyInfo } from '../../types';
import { NAV_ITEMS } from '../../constants';
import { MenuIcon } from '../icons/Icons';
import CurrencyDisplay from '../ui/CurrencyDisplay';

interface HeaderProps {
    currentPage: Page;
    onToggleSidebar: () => void;
    companyInfo: CompanyInfo;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onToggleSidebar, companyInfo }) => {
    
    const getPageTitle = () => {
        if (currentPage === 'edit-invoice') return 'Editar Factura';
        if (currentPage === 'report-detail') return 'Detalle de Reporte';
        return NAV_ITEMS.find(item => item.id === currentPage)?.label || 'Dashboard';
    }
    const pageTitle = getPageTitle();

    return (
        <header className="flex items-center justify-between h-20 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center">
                {/* Hamburger Menu Button */}
                <button 
                    onClick={onToggleSidebar} 
                    className="lg:hidden mr-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    aria-label="Open sidebar"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white truncate">{pageTitle}</h1>
            </div>
            <div className="flex items-center space-x-4">
                 <CurrencyDisplay bcvRate={companyInfo.bcvRate} />
            </div>
        </header>
    );
};

export default Header;