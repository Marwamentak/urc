import * as React from "react";
import { useState } from "react";
import { Box, Paper, TextField, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setOk(false);

        const form = event.currentTarget;
        const data = new FormData(form);
        const username = (data.get("username") as string)?.trim();
        const email = (data.get("email") as string)?.trim();
        const password = (data.get("password") as string) ?? "";


        if (!username || !email || !password) {
            setError("Tous les champs sont requis.");
            return;
        }

        try {
            setSubmitting(true);

            // Appel API
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            let result: any = null;
            try {
                result = await res.json();
            } catch {
                // resultat reste null
            }

            if (!res.ok) {

                const msg =
                    (result && (result.message || result.error)) ||
                    `Erreur lors de la création du compte (HTTP ${res.status}).`;
                setError(msg);
                return;
            }


            const hasToken = result && typeof result.token === "string" && result.token.length > 0;

            if (hasToken) {

                sessionStorage.setItem("token", result.token);
                sessionStorage.setItem("externalId", result.externalId);
                sessionStorage.setItem("username", result.username ?? "");
                sessionStorage.setItem("userId", String(result.id));

                setOk(true);
                form.reset();


                navigate("/");
            } else {

                setOk(true);
                form.reset();
                navigate("/login");
            }
        } catch (e: any) {
            console.error(e);
            setError("Erreur réseau/serveur.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
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
                <form onSubmit={handleSubmit} noValidate>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Identifiant *"
                        name="username"
                        autoComplete="username"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email *"
                        name="email"
                        type="email"
                        autoComplete="email"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mot de passe *"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        variant="outlined"
                    />

                    <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        disabled={submitting}
                        sx={{ mt: 2, mb: 1, py: 1 }}
                    >
                        {submitting ? "Création…" : "CRÉER UN COMPTE"}
                    </Button>
                </form>

                {ok && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Compte créé
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>
        </Box>
    );
}
