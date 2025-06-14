"use client";

import React, { useState, useEffect } from "react";
import { SelectBox } from "../components/Input/SelectBox";
import Input from "../components/Input";
import Button from "../components/Button";
import styles from "./reports.module.css";
import classNames from "classnames/index";

// === Модель данных (из headersMap и decodeValue) ===
const headersMap: Record<string, string> = {
  age: "Возраст",
  marital: "Семейное положение",
  education: "Образование",
  default: "Дефолт",
  balance: "Баланс",
  housing: "Ипотека",
  loan: "Кредит",
  day: "День",
  duration: "Длительность",
  campaign: "Кампания",
  pdays: "Pdays",
  previous: "Предыдущие контакты",
  is_employed: "Работает",
  month_int: "Месяц",
  y: "Подписка на депозит",
};

const decodeValue = (key: string, val: any): string | number => {
  if (key === "marital") {
    return { 0: "Холост", 1: "Женат", 2: "Разведён" }[val] ?? val;
  }
  if (key === "education") {
    return { 0: "Начальное", 1: "Среднее", 2: "Высшее" }[val] ?? val;
  }
  if (["housing", "loan", "default", "is_employed", "y"].includes(key)) {
    return val === 1 ? "Да" : "Нет";
  }
  if (key === "month_int") {
    return {
      1: "Январь",
      2: "Февраль",
      3: "Март",
      4: "Апрель",
      5: "Май",
      6: "Июнь",
      7: "Июль",
      8: "Август",
      9: "Сентябрь",
      10: "Октябрь",
      11: "Ноябрь",
      12: "Декабрь",
    }[val] ?? val;
  }
  return val;
};

// === Вспомогательные функции ===

const getOptionsForColumn = (col: string) => {
  if (col === "marital") {
    return [
      { id: "0", text: "Холост" },
      { id: "1", text: "Женат" },
      { id: "2", text: "Разведён" },
    ];
  }
  if (col === "education") {
    return [
      { id: "0", text: "Начальное" },
      { id: "1", text: "Среднее" },
      { id: "2", text: "Высшее" },
    ];
  }
  if (["housing", "loan", "default", "is_employed", "y"].includes(col)) {
    return [
      { id: "1", text: "Да" },
      { id: "0", text: "Нет" },
    ];
  }
  if (col === "month_int") {
    return Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      text: decodeValue("month_int", i + 1),
    }));
  }

  return [];
};

// Поля с бинарными значениями ("Да"/"Нет")
const binaryFields = ["housing", "loan", "default", "is_employed", "y"];

// Числовые поля
const numericFields = new Set([
  "age",
  "balance",
  "day",
  "duration",
  "campaign",
  "pdays",
  "previous"
]);

export default function Page() {
  const API_BASE = "http://127.0.0.1:5000";

  // Состояния
  const [filters, setFilters] = useState<Record<string, { enabled: boolean; value: string; rawValue: string | number }>>({});
  const [targetCol, setTargetCol] = useState<{ id: string; text: string } | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  // Инициализируем фильтры при загрузке
  useEffect(() => {
    const initialFilters: Record<string, { enabled: boolean; value: string; rawValue: string | number }> = {};
    Object.keys(headersMap).forEach((col) => {
      initialFilters[col] = { enabled: false, value: "", rawValue: "" };
    });
    setFilters(initialFilters);
  }, []);

  // Получаем список всех колонок как опции
  const columnOptions = Object.entries(headersMap).map(([id, name]) => ({
    id,
    text: name,
  }));

  // Проверяем, является ли поле бинарным
  const isBinaryField = (col: string) => binaryFields.includes(col);

  // Получаем доступные значения для селекта
  const getFilterComponent = (col: string) => {
    const options = getOptionsForColumn(col);
    if (numericFields.has(col)) {
      return (
        <Input
          type="text"
          id={`filter-${col}`}
          value={filters[col]?.value ?? ""}
          onChange={(value) => handleFilterChange(col, value)}
          placeholder={`Введите значение`}
        />
      );
    } else if (options.length > 0) {
      return (
        <SelectBox
          options={options}
          selected={options.find((opt) => opt.text === filters[col]?.value) || null}
          placeholder="Выберите значение"
          onChange={(opt) => {
            if (opt) handleFilterChange(col, opt.id); // opt.id — это число как строка: "1", "0"
          }}
        />
      );
    }
    return null;
  };

  // Обработчик изменения значения
  const handleFilterChange = (col: string, value: string) => {
    let finalValue = value;
    let rawValue: string | number = value;
  
    if (isBinaryField(col)) {
      // Для Да/Нет: сохраняем число, отображаем текст
      rawValue = parseInt(value, 10);
      finalValue = decodeValue(col, rawValue);
    } else {
      // Для marital, education и т.д.: сохраняем текст, rawValue — id как строка
      rawValue = value; // например, "0", "1"
      finalValue = decodeValue(col, value); // например, "Холост", "Женат"
    }
  
    setFilters({
      ...filters,
      [col]: { ...filters[col], value: finalValue, rawValue },
    });
  };

  // Обработчик переключения чекбокса (ограничение до 2-х)
  const toggleFilter = (col: string) => {
    const activeCount = Object.values(filters).filter((f) => f.enabled).length;
    const isActive = filters[col].enabled;

    if (!isActive && activeCount >= 2) {
      return;
    }

    setFilters({
      ...filters,
      [col]: {
        ...filters[col],
        enabled: !isActive,
        ...(filters[col].enabled ? { value: "", rawValue: "" } : {}),
      },
    });
  };

  const [error, updError] = useState("");
  // Генерация отчёта
  const generateReport = () => {
    const activeFilters = Object.entries(filters).filter(
      ([_, f]) => f.enabled && f.value.trim() !== ""
    );

    if (activeFilters.length < 2) {
      alert("Выберите ровно два активных фильтра");
      return;
    }

    if (!targetCol) {
      alert("Выберите целевую переменную");
      return;
    }

    const [f1, f2] = activeFilters;

    const url = new URL(`${API_BASE}/plot`);
    url.searchParams.append("filter1_col", f1[0]);
    url.searchParams.append("filter1_val", String(f1[1].rawValue));
    url.searchParams.append("filter2_col", f2[0]);
    url.searchParams.append("filter2_val", String(f2[1].rawValue));
    url.searchParams.append("target_col", targetCol.id);

    setFetching(true);
    fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка получения графика");
        console.log(url);
        return res.blob();
      })
      .then((blob) => {
        setImageSrc(URL.createObjectURL(blob));
        updError("");
      })
      .catch((err) => {
        console.error(err);
        updError("Не удалось получить график");
      })
      .finally(() => setFetching(false));
  };

  // Рассчитываем количество активных фильтров
  const activeFilterCount = Object.values(filters).filter((f) => f.enabled).length;

  // Можно ли отправить запрос?
  const canGenerate =
    activeFilterCount === 2 &&
    Object.values(filters).every(
      (f) => !f.enabled || (f.enabled && f.value.trim() !== "")
    ) &&
    targetCol !== null;

  return (
    <div className={classNames(styles.container, {[styles.loading]: fetching})}>
      <h1 className="text-2xl font-bold mb-4">Генерация отчёта</h1>
      <div className={styles.message}>Выберите 2 фильтра с значениями для них, затем одну целевую переменную для создания отчета.</div>

      {/* Фильтры */}
      <div className={styles.filters}>
        {Object.entries(headersMap).map(([colId, colName]) => {
          const filter = filters[colId];
          return (
            <div key={colId} className={styles.filterSection}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filter?.enabled || false}
                  onChange={() => toggleFilter(colId)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxCustom} />
                {colName}
              </label>

              {filter?.enabled && getFilterComponent(colId)}
            </div>
          );
        })}
      </div>

      {/* Целевая переменная */}
      <div className={styles.targetSection}>
        <label>Анализируемая переменная</label>
        <SelectBox
          options={columnOptions}
          selected={targetCol}
          placeholder="Выберите переменную"
          onChange={(opt) => {
            if (opt) setTargetCol(opt as { id: string; text: string });
          }}
        />
      </div>

      {/* Кнопка с disabled */}
      <Button onClick={generateReport} disabled={!canGenerate || fetching}>
        {fetching ? "Загрузка..." : "Создать отчет"}
      </Button>

      {error!="" && <div className={classNames(styles.message, styles.red)}>{error}</div>}

      {/* Отображение графика */}
      {imageSrc && (
        <div className={styles.chart}>
          <h2>График</h2>
          <img src={imageSrc} alt="Результат анализа" />
        </div>
      )}
    </div>
  );
}