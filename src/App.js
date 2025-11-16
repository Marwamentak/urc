import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth";

import HomePage from "./pages/HomePage";
import Chat from "./pages/chatPage";

export default function App() {
    const token = useAuthStore((s) => s.token);

    return (
        <Routes>
            {/* Accueil = Login + Register */}
            <Route path="/*" element={<HomePage />} />

            {/* Page de chat */}
            <Route
                path="/chat/*"
                element={token ? <Chat /> : <Navigate to="/login" replace />}
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
