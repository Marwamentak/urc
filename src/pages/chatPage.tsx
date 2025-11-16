import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

import UsersList from "../components/UsersList";
import RoomList from "../components/RoomList";
import MessageList from "../components/MessageList";
import Composer from "../components/Composer";

export default function Chat() {
    const navigate = useNavigate();
    const { userId, roomId } = useParams();

    const clearSession = useAuthStore((s) => s.clearSession);
    const token = useAuthStore((s) => s.token);


    const selectUser = useAuthStore((s) => s.selectUser);
    const selectRoom = useAuthStore((s) => s.selectRoom);


    React.useEffect(() => {
        if (!token) navigate("/login", { replace: true });
    }, [token, navigate]);


    React.useEffect(() => {
        if (userId) {
            selectUser(Number(userId));
        } else if (roomId) {
            selectRoom(roomId);
        }
    }, [userId, roomId, selectUser, selectRoom]);



    const handleLogout = () => {
        clearSession();
        navigate("/login", { replace: true });
    };

    return (
        <>
            <AppBar position="static" elevation={4}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <Typography variant="h6" noWrap sx={{ mr: 2, fontWeight: 600, letterSpacing: 0.2 }}>
                            UBO Relay Chat
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="medium"
                            sx={{
                                borderColor: "rgba(255,255,255,0.8)",
                                color: "common.white",
                                "&:hover": { borderColor: "common.white", backgroundColor: "rgba(255,255,255,0.08)" },
                            }}
                            onClick={handleLogout}
                        >
                            DECONNEXION
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
                        gap: 2,
                        alignItems: "start",
                    }}
                >


                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <UsersList />
                        <RoomList />
                    </Box>


                    <Paper
                        elevation={1}
                        sx={{
                            height: { xs: "calc(100vh - 200px)", md: "calc(100vh - 140px)" },
                            display: "flex",
                            flexDirection: "column",
                            p: 0,
                        }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6">Conversation</Typography>
                        </Box>

                        <MessageList />

                        <Composer />
                    </Paper>
                </Box>
            </Container>
        </>
    );
}
