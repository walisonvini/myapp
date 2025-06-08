import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  logIn: () => void;
  logOut: () => void;
}

export const AuthContext = createContext<AuthState>({
    isLoggedIn: false,
    isReady: false,
    logIn: () => {},
    logOut: () => {},
});

const AUTH_STATE_KEY = 'authState';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const router = useRouter();

    async function storeAuthState(newState: { isLoggedIn: boolean }) {
        try {
            await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify(newState));
        } catch (error) {
            console.error('Erro ao armazenar o estado de autenticação:', error);
        }
    }

    const logIn = () => {
        setIsLoggedIn(true);
        storeAuthState({ isLoggedIn: true });
        router.replace('/home');
    }

    const logOut = () => {
        setIsLoggedIn(false);
        storeAuthState({ isLoggedIn: false });
        router.replace('/');
    }

    useEffect(() => {
        async function loadAuthState() {
            try {
                const authState = await AsyncStorage.getItem(AUTH_STATE_KEY);
                if(authState) {
                    setIsLoggedIn(JSON.parse(authState).isLoggedIn);
                }
            } catch (error) {
                console.error('Erro ao carregar o estado de autenticação:', error);
            } finally {
                setIsReady(true);
            }
        }

        loadAuthState();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, isReady, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}