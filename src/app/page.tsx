"use client";
import Image from "next/image";
import React, { useState } from "react";
import Header from "./components/Header";
import Block, { HGroup, VGroup } from "./components/PageLayout/Block";

import {
  ChartPieIcon,
  MagnifyingGlassIcon,
  PresentationChartBarIcon,
  CubeIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import Button from "./components/Button/index";
import styles from "./styles.module.css";
import classNames from "classnames/index";
import Input from "./components/Input";
import Uploader from "./components/Input/Uploader";
export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, updStatus] = useState(false);
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    console.log("Загружен файл:", file?.name);
  };

  const validateFile = (file: File | null) => {
    if (!file) { return "Файл не выбран"; }
    const maxSizeMB = 5;
    const isValidType = file.type === "text/csv";
    const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
    if (!(file.type === "text/csv")) {
      return "Тип файла не подходит";
    }
    if (!(file.size <= maxSizeMB * 1024 * 1024)) {
      return "Размер превышен";
    }
    return false;
  };

  const [resultBlock, resultBlockUpd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Сначала выберите файл");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
      mode: "cors"
    })
      .then((res) => res.json())
      .then((data) => {
        resultBlockUpd(true); console.log("Успешно загружено:", data);
      })
      .catch((err) => console.error("Ошибка загрузки:", err));
  };
  return (
    <main className={styles.main} style={{ padding: "1rem" }}>
      <Block gap={"5rem"} className={classNames(styles.upload, {[styles.done]: resultBlock})} style={{ justifyContent: "start" }}>
        <ArrowUpTrayIcon className="w-30 h-30" style={{ color: "#2558CF" }} />
        <VGroup style={{ gap: "1rem" }}>
          <p className={styles.title}>Загрузите файл для анализа прямо сейчас</p>
          <Uploader
            id="client-data"
            name="clientFile"
            placeholder="Выберите файл клиента"
            onChange={handleFileChange}
            validate={validateFile}
            status={status}
            helperText={selectedFile === null ? "Загрузите PDF или CSV, до 5MB" : validateFile(selectedFile) ? validateFile(selectedFile) : null}
          />
          <div className="flex gap-5"><Button onClick={(e) => handleSubmit(e)}>Отправить файлы</Button><Button secondary onClick={(e) => handleFileChange(null)}>Очистить файлы</Button></div>
        </VGroup>
      </Block>
      
      <HGroup className={styles.banner}>
        <Block>
          <Image alt={"arrow"} width={120} height={120} src={"/arrow-icon.svg"}></Image>
          <VGroup style={{ gap: 16 }}>
            <p style={{ color: "#2558CF" }}>Быстрое начало</p>
            <p>BanKer - лучший способ для анализа ваших клиентов.</p>
            <HGroup><Button>Начать</Button><Button secondary>Подробнее</Button></HGroup>
          </VGroup>
        </Block>

        <Block theme="blueInBlue" vertical style={{ alignItems: "start", gap: ".5rem" }}>
          <p style={{ color: "#2558CF" }}>Если коротко...</p>
          <p style={{ color: "#000" }}>Мы проанализировали уже</p>
          <div className="flex flex-row" style={{ alignItems: "end" }}>
            <p style={{ color: "#2558CF", fontSize: "4rem" }}>1,500</p>
            <p style={{ color: "#000", width: "100%", textAlign: "right" }}>записей</p>
          </div>
        </Block>
      </HGroup>

      <Block vertical theme={"blueFilled"} className={classNames(styles.left, styles.pBlock)}>
        <Image alt={"struct"} width={150} height={150} src={"/structure.svg"}></Image>
        <p>Обработка и визуализация данных о клиентах</p>
      </Block>

      <Block theme={"purpleFilled"} className={classNames(styles.right, styles.hBlock)}>
        <Image alt={"struct"} width={120} height={120} src={"/pie.svg"}></Image>
        <p>Формирование аналитических отчетов по клиентам </p>
      </Block>
      <Block theme={"blueInWhite"} className={classNames(styles.right2, styles.hBlock)}>
        <Image alt={"struct"} width={100} height={100} src={"/analytics.svg"}></Image>
        <p>Обработка и визуализация данных о клиентах</p>
      </Block>

      <Block theme={"blueInBlue"} className={classNames(styles.bottom, styles.hBlock)} style={{ gap: "3rem", justifyContent: "space-between" }}>
        <Image alt={"struct"} width={140} height={140} src={"/loop.svg"}></Image>
        <p>Проведение тщательного статистического анализа базы данных клиентов</p>
      </Block>



    </main>
  );
}
