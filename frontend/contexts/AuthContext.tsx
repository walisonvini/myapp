import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { UserDatabase } from '../src/app/database/useUserDatabase';

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  user: UserDatabase | null;
  logIn: (user: UserDatabase) => void;
  logOut: () => void;
  updateUser: (user: UserDatabase) => void;
}

export const AuthContext = createContext<AuthState>({
    isLoggedIn: false,
    isReady: false,
    user: null,
    logIn: () => {},
    logOut: () => {},
    updateUser: () => {},
});

const AUTH_STATE_KEY = 'authState';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [user, setUser] = useState<UserDatabase | null>(null);
    const router = useRouter();

    async function storeAuthState(newState: { isLoggedIn: boolean; user: UserDatabase | null }) {
        try {
            await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify(newState));
        } catch (error) {
            console.error('Erro ao armazenar o estado de autenticação:', error);
        }
    }

    const logIn = (user: UserDatabase) => {
        setIsLoggedIn(true);
        setUser(user);
        storeAuthState({ isLoggedIn: true, user });
        router.replace('/home');
    }

    const logOut = () => {
        setIsLoggedIn(false);
        setUser(null);
        storeAuthState({ isLoggedIn: false, user: null });
        router.replace('/');
    }

    const updateUser = (user: UserDatabase) => {
        setUser(user);
        storeAuthState({ isLoggedIn: true, user });
    }

    useEffect(() => {
        async function loadAuthState() {
            try {
                const authState = await AsyncStorage.getItem(AUTH_STATE_KEY);
                if(authState) {
                    const { isLoggedIn, user } = JSON.parse(authState);
                    setIsLoggedIn(isLoggedIn);
                    setUser(user);
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
        <AuthContext.Provider value={{ isLoggedIn, isReady, user, logIn, logOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}