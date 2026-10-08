import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import translations from "./translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {

    const [language, setLanguage] = useState(() => {
        return (
            localStorage.getItem("veassist-language") ||
            "en"
        );
    });

    useEffect(() => {
        localStorage.setItem(
            "veassist-language",
            language
        );
    }, [language]);

    const value = useMemo(() => {

        const currentTranslations =
            translations[language] ||
            translations.en;

        const t = (key) => {

            const keys = key.split(".");

            let value = currentTranslations;

            for (const item of keys) {
                value = value?.[item];
            }

            return value ?? key;
        };

        return {
            language,
            setLanguage,
            t,
        };

    }, [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {

    const context =
        useContext(LanguageContext);

    if (!context) {
        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }

    return context;
};