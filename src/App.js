import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CreateCall from "./components/CreateCall";
import CurrentCalls from "./components/CurrentCalls";
import HistoryCalls from "./components/HistoryCalls";

function App() {
    const [page, setPage] = useState("create"); // Активная вкладка
    const [calls, setCalls] = useState([]); // Все вызовы
    const [loading, setLoading] = useState(true); // Индикатор загрузки

    const fetchCalls = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/calls/");
            if (response.ok) {
                const data = await response.json();
                setCalls(data);
            } else {
                console.error("Ошибка при загрузке вызовов:", response.statusText);
            }
        } catch (error) {
            console.error("Ошибка при подключении к серверу:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalls();
    }, []);

    const addCall = async (call) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/calls/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(call),
            });
            if (response.ok) {
                const newCall = await response.json();
                setCalls((prevCalls) => [...prevCalls, newCall]);
            }
        } catch (error) {
            console.error("Ошибка при добавлении вызова:", error);
        }
    };

    const renderPage = () => {
        switch (page) {
            case "create":
                return <CreateCall onAddCall={addCall} />;
            case "current":
                return <CurrentCalls calls={calls} />;
            case "history":
                return <HistoryCalls calls={calls} />;
            default:
                return <h2>Добро пожаловать!</h2>;
        }
    };

    return (
        <div>
            <Header onNavigate={setPage} />
            {loading ? <p>Загрузка...</p> : renderPage()}
        </div>
    );
}

export default App;
