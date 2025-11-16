import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Message } from "../components/message";
import { fetchMessagesWithUser, fetchMessagesInRoom, sendMessageToUser, sendMessageToRoom,} from "../components/message";

export type User = {
    id: number;
    username: string;
    externalId: string;
    email?: string;
    last_login?: string | null;
};

export type Room = {
    id: string;
    name: string;
};

type MessagesByKey = Record<string, Message[]>;

type AuthState = {
    token: string | null;
    user: User | null;

    users: User[];
    setUsers: (users: User[]) => void;
    selectedUserId: number | null;
    selectUser: (id: number | null) => void;

    rooms: Room[];
    selectedRoomId: string | null;
    setRooms: (rooms: Room[]) => void;
    selectRoom: (id: string | null) => void;

    selectNone: () => void;
    getSelectedConversationKey: () => string | null;
    isAuthenticated: () => boolean;

    messagesByKey: MessagesByKey;
    loadingKey: string | null;
    msgError?: string;

    loadConversation: (p: {
        token: string;
        userId?: number;
        roomId?: string;
    }) => Promise<void>;

    sendMessage: (p: {
        token: string;
        meId: number;
        text: string;
        userId?: number;
        roomId?: string;
    }) => Promise<void>;

    setSession: (p: {
        token: string;
        id: number;
        username: string;
        externalId: string;
        email?: string;
    }) => void;

    clearSession: () => void;
};

function keyFrom(p: { userId?: number | null; roomId?: string | null }) {
    if (p.userId != null) return `user:${p.userId}`;
    if (p.roomId != null) return `room:${p.roomId}`;
    return null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,

            users: [],
            setUsers: (users) => set({ users }),
            selectedUserId: null,
            selectUser: (id) =>
                set({
                    selectedUserId: id,
                    selectedRoomId: null,
                }),

            rooms: [],
            selectedRoomId: null,
            setRooms: (rooms) => set({ rooms }),
            selectRoom: (id) =>
                set({
                    selectedRoomId: id,
                    selectedUserId: null,
                }),

            selectNone: () => set({ selectedUserId: null, selectedRoomId: null }),

            getSelectedConversationKey: () => {
                const s = get();
                if (s.selectedUserId != null) return `user:${s.selectedUserId}`;
                if (s.selectedRoomId != null) return `room:${s.selectedRoomId}`;
                return null;
            },

            isAuthenticated: () => !!get().token,

            messagesByKey: {},
            loadingKey: null,
            msgError: undefined,


            async loadConversation({ token, userId, roomId }) {
                const key = keyFrom({ userId, roomId });
                if (!key) return;

                set({ loadingKey: key, msgError: undefined });

                try {
                    const msgs: Message[] =
                        userId != null
                            ? await fetchMessagesWithUser(token, userId)
                            : await fetchMessagesInRoom(token, roomId ?? "");


                    msgs.sort(
                        (a, b) =>
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                    );

                    set((state) => ({
                        messagesByKey: {
                            ...state.messagesByKey,
                            [key]: msgs,
                        },
                        loadingKey: null,
                    }));
                } catch (e) {
                    console.error("Erreur loadConversation:", e);
                    set({
                        loadingKey: null,
                        msgError: "Erreur chargement messages",
                    });
                }
            },


            async sendMessage({ token, meId: _meId, text, userId, roomId }) {
                const trimmed = text.trim();
                if (!trimmed) return;

                const key = keyFrom({ userId, roomId });
                if (!key) return;

                try {
                    if (userId != null) {
                        await sendMessageToUser(token, userId, trimmed);
                    } else if (roomId != null) {
                        await sendMessageToRoom(token, roomId, trimmed);
                    }


                    await get().loadConversation({ token, userId, roomId });
                } catch (e) {
                    console.error("Erreur sendMessage:", e);
                    set({ msgError: "Envoi échoué" });
                }
            },

            setSession: ({ token, id, username, externalId, email }) =>
                set({
                    token,
                    user: { id, username, externalId, email },
                }),

            clearSession: () =>
                set({
                    token: null,
                    user: null,
                    users: [],
                    rooms: [],
                    selectedRoomId: null,
                    selectedUserId: null,
                    messagesByKey: {},
                    loadingKey: null,
                    msgError: undefined,
                }),
        }),

        {
            name: "auth-store",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (s) => ({
                token: s.token,
                user: s.user,
                users: s.users,
                rooms: s.rooms,
                selectedRoomId: s.selectedRoomId,
                selectedUserId: s.selectedUserId,
                messagesByKey: s.messagesByKey,
            }),
        }
    )
);
