import React, { useContext } from 'react';

const DevContext = React.createContext();

export function useDev() {
    return useContext(DevContext);
}

export function DevProvider({ children }) {
    const dev = window.location.href.includes('localhost');

    return (
        <DevContext.Provider value={dev}>
                {children}
        </DevContext.Provider>
    )
}