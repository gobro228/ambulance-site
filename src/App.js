import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CreateCall from "./components/CreateCall";
import CurrentCalls from "./components/CurrentCalls";
import HistoryCalls from "./components/HistoryCalls";
import Login from "./components/Login";

function App() {
    const [page, setPage] = useState("create"); // Активная вкладка
    const [calls, setCalls] = useState([]); // Все вызовы
    const [loading, setLoading] = useState(true); // Индикатор загрузки
    const [currentUser, setCurrentUser] = useState(null); // Залогиненный пользователь
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние меню профиля

    const users = [
        { username: "admin", password: "admin", role: "admin", avatarPath: "./assets/admin.png" },
        { username: "operator", password: "operator", role: "operator", avatarPath: "./assets/operator.png" },
        { username: "doctor", password: "doctor", role: "doctor", avatarPath: "./assets/doctor.png" },
    ];

    const login = (username, password) => {
        const user = users.find(
            (u) => u.username === username && u.password === password
        );

        if (user) {
            setCurrentUser(user); // Устанавливаем текущего пользователя
            setIsMenuOpen(false); // Закрываем меню, если оно было открыто
            setPage("create"); // Переключаем на главную вкладку
        } else {
            alert("Неверное имя пользователя или пароль.");
        }
    };

    const logout = () => {
        setCurrentUser(null); // Разлогиниваем пользователя
        setIsMenuOpen(false); // Закрываем меню
    };

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

    const handleSetPage = (newPage) => {
        setPage(newPage);

        // Если переключаемся на вкладку "history", обновляем список вызовов
        if (newPage === "history") {
            fetchCalls();
        }
    };

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

    const updateCallStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/calls/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedCall = await response.json();
                setCalls((prevCalls) =>
                    prevCalls.map((call) =>
                        call.id === id
                            ? { ...call, status: updatedCall.status, completed_at: updatedCall.completed_at }
                            : call
                    )
                );
            }
        } catch (error) {
            console.error("Ошибка при обновлении статуса:", error);
        }
    };

    const deleteCall = async (id) => {
        const previousCalls = [...calls];
        setCalls((prevCalls) => prevCalls.filter((call) => call.id !== id));

        try {
            const response = await fetch(`http://127.0.0.1:8000/calls/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Ошибка удаления:", errorData.detail || response.statusText);
                setCalls(previousCalls);
                alert("Ошибка при удалении вызова: " + (errorData.detail || "Неизвестная ошибка"));
            } else {
                alert("Вызов успешно удалён.");
                fetchCalls();
            }
        } catch (error) {
            console.error("Ошибка при удалении вызова:", error);
            setCalls(previousCalls);
            alert("Произошла ошибка при подключении к серверу.");
        }
    };

    const renderPage = () => {
        if (!currentUser && page !== "login") {
            return <Login onLogin={login} />;
        }

        switch (page) {
            case "create":
                return <CreateCall onAddCall={addCall} />;
            case "current":
                return <CurrentCalls calls={calls} onUpdateStatus={updateCallStatus} />;
            case "history":
                return <HistoryCalls calls={calls} onDeleteCall={deleteCall} />;
            case "profile":
                return <h2>Профиль пользователя: {currentUser.username}</h2>;
            case "login":
                return <Login onLogin={login} />;
            default:
                return <h2>Добро пожаловать, {currentUser ? currentUser.username : "Гость"}!</h2>;
        }
    };

    return (
        <div>
            <Header
                onNavigate={handleSetPage}
                currentUser={currentUser}
                onLogout={logout}
                isMenuOpen={isMenuOpen}
                toggleMenu={() => setIsMenuOpen((prev) => !prev)}
            />
            {loading ? <p>Загрузка...</p> : renderPage()}
        </div>
    );
}

export default App;
