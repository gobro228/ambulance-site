import React, { useEffect, useState } from "react";
import "./CurrentCalls.css";

const CurrentCalls = () => {
    const [calls, setCalls] = useState([]); // Состояние для вызовов
    const [loading, setLoading] = useState(true); // Индикатор загрузки

    // Функция для загрузки вызовов с сервера
    const fetchCalls = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/calls/"); // Исправлен URL
            if (response.ok) {
                const data = await response.json();
                console.log("Данные вызовов:", data); // Лог для проверки данных
                setCalls(data); // Устанавливаем данные в состояние
            } else {
                console.error("Ошибка при загрузке вызовов:", response.statusText);
            }
        } catch (error) {
            console.error("Ошибка при подключении к серверу:", error);
        } finally {
            setLoading(false); // Отключаем индикатор загрузки
        }
    };

    // Функция для обновления статуса вызова
    const handleChangeStatus = async (id, newStatus) => {
        console.log(`Попытка изменения статуса вызова с ID: ${id} на новый статус: ${newStatus}`); // Отладка

        try {
            const response = await fetch(`http://127.0.0.1:8000/calls/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }), // Отправляем новый статус
            });

            if (response.ok) {
                setCalls((prevCalls) =>
                    prevCalls.map((call) =>
                        call.id === id ? { ...call, status: newStatus } : call
                    )
                );
                alert(`Статус вызова успешно обновлён на "${newStatus}"!`); // Сообщение пользователю
            } else {
                alert("Ошибка при обновлении статуса вызова.");
            }
        } catch (error) {
            console.error("Ошибка при обновлении статуса:", error);
            alert("Произошла ошибка при подключении к серверу.");
        }
    };

    // Загрузка вызовов при монтировании компонента
    useEffect(() => {
        fetchCalls();
    }, []);

    // Фильтруем текущие вызовы
    const unfinishedCalls = calls.filter((call) => call.status !== "Завершённый");

    return (
        <div className="current-calls">
            <h2>Текущие вызовы</h2>
            {loading ? (
                <p>Загрузка...</p>
            ) : unfinishedCalls.length === 0 ? (
                <p>Нет текущих вызовов.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Возраст</th>
                        <th>Адрес</th>
                        <th>Тип вызова</th>
                        <th>Дата и время</th>
                        <th>Комментарии</th>
                        <th>Статус</th>
                        <th>Действие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {unfinishedCalls.map((call) => (
                        <tr key={call.id}>
                            <td>{call.fio}</td>
                            <td>{call.age || "—"}</td>
                            <td>{call.address}</td>
                            <td>{call.type}</td>
                            <td>{call.date.replace("T", " ")}</td>
                            <td>{call.comment || "—"}</td>
                            <td>
                                <select
                                    value={call.status}
                                    onChange={(e) => handleChangeStatus(call.id, e.target.value)}
                                >
                                    <option value="Принят">Принят</option>
                                    <option value="В пути">В пути</option>
                                    <option value="На месте">На месте</option>
                                    <option value="В пути обратно">В пути обратно</option>
                                    <option value="Перевозка">Перевозка</option>
                                </select>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleChangeStatus(call.id, "Завершённый")}
                                    disabled={call.status === "Завершённый"} // Блокируем кнопку, если уже завершено
                                >
                                    Завершить
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CurrentCalls;
