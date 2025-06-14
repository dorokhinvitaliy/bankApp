"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import Input from "../components/Input";
import { MultipleBox } from "../components/Input/MultipleBox";
import { SelectBox } from "../components/Input/SelectBox";
import Button from "../components/Button";
import Block from "../components/PageLayout";
import styles from "./styles.module.css";
import classNames from "classnames/index";

type RowData = { [key: string]: any };

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

const decodeValue = (key: string, val: any) => {
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

export default function AnalysisPage() {
  const [data, setData] = useState<RowData[]>([]);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVisibility, updateFilterVisibility] = useState(true);

  // Форма фильтра
  const [formData, setFormData] = useState({
    age: "",
    sex: [],
    marital: null,
    education: null,
    default: null,
    balance: "",
    housing: null,
    loan: null,
    day: "",
    duration: "",
    campaign: "",
    pdays: "",
    previous: "",
    is_employed: null,
    month_int: null,
  });

  useEffect(() => {
    fetch("http://127.0.0.1:5000/table")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setFilteredData(json);
      })
      .catch((err) => console.error("Ошибка загрузки:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (value: any, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    console.log(value, field);
    setTimeout(() => console.log(formData));
  };

  const removeFilter = () => {
    setFormData({
      age: "",
      sex: [],
      marital: null,
      education: null,
      default: null,
      balance: "",
      housing: null,
      loan: null,
      day: "",
      duration: "",
      campaign: "",
      pdays: "",
      previous: "",
      is_employed: null,
      month_int: null,
    });
  };
  // Функция фильтрации
  const applyFilter = () => {
    const filtered = data.filter((row) => {
      // Числовые поля
      if (formData.age && row.age !== Number(formData.age)) return false;
      if (formData.balance && row.balance !== Number(formData.balance)) return false;
      if (formData.day && row.day !== Number(formData.day)) return false;
      if (formData.duration && row.duration !== Number(formData.duration)) return false;
      if (formData.campaign && row.campaign !== Number(formData.campaign)) return false;
      if (formData.pdays && row.pdays !== Number(formData.pdays)) return false;
      if (formData.previous && row.previous !== Number(formData.previous)) return false;

      // Категориальные поля (SelectBox)
      if (formData.marital?.id && row.marital !== Number(formData.marital.id)) return false;
      if (formData.education?.id && row.education !== Number(formData.education.id)) return false;
      if (formData.default?.id && row.default !== Number(formData.default.id)) return false;
      if (formData.housing?.id && row.housing !== Number(formData.housing.id)) return false;
      if (formData.loan?.id && row.loan !== Number(formData.loan.id)) return false;
      if (formData.is_employed?.id && row.is_employed !== Number(formData.is_employed.id)) return false;
      if (formData.month_int?.id && row.month_int !== Number(formData.month_int.id)) return false;

      // Пол (MultipleBox)

      return true;
    });

    setFilteredData(filtered);
  };


  /* const hiddenKeys = ["pdays", "previous", "month_int", "campaign", "day", "default"]; */ // добавь сюда всё, что хочешь скрыть
  const hiddenKeys = [];

  const columns = useMemo<ColumnDef<RowData>[]>(
    () =>
      data[0]
        ? Object.keys(data[0])
          .filter((key) => !hiddenKeys.includes(key)) // <--- фильтруем лишние
          .map((key) => ({
            accessorKey: key,
            header: headersMap[key] ?? key,
            cell: (info) => {
              const val = info.getValue();
              return decodeValue(key, val);
            },
          }))
        : [],
    [data]
  );


  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={styles.main}>
      <Button onClick={()=>updateFilterVisibility(true)} className={classNames(styles.invisibleButton, {[styles.hidden]: filterVisibility})}>Открыть меню фильтров</Button>
      {/* Левая колонка — таблица */}
      <div className={styles.tableColumn}>
        <h1 className="text-2xl font-bold mb-4">Анализ клиентов</h1>
        {loading ? (
          <p>Загрузка...</p>
        ) : filteredData.length === 0 ? (
          <p>Данные не найдены по фильтру</p>
        ) : (
          <div className="overflow-y-auto">
            <table className={styles.table}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className={styles.headerRow}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className={styles.cell}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={styles.row}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={styles.cell}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>

      {/* Правая колонка — фильтры */}
      <div className={classNames(styles.filterColumn, {[styles.hidden]: !filterVisibility})}>
        <Block vertical={true} gap=".5rem" className={styles.filterBlock}>
          <p className={styles.blockTitle}>Фильтр</p>

          <Input
            name="age"
            id="age"
            placeholder="Возраст"
            value={formData.age}
            onChange={(val) => handleChange(val, "age")}
            helperText="Введите точный возраст"
          />

          <SelectBox
            placeholder="Семейное положение"
            options={[
              { id: "", text: "Все" },
              { id: "0", text: "Холост" },
              { id: "1", text: "Женат" },
              { id: "2", text: "Разведён" },
            ]}
            selected={formData.marital}
            onChange={(val) => handleChange(val, "marital")}
          />

          <SelectBox
            placeholder="Образование"
            options={[
              { id: "", text: "Все" },
              { id: "0", text: "Начальное" },
              { id: "1", text: "Среднее" },
              { id: "2", text: "Высшее" },
            ]}
            selected={formData.education}
            onChange={(val) => handleChange(val, "education")}
          />

          {/* <SelectBox
            placeholder="Дефолт"
            options={[
              { id: "", text: "Все" },
              { id: "1", text: "Да" },
              { id: "0", text: "Нет" },
            ]}
            selected={formData.default}
            onChange={(val) => handleChange(val, "default")}
          /> */}

          <Input
            name="balance"
            id="balance"
            placeholder="Баланс"
            value={formData.balance}
            onChange={(val) => handleChange(val, "balance")}
            helperText="Введите точное значение"
          />

          <SelectBox
            placeholder="Ипотека"
            options={[
              { id: "", text: "Все" },
              { id: "1", text: "Да" },
              { id: "0", text: "Нет" },
            ]}
            selected={formData.housing}
            onChange={(val) => handleChange(val, "housing")}
          />

          <SelectBox
            placeholder="Кредит"
            options={[
              { id: "-1", text: "Все" },
              { id: "1", text: "Да" },
              { id: "0", text: "Нет" },
            ]}
            selected={formData.loan}
            onChange={(val) => handleChange(val, "loan")}
          />

          {/* <Input
            name="day"
            id="day"
            placeholder="День"
            value={formData.day}
            onChange={(val) => handleChange(val, "day")}
          /> */}

          <Input
            name="duration"
            id="duration"
            placeholder="Длительность"
            value={formData.duration}
            onChange={(val) => handleChange(val, "duration")}
          />

          <Input
            name="campaign"
            id="campaign"
            placeholder="Кампания"
            value={formData.campaign}
            onChange={(val) => handleChange(val, "campaign")}
          />

          {/* <Input
            name="pdays"
            id="pdays"
            placeholder="Pdays"
            value={formData.pdays}
            onChange={(val) => handleChange(val, "pdays")}
          /> */}

          <Input
            name="previous"
            id="previous"
            placeholder="Предыдущие контакты"
            value={formData.previous}
            onChange={(val) => handleChange(val, "previous")}
          />

          <SelectBox
            placeholder="Работает"
            options={[
              { id: "", text: "Все" },
              { id: "1", text: "Да" },
              { id: "0", text: "Нет" },
            ]}
            selected={formData.is_employed}
            onChange={(val) => handleChange(val, "is_employed")}
          />

          <SelectBox
            placeholder="Месяц"
            options={[
              { id: "", text: "Все" },
              { id: "1", text: "Январь" },
              { id: "2", text: "Февраль" },
              { id: "3", text: "Март" },
              { id: "4", text: "Апрель" },
              { id: "5", text: "Май" },
              { id: "6", text: "Июнь" },
              { id: "7", text: "Июль" },
              { id: "8", text: "Август" },
              { id: "9", text: "Сентябрь" },
              { id: "10", text: "Октябрь" },
              { id: "11", text: "Ноябрь" },
              { id: "12", text: "Декабрь" },
            ]}
            selected={formData.month_int}
            onChange={(val) => handleChange(val, "month_int")}
          />

          <div className={classNames(styles.filterButtons)}><Button long onClick={applyFilter}>Применить</Button><Button secondary onClick={()=>updateFilterVisibility(false)}>Скрыть</Button></div>
        </Block>
      </div>
    </div>
  );
}
