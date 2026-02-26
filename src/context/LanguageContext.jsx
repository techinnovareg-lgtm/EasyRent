import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext({});

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};

// Fixed exchange rate for demonstration (1 USD = 3.8 PEN)
const EXCHANGE_RATE = 3.8;

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('easyrent-lang') || 'es';
    });

    useEffect(() => {
        localStorage.setItem('easyrent-lang', language);
    }, [language]);

    const t = (path, params = {}) => {
        const keys = path.split('.');
        let result = translations[language];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path;
            }
        }

        if (typeof result === 'string') {
            Object.entries(params).forEach(([key, val]) => {
                result = result.replace(`{${key}}`, val);
            });
        }

        return result;
    };

    const formatCurrency = (amount, forcePEN = false) => {
        const value = Number(amount) || 0;
        const targetLang = language === 'es' ? 'es-PE' : 'en-US';
        const targetCurrency = (!forcePEN && language === 'en') ? 'USD' : 'PEN';

        // If converting to USD, divide by exchange rate
        const finalValue = (targetCurrency === 'USD') ? (value / EXCHANGE_RATE) : value;

        return new Intl.NumberFormat(targetLang, {
            style: 'currency',
            currency: targetCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(finalValue);
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'es' ? 'en' : 'es');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage, formatCurrency, exchangeRate: EXCHANGE_RATE }}>
            {children}
        </LanguageContext.Provider>
    );
}
