import React, { useState } from "react"; // Импортируем useState
import "./Login.css";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState(""); // Храним имя пользователя
    const [password, setPassword] = useState(""); // Храним пароль

    const handleSubmit = (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        onLogin(username, password); // Передаём введённые данные в функцию onLogin
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Авторизация</h2>
            <input
                type="text"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // Обновляем username
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Обновляем password
            />
            <button type="submit">Войти</button>
        </form>
    );
};

export default Login;
