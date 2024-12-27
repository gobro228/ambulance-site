import React, { useEffect, useState } from "react";
import "./HistoryCalls.css";

const HistoryCalls = () => {
    const [completedCalls, setCompletedCalls] = useState([]); // Состояние для завершённых вызовов
    const [loading, setLoading] = useState(true); // Индикатор загрузки

    // Загрузка завершённых вызовов с сервера
    const fetchCompletedCalls = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/calls/"); // Запрос к основному эндпоинту вызовов
            if (response.ok) {
                const data = await response.json();
                // Фильтруем вызовы со статусом "Завершённый"
                const filteredData = data.filter((call) => call.status === "Завершённый");
                setCompletedCalls(filteredData); // Сохраняем отфильтрованные данные в состояние
            } else {
                console.error("Ошибка при загрузке завершённых вызовов:", response.statusText);
            }
        } catch (error) {
            console.error("Ошибка при подключении к серверу:", error);
        } finally {
            setLoading(false); // Отключаем индикатор загрузки
        }
    };

    useEffect(() => {
        fetchCompletedCalls();
    }, []);

    return (
        <div className="history-calls">
            <h2>История вызовов</h2>
            {loading ? (
                <p>Загрузка...</p>
            ) : completedCalls.length === 0 ? (
                <p>История вызовов пуста.</p>
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
                        <th>Время завершения</th>
                    </tr>
                    </thead>
                    <tbody>
                    {completedCalls.map((call) => (
                        <tr key={call.id}>
                            <td>{call.fio}</td>
                            <td>{call.age || "—"}</td>
                            <td>{call.address}</td>
                            <td>{call.type}</td>
                            <td>{call.date.replace("T", " ")}</td>
                            <td>{call.comment || "—"}</td>
                            <td>
                                {call.completed_at
                                    ? new Date(call.completed_at).toLocaleString()
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HistoryCalls;
