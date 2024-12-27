import React, { useState } from "react";
import "./CreateCall.css"; // Подключаем стили

const CreateCall = () => {
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

    const [loading, setLoading] = useState(false); // Состояние загрузки

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация
        if (!form.name || !form.age || !form.address) {
            alert("Пожалуйста, заполните обязательные поля: ФИО, возраст и адрес.");
            return;
        }

        if (!Number(form.age) || Number(form.age) <= 0) {
            alert("Пожалуйста, введите корректный возраст.");
            return;
        }

        setLoading(true); // Включаем индикатор загрузки
        try {
            const response = await fetch("http://127.0.0.1:8000/calls/", {
                method: "POST", // Тут была ошибка: не завершенный объект
                headers: {
                    "Content-Type": "application/json", // Заголовок Content-Type
                },
                body: JSON.stringify({
                    fio: form.name,
                    age: Number(form.age),
                    address: form.address,
                    type: form.type,
                    date: form.dateTime,
                    comment: form.comments,
                }),
            });

            console.log("Response:", response);
            if (response.ok) {
                try {
                    const data = await response.json();
                    console.log("Data from server:", data); // Логируем данные от сервера
                    alert("Вызов успешно создан!");
                    setForm({
                        name: "",
                        age: "",
                        address: "",
                        type: "Зелёный поток",
                        dateTime: localDateTime,
                        comments: "",
                        completed_at: "",
                    });
                } catch (error) {
                    alert("Ошибка обработки данных от сервера!");
                    console.error(error);
                }
            } else {
                console.log("Error response:", response);
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.detail || "Неизвестная ошибка"}`);
            }
        } catch (error) {
            alert("Произошла ошибка при подключении к серверу!");
            console.error(error);
        } finally {
            setLoading(false); // Выключаем индикатор загрузки
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
            <button type="submit" disabled={loading}>
                {loading ? "Создание..." : "Создать"}
            </button>
        </form>
    );
};

export default CreateCall;
