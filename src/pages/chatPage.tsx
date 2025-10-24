import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {Link as RouterLink} from "react-router";
import AppBar from "@mui/material/AppBar";

export default function Chat() {
    const navigate = useNavigate();
    const clearSession = useAuthStore((s) => s.clearSession);
    const token = useAuthStore((s) => s.token);


    React.useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
        }
    }, [token, navigate]);

    const handleLogout = () => {
        clearSession();
        navigate("/login", { replace: true });
    };

    return (
        <>
            <AppBar
                position="static"
                elevation={4}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters>

                        <Typography
                            variant="h6"
                            noWrap
                            sx={{ mr: 2, fontWeight: 600, letterSpacing: 0.2 }}
                        >
                            UBO Relay Chat
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />


                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                component={RouterLink}
                                to="/register"
                                variant="outlined"
                                color="inherit"
                                size="medium"
                                sx={{
                                    borderColor: "rgba(255,255,255,0.8)",
                                    color: "common.white",
                                    "&:hover": {
                                        borderColor: "common.white",
                                        backgroundColor: "rgba(255,255,255,0.08)",
                                    },
                                }}
                                onClick={handleLogout}
                            >
                                DECONNEXION
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
}
