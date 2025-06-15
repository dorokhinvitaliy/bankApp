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
  job: "Работает",
  month: "Месяц",
  y: "Подписка на депозит",
};

const decodeValue = (key: string, val: any): string | number => {
  if (["marital", "job", "education", "housing", "loan", "default", "y", "month"].includes(key)) {
    return getOptionsForColumn(key).find((el) => el.id == val).text ?? val;
  }
  
  return val;
};

// === Вспомогательные функции ===

const getOptionsForColumn = (col: string) => {
  if (col === "marital") {
    return [
      { id: "single", text: "Холост" },
      { id: "married", text: "Женат" },
      { id: "divorced", text: "Разведён" },
    ];
  }
  if (col === "education") {
    return [
      { id: "primary", text: "Начальное" },
      { id: "secondary", text: "Среднее" },
      { id: "tertiary", text: "Высшее" },
    ];
  }
  if (col === "job") {
    return [
      { id: "management", text: "Менеджмент" },
      { id: "technician", text: "Техник" },
      { id: "entrepreneur", text: "Предприниматель" },
      { id: "blue-collar", text: "Рабочий класс" },
      { id: "retired", text: "На пенсии" },
      { id: "admin", text: "Администратор" },
      { id: "services", text: "Услуги или сервис" },
      { id: "self-employed", text: "Самозанятый" },
      { id: "unemployed", text: "Неработающий" },
      { id: "housemaid", text: "Горничная" },
      { id: "student", text: "Студент" },
      { id: "unknown", text: "Неизвестен" },

    ];
  }
  if (["housing", "loan", "default", "is_employed", "y"].includes(col)) {
    return [
      { id: "yes", text: "Да" },
      { id: "no", text: "Нет" },
    ];
  }
  if (col === "month") {
    return Array.from({ length: 12 }, (_, i) => ({
      id: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][i],
      text: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"][i],
    }));
  }

  return [];
};

// Поля с бинарными значениями ("Да"/"Нет")
const binaryFields = ["housing", "loan", "default", "y"];

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
      rawValue = value;
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

  // === Скачивание PDF-отчёта ===
  const downloadPdfReport = () => {
    const activeFilters = Object.entries(filters).filter(
      ([_, f]) => f.enabled && f.value.trim() !== ""
    );

    if (activeFilters.length < 2 || !targetCol) return;

    const [f1, f2] = activeFilters;
    const url = new URL(`${API_BASE}/report`);
    url.searchParams.append("filter1_col", f1[0]);
    url.searchParams.append("filter1_val", String(f1[1].rawValue));
    url.searchParams.append("filter2_col", f2[0]);
    url.searchParams.append("filter2_val", String(f2[1].rawValue));
    url.searchParams.append("target_col", targetCol.id);

    // Открытие нового окна или прямая загрузка
    window.open(url.toString(), '_blank');
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
    <div className={classNames(styles.container, { [styles.loading]: fetching })}>
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

      <div style={{ width: "100%", display: "flex", gap: ".5rem" }}>
        <Button onClick={generateReport} disabled={!canGenerate || fetching}>
          {fetching ? "Загрузка..." : "Создать отчет"}
        </Button>

        {canGenerate && (
          <Button
            secondary
            onClick={downloadPdfReport}
            disabled={fetching}
            type="button"
          >
            {fetching ? "Загрузка..." : "Скачать отчёт (PDF)"}
          </Button>
        )}
      </div>

      {error != "" && <div className={classNames(styles.message, styles.red)}>{error}</div>}

      {/* Отображение графика */}
      {imageSrc && (
        <div className={styles.chart}>
          <h2 className="text-xl font-bold mb-4">График</h2>
          <img src={imageSrc} alt="Результат анализа" />
        </div>
      )}
    </div>
  );
}