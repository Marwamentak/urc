import * as React from "react";
import { useAuthStore } from "../stores/auth";
import { fetchRoomsApi } from "./rooms";

import {
    Box, Paper, Typography, List, ListItemButton, ListItemText,
    Divider, CircularProgress, Alert,
} from "@mui/material";

export default function RoomList() {
    const token = useAuthStore(s => s.token);
    const rooms = useAuthStore(s => s.rooms);
    const setRooms = useAuthStore(s => s.setRooms);
    const selectedRoomId = useAuthStore(s => s.selectedRoomId);
    const selectRoom = useAuthStore(s => s.selectRoom);

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const data = await fetchRoomsApi(token);
                setRooms(data);
            } catch (e: any) {
                console.error("[RoomList] fetch error:", e);
                setError(e?.message || "Erreur chargement salons");
            } finally {
                setLoading(false);
            }
        })();
    }, [token, setRooms]);

    return (
        <Paper sx={{ width: 300, mt: 2 }} elevation={1}>
            <Box sx={{ p: 2, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                <Typography variant="h6">Salons</Typography>
            </Box>

            {loading && (
                <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && error && (
                <Box sx={{ p: 2 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {!loading && !error && (
                <List dense disablePadding>
                    {rooms.map((r, idx) => (
                        <React.Fragment key={r.id}>
                            {idx !== 0 && <Divider component="li" />}
                            <ListItemButton
                                selected={selectedRoomId === r.id}
                                onClick={() => selectRoom(r.id)}
                            >
                                <ListItemText primary={r.name} />
                            </ListItemButton>
                        </React.Fragment>
                    ))}
                    {rooms.length === 0 && (
                        <Box sx={{ p: 2, color: "text.secondary" }}>
                            <Typography variant="body2">Aucun salon</Typography>
                        </Box>
                    )}
                </List>
            )}
        </Paper>
    );
}
