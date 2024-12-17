import React from "react";
import "./Header.css"; // Стили для шапки
import logo from "../assets/logo.jpg";


const Header = ({ onNavigate }) => {
    return (
        <div className="header">
            <img src={logo} alt="Логотип" className="logo" />
            <nav className="nav-buttons">
                <button onClick={() => onNavigate("create")}>Создать вызов</button>
                <button onClick={() => onNavigate("current")}>Текущие вызовы</button>
                <button onClick={() => onNavigate("history")}>История вызовов</button>
            </nav>
            <div className="account-button">Я</div>
        </div>
    );
};

export default Header;
