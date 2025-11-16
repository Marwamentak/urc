import React, { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";
import { Box, Paper, Typography, List, ListItemButton, ListItemText, Divider, CircularProgress, Alert, } from "@mui/material";
import { useNavigate } from "react-router-dom";

type UserPublic = {
    user_id: number;
    username: string;
    last_login: string | null;
};

export default function UserList() {

    const navigate = useNavigate();

    const token = useAuthStore((s) => s.token);
    const me = useAuthStore((s) => s.user);
    const setUsers = useAuthStore((s) => s.setUsers);


    const selectedUserId = useAuthStore((s) => s.selectedUserId);
    const selectUser = useAuthStore((s) => s.selectUser);

    const [users, setLocalUsers] = useState<UserPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/users", {
                    headers: { Authentication: `Bearer ${token}` },
                });

                if (res.status === 401) {
                    setError("Non autorisé (token invalide)");
                    return;
                }
                if (!res.ok) {
                    setError("Erreur serveur");
                    return;
                }

                const data: UserPublic[] = await res.json();
                const filtered = data.filter((u) => u.user_id !== me?.id);

                // store global
                setUsers(
                    filtered.map((u) => ({
                        id: u.user_id,
                        username: u.username,
                        externalId: "",
                        last_login: u.last_login,
                    }))
                );


                setLocalUsers(filtered);
            } catch (e) {
                console.error(e);
                setError("Erreur réseau");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token, me?.id, setUsers]);

    if (loading) {
        return (
            <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Paper sx={{ width: 300, height: "calc(100vh - 120px)", overflowY: "auto" }} elevation={1}>
            <Box sx={{ p: 2, borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
                <Typography variant="h6">Utilisateurs</Typography>
            </Box>

            <List dense disablePadding>
                {users.length === 0 && (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Aucun autre utilisateur.
                        </Typography>
                    </Box>
                )}

                {users.map((u, idx) => (
                    <React.Fragment key={u.user_id}>
                        {idx !== 0 && <Divider component="li" />}

                        <ListItemButton
                            selected={selectedUserId === u.user_id}
                            onClick={() => {
                                selectUser(u.user_id);
                                navigate(`/chat/user/${u.user_id}`);
                            }}
                        >
                            <ListItemText
                                primary={`@${u.username}`}
                                secondary={
                                    <Typography variant="caption" color="text.secondary">
                                        Dernière connexion : {u.last_login || "Jamais"}
                                    </Typography>
                                }
                            />
                        </ListItemButton>

                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}
