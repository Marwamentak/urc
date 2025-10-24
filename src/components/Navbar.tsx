import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Link as RouterLink } from "react-router-dom";

export default function Navbar() {
    return (
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
                            to="/login"
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
                        >
                            CONNEXION
                        </Button>

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
                        >
                            CRÉER UN COMPTE
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
