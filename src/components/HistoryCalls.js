import React from "react";
import "./HistoryCalls.css";

const HistoryCalls = ({ calls, onDeleteCall }) => {
    // Фильтруем только завершённые вызовы
    const completedCalls = calls.filter((call) => call.status === "Завершённый");

    return (
        <div className="history-calls">
            <h2>История вызовов</h2>
            {completedCalls.length === 0 ? (
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
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {completedCalls.map((call) => (
                        <tr key={call.id}>
                            <td>{call.fio}</td>
                            <td>{call.age}</td>
                            <td>{call.address}</td>
                            <td>{call.type}</td>
                            <td>{call.date}</td>
                            <td>{call.comment || "—"}</td>
                            <td>{call.completed_at ? call.completed_at.replace("T", " ") : "—"}</td>
                            <td>
                                <button onClick={() => onDeleteCall(call.id)}>
                                    Удалить
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

export default HistoryCalls;
