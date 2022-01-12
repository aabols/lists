import React, { useContext, useState } from 'react';

const ThemeContext = React.createContext();
const ThemeUpdateContext = React.createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function useThemeUpdate() {
    return useContext(ThemeUpdateContext);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState({
        accent1: "#8B008B",
        accent2: "#eee",
        fontSize: 0.8
    });

    return (
        <ThemeContext.Provider value={theme}>
            <ThemeUpdateContext.Provider value={setTheme}>
                {children}
            </ThemeUpdateContext.Provider>
        </ThemeContext.Provider>
    )
}