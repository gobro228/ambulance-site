import React, { useState } from "react"; // Импортируем useState
import "./Login.css";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState(""); // Храним имя пользователя
    const [password, setPassword] = useState(""); // Храним пароль
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault(); // Предотвращаем перезагрузку страницы
        setError("");
        setIsLoading(true);

        try {
            await onLogin(username, password);
        } catch (err) {
            setError("Неверное имя пользователя или пароль");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>Скорая помощь</h1>
                    <p>Система управления вызовами</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Имя пользователя</label>
                        <div className="input-group">
                            <i className="fas fa-user"></i>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Введите имя пользователя"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <div className="input-group">
                            <i className="fas fa-lock"></i>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button 
                        type="submit" 
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            'Войти в систему'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2024 Система Скорой Помощи</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
