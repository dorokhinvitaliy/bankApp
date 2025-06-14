"use client";

import React, { useState } from "react";
import { SelectBox } from "../components/Input/SelectBox";
import Input from "../components/Input";
import Button from "../components/Button";
import styles from "./predict.module.css";
import classNames from "classnames/index";

// === Опции для выпадающих списков ===
const maritalOptions = [
  { id: "0", text: "Холост" },
  { id: "1", text: "Женат" },
  { id: "2", text: "Разведён" },
];

const educationOptions = [
  { id: "0", text: "Начальное" },
  { id: "1", text: "Среднее" },
  { id: "2", text: "Высшее" },
];

const binaryOptions = [
  { id: "1", text: "Да" },
  { id: "0", text: "Нет" },
];

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  text: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"][i],
}));

const requiredFields = [
  "age",
  "marital",
  "education",
  "default",
  "balance",
  "housing",
  "loan",
  "day",
  "duration",
  "campaign",
  "pdays",
  "previous",
  "is_employed",
  "month_int"
];

export default function PredictPage() {
  const API_BASE = "http://127.0.0.1:5000";

  // === Состояния ===
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [predictionResult, setPredictionResult] = useState<{
    deposit_subscribed: boolean;
    probability: number;
  } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === Обработчик изменения значений полей ===
  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // === Отправка запроса на /predict ===
  const predictDepositSubscription = (e: React.FormEvent) => {
    e.preventDefault(); // ← Предотвращаем перезагрузку страницы

    const missing = requiredFields.filter((field) => !formData[field]);
    if (missing.length > 0) {
      alert(`Заполните все поля: ${missing.join(", ")}`);
      return;
    }

    setFetching(true);
    setError(null);

    fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка получения предсказания");
        return res.json();
      })
      .then((data) => {
        setPredictionResult(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Не удалось получить предсказание");
      })
      .finally(() => setFetching(false));
  };

  // === Проверка заполнения всех полей ===
  const allFieldsFilled = requiredFields.every(
    (field) =>
      formData[field] !== undefined && formData[field].trim() !== ""
  );

  return (
    <div className={classNames(styles.container, {[styles.loading]: fetching})}>
      <h1 className="text-2xl font-bold mb-4">Предсказание оформления депозита</h1>
      <div className={styles.message}>
        Для каждого параметра выберите значения, чтобы получить предсказание.
      </div>

      {error && <div className={classNames(styles.message, styles.red)}>{error}</div>}

      <form onSubmit={predictDepositSubscription} className={styles.form}>
        {/* Возраст */}
        <div className={styles.formGroup}>
          <label htmlFor="age">Возраст</label>
          <Input
            type="number"
            id="age"
            name="age"
            value={formData.age || ""}
            onChange={(value) => handleInputChange("age", value)}
            placeholder="Введите возраст"
          />
        </div>

        {/* Семейное положение */}
        <div className={styles.formGroup}>
          <label htmlFor="marital">Семейное положение</label>
          <SelectBox
            options={maritalOptions}
            selected={maritalOptions.find((opt) => opt.id === formData.marital) || null}
            placeholder="Выберите семейное положение"
            onChange={(opt) => opt && handleInputChange("marital", opt.id)}
          />
        </div>

        {/* Образование */}
        <div className={styles.formGroup}>
          <label htmlFor="education">Образование</label>
          <SelectBox
            options={educationOptions}
            selected={educationOptions.find((opt) => opt.id === formData.education) || null}
            placeholder="Выберите уровень образования"
            onChange={(opt) => opt && handleInputChange("education", opt.id)}
          />
        </div>

        {/* Дефолт */}
        <div className={styles.formGroup}>
          <label htmlFor="default">Дефолт</label>
          <SelectBox
            options={binaryOptions}
            selected={binaryOptions.find((opt) => opt.id === formData.default) || null}
            placeholder="Дефолт"
            onChange={(opt) => opt && handleInputChange("default", opt.id)}
          />
        </div>

        {/* Баланс */}
        <div className={styles.formGroup}>
          <label htmlFor="balance">Баланс</label>
          <Input
            type="number"
            id="balance"
            name="balance"
            value={formData.balance || ""}
            onChange={(value) => handleInputChange("balance", value)}
            placeholder="Введите баланс"
          />
        </div>

        {/* Ипотека */}
        <div className={styles.formGroup}>
          <label htmlFor="housing">Ипотека</label>
          <SelectBox
            options={binaryOptions}
            selected={binaryOptions.find((opt) => opt.id === formData.housing) || null}
            placeholder="Имеется ипотека?"
            onChange={(opt) => opt && handleInputChange("housing", opt.id)}
          />
        </div>

        {/* Кредит */}
        <div className={styles.formGroup}>
          <label htmlFor="loan">Кредит</label>
          <SelectBox
            options={binaryOptions}
            selected={binaryOptions.find((opt) => opt.id === formData.loan) || null}
            placeholder="Есть кредит?"
            onChange={(opt) => opt && handleInputChange("loan", opt.id)}
          />
        </div>

        {/* День контакта */}
        <div className={styles.formGroup}>
          <label htmlFor="day">День контакта</label>
          <Input
            type="number"
            id="day"
            name="day"
            value={formData.day || ""}
            onChange={(value) => handleInputChange("day", value)}
            placeholder="День месяца"
          />
        </div>

        {/* Продолжительность звонка */}
        <div className={styles.formGroup}>
          <label htmlFor="duration">Продолжительность звонка</label>
          <Input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration || ""}
            onChange={(value) => handleInputChange("duration", value)}
            placeholder="Длительность звонка"
          />
        </div>

        {/* Кампания */}
        <div className={styles.formGroup}>
          <label htmlFor="campaign">Кампания</label>
          <Input
            type="number"
            id="campaign"
            name="campaign"
            value={formData.campaign || ""}
            onChange={(value) => handleInputChange("campaign", value)}
            placeholder="Число контактов во время кампании"
          />
        </div>

        {/* pdays */}
        <div className={styles.formGroup}>
          <label htmlFor="pdays">Pdays</label>
          <Input
            type="number"
            id="pdays"
            name="pdays"
            value={formData.pdays || ""}
            onChange={(value) => handleInputChange("pdays", value)}
            placeholder="Количество дней с прошлого контакта"
          />
        </div>

        {/* previous */}
        <div className={styles.formGroup}>
          <label htmlFor="previous">Previous</label>
          <Input
            type="number"
            id="previous"
            name="previous"
            value={formData.previous || ""}
            onChange={(value) => handleInputChange("previous", value)}
            placeholder="Число контактов до кампании"
          />
        </div>

        {/* is_employed */}
        <div className={styles.formGroup}>
          <label htmlFor="is_employed">Работает</label>
          <SelectBox
            options={binaryOptions}
            selected={binaryOptions.find((opt) => opt.id === formData.is_employed) || null}
            placeholder="Работает?"
            onChange={(opt) => opt && handleInputChange("is_employed", opt.id)}
          />
        </div>

        {/* Месяц */}
        <div className={styles.formGroup}>
          <label htmlFor="month_int">Месяц</label>
          <SelectBox
            options={monthOptions.map((_, i) => ({
              id: String(i + 1),
              text: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"][i]
            }))}
            selected={monthOptions.find((opt) => opt.id === formData.month_int) || null}
            placeholder="Выберите месяц"
            onChange={(opt) => opt && handleInputChange("month_int", opt.id)}
          />
        </div>

        {/* Кнопка отправки */}
        <div className="flex" style={{ justifyContent: "center", width: "100%", padding: ".5rem 0" }}>
          <Button type="submit" disabled={!allFieldsFilled || fetching}>
            {fetching ? "Загрузка..." : "Предсказать"}
          </Button>
        </div>
      </form>

      {/* Результат предсказания */}
      {predictionResult && (
        <div className={styles.result}>
          <h1 className="text-xl font-bold mb-4">Результат предсказания</h1>
          <p>
            Вероятность подписки:{" "}
            <strong>{(predictionResult.raw_prediction * 100).toFixed(2)}%</strong>
          </p>
          <p>
            Предположение:{" "}
            <strong>
              {predictionResult.deposit_subscribed ? "Оформит депозит" : "Не оформит депозит"}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}