import React, { useState } from "react";
import "./CreateCall.css"; // Подключаем стили

const CreateCall = ({ onAddCall }) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    const [form, setForm] = useState({
        name: "",
        age: "",
        address: "",
        type: "Зелёный поток",
        dateTime: localDateTime,
        comments: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.name && form.age && form.address) {
            onAddCall(form); // Добавляем вызов
            alert("Вызов успешно создан!");
            setForm({
                name: "",
                age: "",
                address: "",
                type: "Зелёный поток",
                dateTime: localDateTime,
                comments: "",
            });
        } else {
            alert("Пожалуйста, заполните обязательные поля: ФИО, возраст и адрес.");
        }
    };

    return (
        <form className="create-call-form" onSubmit={handleSubmit}>
            <h2>Создание вызова</h2>
            <label>
                ФИО:
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
                Возраст:
                <input type="number" name="age" value={form.age} onChange={handleChange} required />
            </label>
            <label>
                Адрес:
                <input type="text" name="address" value={form.address} onChange={handleChange} required />
            </label>
            <label>
                Тип вызова:
                <select name="type" value={form.type} onChange={handleChange}>
                    <option value="Зелёный поток">Зелёный поток</option>
                    <option value="Жёлтый поток">Жёлтый поток</option>
                    <option value="Красный поток">Красный поток</option>
                </select>
            </label>
            <label>
                Дата и время:
                <input
                    type="datetime-local"
                    name="dateTime"
                    value={form.dateTime}
                    onChange={handleChange}
                />
            </label>
            <label>
                Комментарии:
                <textarea
                    name="comments"
                    value={form.comments}
                    onChange={handleChange}
                ></textarea>
            </label>
            <button type="submit">Создать</button>
        </form>
    );
};

export default CreateCall;
