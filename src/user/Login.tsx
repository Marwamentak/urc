import { useState } from "react";
import { loginUser } from "./loginApi";
import { Session } from "../model/common";
import { CustomError } from "../model/CustomError";
import * as React from "react";
import { Button, TextField, Box, Alert, Paper } from "@mui/material";
import { useAuthStore } from "../stores/auth";
import { useNavigate } from "react-router-dom";


function Login() {
    const [error, setError] = useState<CustomError | null>(null);

    const navigate = useNavigate();



    const setSession = useAuthStore((s) => s.setSession);
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);


        loginUser(
            {
                user_id: -1,
                username: data.get("login") as string,
                password: data.get("password") as string,
            },
            (result: Session) => {

                setSession({
                    token: result.token,
                    id: result.user_id ?? result.id ?? -1,
                    username: result.username || "",
                    externalId: result.externalId || "",
                });

                setError(null);
                form.reset();

                navigate("/chat");
            },
            (loginError: CustomError) => {
                setError(loginError);
            }
        );
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    bgcolor: "#f5f5f5",
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        width: "100%",
                        maxWidth: 400,
                        bgcolor: "white",
                        textAlign: "center",
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Nom d'utilisateur"
                            name="login"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Mot de passe"
                            name="password"
                            type="password"
                            variant="outlined"
                        />

                        <Button
                            variant="contained"
                            type="submit"
                            fullWidth
                            sx={{ mt: 2, mb: 1, py: 1 }}
                        >
                            Connexion
                        </Button>
                    </form>

                    {token && user && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Connecté : {user.username}
                        </Alert>
                    )}

                    {error?.message && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error.message}
                        </Alert>
                    )}
                </Paper>
            </Box>
        </>
    );
}

export default Login
