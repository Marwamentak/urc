import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


// c'eest la structure d'obj qu'on veut garder en mem
export type User = {
    id: number;
    username: string;
    externalId: string;
    email?: string;
};


// type qui decrit ce que j'ai dans mon store
type AuthState = {
    token: string | null;
    user: User | null;
    setSession: (p: { token: string; id: number; username: string; externalId: string; email?: string }) => void;
    clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setSession: ({ token, id, username, externalId, email }) =>
                set({ token, user: { id, username, externalId, email } }),
            clearSession: () => set({ token: null, user: null }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (s) => ({ token: s.token, user: s.user }),
        }
    )
);
