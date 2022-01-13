import React, { useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const LOCAL_STORAGE_KEY = "LANIS_PERSONAL";
const AuthContext = React.createContext();
const AuthUpdateContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function useAuthUpdate() {
    return useContext(AuthUpdateContext);
}

export function AuthProvider({ children }) {
    const [auth, setAuth] = useLocalStorage(LOCAL_STORAGE_KEY, null);

    return (
        <AuthContext.Provider value={auth}>
            <AuthUpdateContext.Provider value={setAuth}>
                {children}
            </AuthUpdateContext.Provider>
        </AuthContext.Provider>
    )
}