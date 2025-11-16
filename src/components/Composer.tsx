import * as React from "react";
import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAuthStore } from "../stores/auth";

export default function Composer() {
    const [text, setText] = React.useState("");

    const token = useAuthStore((s) => s.token);
    const me = useAuthStore((s) => s.user);
    const selectedUserId = useAuthStore((s) => s.selectedUserId);
    const selectedRoomId = useAuthStore((s) => s.selectedRoomId);
    const sendMessage = useAuthStore((s) => s.sendMessage);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        if (!token || !me) return;
        if (!selectedUserId && !selectedRoomId) return;

        await sendMessage({
            token,
            meId: me.id,
            text: trimmed,
            userId: selectedUserId ?? undefined,
            roomId: selectedRoomId ?? undefined,
        });

        setText("");
    };

    return (
        <Box
            sx={{
                p: 2,
                borderTop: (t) => `1px solid ${t.palette.divider}`,
                display: "flex",
                gap: 1,
            }}
        >
            <TextField
                fullWidth
                size="small"
                placeholder={
                    selectedUserId
                        ? "Écrire un message privé…"
                        : selectedRoomId
                            ? "Écrire dans le salon…"
                            : "Sélectionne un utilisateur ou un salon…"
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />
            <IconButton onClick={handleSend}>
                <SendIcon />
            </IconButton>
        </Box>
    );
}
