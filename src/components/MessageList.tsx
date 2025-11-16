import * as React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useAuthStore } from "../stores/auth";

export default function MessageList() {
    const token = useAuthStore((s) => s.token);
    const me = useAuthStore((s) => s.user);

    const selectedUserId = useAuthStore((s) => s.selectedUserId);
    const selectedRoomId = useAuthStore((s) => s.selectedRoomId);

    const messagesByKey = useAuthStore((s) => s.messagesByKey);
    const loadConversation = useAuthStore((s) => s.loadConversation);
    const loadingKey = useAuthStore((s) => s.loadingKey);

    const key =
        selectedUserId != null
            ? `user:${selectedUserId}`
            : selectedRoomId != null
                ? `room:${selectedRoomId}`
                : null;

    const messages = key ? messagesByKey[key] || [] : [];
    const isLoading = key ? loadingKey === key : false;

    const load = React.useCallback(() => {
        if (!token) return;
        loadConversation({
            token,
            userId: selectedUserId ?? undefined,
            roomId: selectedRoomId ?? undefined,
        });
    }, [token, selectedUserId, selectedRoomId, loadConversation]);

    React.useEffect(() => {
        if (selectedUserId || selectedRoomId) {
            load();
        }
    }, [load]);

    const endRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    if (!key) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">
                    Sélectionne un utilisateur ou un salon.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, px: 2, pb: 1, overflowY: "auto" }}>
            {isLoading && (
                <Box sx={{ pt: 2, display: "flex", justifyContent: "center" }}>
                    <CircularProgress size={20} />
                </Box>
            )}

            {messages.map((m) => {
                const isMine = me && Number(m.from) === Number(me.id);

                return (
                    <Box
                        key={m.id}
                        sx={{
                            display: "flex",
                            justifyContent: isMine ? "flex-end" : "flex-start",
                            mb: 1.5,
                        }}
                    >
                        <Box
                            sx={(t) => ({
                                maxWidth: "70%",
                                p: 1.25,
                                borderRadius: 2,
                                bgcolor: isMine
                                    ? t.palette.primary.main
                                    : t.palette.grey[200],
                                color: isMine
                                    ? t.palette.primary.contrastText
                                    : t.palette.text.primary,
                            })}
                        >
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {isMine ? "Moi" : `#${m.from}`} —{" "}
                                {new Date(m.created_at).toLocaleString()}
                            </Typography>
                            <Typography>{m.text}</Typography>
                        </Box>
                    </Box>
                );
            })}

            <div ref={endRef} />
        </Box>
    );
}
