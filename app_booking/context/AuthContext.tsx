import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
    fullName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
} | null;

interface AuthContextValue {
    user: User;
    restoring: boolean;
    signIn: (userData: User) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (userData: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [restoring, setRestoring] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const json = await AsyncStorage.getItem("userProfile");
                if (json) setUser(JSON.parse(json));
            } catch (e) {
                // ignore
            } finally {
                setRestoring(false);
            }
        })();
    }, []);

    const signIn = async (userData: User) => {
        if (userData) {
            await AsyncStorage.setItem("userProfile", JSON.stringify(userData));
        }
        setUser(userData);
    };

    const updateUserProfile = async (userData: User) => {
        if (userData) {
            await AsyncStorage.setItem("userProfile", JSON.stringify(userData));
            setUser(userData);
        }
    };

    const signOut = async () => {
        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "userProfile"]);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, restoring, signIn, signOut, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
