import React from "react";
import "./CurrentCalls.css";

const CurrentCalls = ({ calls, onCompleteCall }) => {
    const unfinishedCalls = calls.filter((call) => call.status === "Незавершённый");

    return (
        <div className="current-calls">
            <h2>Текущие вызовы</h2>
            {unfinishedCalls.length === 0 ? (
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
                        <th>Действие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {unfinishedCalls.map((call) => (
                        <tr key={call.id}>
                            <td>{call.name}</td>
                            <td>{call.age || "—"}</td>
                            <td>{call.address}</td>
                            <td>{call.type}</td>
                            <td>{call.dateTime.replace("T", " ")}</td>
                            <td>{call.comments || "—"}</td>
                            <td>
                                <button onClick={() => onCompleteCall(call.id)}>Завершить</button>
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
