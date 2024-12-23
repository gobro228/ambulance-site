import React, { useState } from "react";
import "./HistoryCalls.css";

const HistoryCalls = ({ calls, onDeleteCall }) => {
    const [filter, setFilter] = useState("Все"); // Фильтр по типу вызова
    const [sortOrder, setSortOrder] = useState("desc"); // Сортировка по дате

    // Фильтрация и сортировка завершённых вызовов
    const filteredCalls = calls
        .filter((call) => call.status === "Завершённый")
        .filter((call) => (filter === "Все" ? true : call.type === filter))
        .sort((a, b) =>
            sortOrder === "asc"
                ? new Date(a.dateTime) - new Date(b.dateTime)
                : new Date(b.dateTime) - new Date(a.dateTime)
        );

    return (
        <div className="history-calls">
            <h2>История вызовов</h2>

            {/* Фильтрация и сортировка */}
            <div className="filters">
                <label>
                    Фильтр по типу:
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="Все">Все</option>
                        <option value="Зелёный поток">Зелёный поток</option>
                        <option value="Жёлтый поток">Жёлтый поток</option>
                        <option value="Красный поток">Красный поток</option>
                    </select>
                </label>

                <label>
                    Сортировка:
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="desc">По убыванию даты</option>
                        <option value="asc">По возрастанию даты</option>
                    </select>
                </label>
            </div>

            {/* Таблица с историей вызовов */}
            {filteredCalls.length === 0 ? (
                <p>Завершённых вызовов нет.</p>
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
                        <th>Действие</th> {/* Добавляем заголовок для кнопки */}
                    </tr>
                    </thead>
                    <tbody>
                    {filteredCalls.map((call) => (
                        <tr key={call.id}>
                            <td>{call.name}</td>
                            <td>{call.age}</td>
                            <td>{call.address}</td>
                            <td>{call.type}</td>
                            <td>{call.dateTime.replace("T", " ")}</td>
                            <td>{call.comments || "—"}</td>
                            <td>
                                <button onClick={() => onDeleteCall(call.id)}>Удалить</button> {/* Кнопка удаления */}
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
