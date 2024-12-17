import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CreateCall from "./components/CreateCall";
import CurrentCalls from "./components/CurrentCalls";
import HistoryCalls from "./components/HistoryCalls";

function App() {
    const [page, setPage] = useState("create");
    const [calls, setCalls] = useState(() => {
        const savedCalls = localStorage.getItem("calls");
        return savedCalls ? JSON.parse(savedCalls) : [];
    });

    useEffect(() => {
        localStorage.setItem("calls", JSON.stringify(calls));
    }, [calls]);

    // Добавление нового вызова
    const addCall = (call) => {
        const newCall = { ...call, id: Date.now(), status: "Незавершённый" };
        setCalls([...calls, newCall]);
    };

    // Завершение вызова
    const completeCall = (id) => {
        const updatedCalls = calls.map((call) =>
            call.id === id ? { ...call, status: "Завершённый" } : call
        );
        setCalls(updatedCalls);
    };

    // Удаление вызова по id
    const deleteCall = (id) => {
        const updatedCalls = calls.filter((call) => call.id !== id);
        setCalls(updatedCalls);
    };

    const renderPage = () => {
        switch (page) {
            case "create":
                return <CreateCall onAddCall={addCall} />;
            case "current":
                return <CurrentCalls calls={calls} onCompleteCall={completeCall} />;
            case "history":
                return <HistoryCalls calls={calls} onDeleteCall={deleteCall} />;
            default:
                return <h2>Добро пожаловать!</h2>;
        }
    };

    return (
        <div>
            <Header onNavigate={setPage} />
            <div style={{ marginTop: "70px" }}>{renderPage()}</div>
        </div>
    );
}

export default App;
