import React from "react";
import "./Header.css"; // Стили для шапки
import logo from "../assets/logo.jpg";

const Header = ({ onNavigate, currentUser, onLogout, toggleMenu, isMenuOpen }) => {
    return (
        <div className="header">
            <img src={logo} alt="Логотип" className="logo" />
            <nav className="nav-buttons">
                <button onClick={() => onNavigate("create")}>Создать вызов</button>
                <button onClick={() => onNavigate("current")}>Текущие вызовы</button>
                <button onClick={() => onNavigate("history")}>История вызовов</button>
            </nav>
            <div className="account-section">
                {currentUser ? (
                    <div className="profile">
                        <div className="avatar" onClick={toggleMenu}>
                            <img
                                src={currentUser.avatarPath} // Путь к аватару
                                alt="Аватар"
                                className="avatar-image"
                            />
                        </div>
                        {isMenuOpen && (
                            <div className="profile-menu">
                                {/*<button onClick={() => onNavigate("profile")}>Посмотреть профиль</button>*/}
                                <button onClick={onLogout}>Выйти</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="login-button" onClick={() => onNavigate("login")}>
                        Войти
                    </button>
                )}
            </div>
        </div>
    );
};

export default Header;
