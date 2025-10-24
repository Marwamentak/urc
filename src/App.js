import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth";
import HomePage from "./pages/HomePage";
import Chat from "./pages/chatPage";

function App() {
    const token = useAuthStore((s) => s.token);

    return (
            <Routes>
                <Route
                    path="/chat"
                    element={token ? <Chat /> : <Navigate to="/login" replace />}
                />
                <Route path="/*" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
    );
}

export default App;
