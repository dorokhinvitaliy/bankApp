"use client";
import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import styles from "./Input.module.css"; // Можно переименовать, если нужно

type UploaderProps = {
  id: string;
  name: string;
  placeholder?: string;
  onChange: (file: File | null) => void;
  helperText?: string;
  validate?: (file: File | null) => boolean;
};

export default function Uploader({
  id,
  name,
  placeholder = "Загрузите файл",
  onChange,
  helperText,
  validate,
}: UploaderProps) {
  const [focused, setFocused] = useState(false);
  const [empty, setEmpty] = useState(true);
  const [status, setStatus] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const tipRef = useRef(null);
  const [tipHeight, setTipHeight] = useState("0px");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileName(file ? file.name : "");
    setEmpty(!file);
    onChange(file);

    if(validate){
        if (validate(file)) {
            setStatus(true); // true = ошибка
          }else{
            setStatus(false);
          }
    }
  };

  useEffect(() => {
    if (focused && tipRef.current) {
      const scrollHeight = (tipRef.current as HTMLElement).scrollHeight;
      setTipHeight(`${scrollHeight}px`);
    } else {
      setTipHeight("0px");
    }
  }, [focused, helperText]);

  return (
    <div
      className={classNames(styles.inputBox_container, styles.uploadBox, {
        [styles.tipActive]: helperText && focused,
      })}
    >
      <div
        className={classNames(styles.inputBox, {
          [styles.active]: focused,
          [styles.empty]: empty,
        })}
      >
        <label htmlFor={id} className={styles.inputBoxLabel}>
          {placeholder}
        </label>

        <input
          type="file"
          id={id}
          name={name}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={styles.inputBoxField}
          style={{height: "0px!important"}}
        />

        {fileName && <div className={styles.inputBoxFileName}>{fileName}</div>}

        {status && (
          <ExclamationTriangleIcon
            className={classNames(
              "w-5 h-5 text-red-500 stroke-5",
              styles.inputBoxIcon,
              styles.warn
            )}
          />
        )}
      </div>

      {helperText && (
        <div
          ref={tipRef}
          style={{ height: tipHeight }}
          className={styles.inputBox_tip}
        >
          <div>{helperText}</div>
        </div>
      )}
    </div>
  );
}
