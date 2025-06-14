"use client";
import React, { useEffect, useRef, useState } from "react";
import classNames from "../../../../node_modules/classnames/index";
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import styles from "./Input.module.css";

export default function Input({id, name, type="text", value, onChange, placeholder="Поле ввода", helperText, validate}:{id: string, name: string, type: string, value: any, onChange: any, placeholder: String, helperText?: String, validate: any}){
    const [focused, updateFocused] = useState(false);
    const [empty, updateEmpty] = useState(value=="");
    const tipRef = useRef(null);
    const [tipHeight, setTipHeight] = useState("0px");
    const [status, changeStatus] = useState(false);

    function checkValid(value){
        if (validate){
            if(validate(value)){ // error message is not empty
                changeStatus(true);
                
            }else{
                changeStatus(false);
            }
        }
    }

    useEffect(()=>{
        if (focused && tipRef.current) {
            const scrollHeight = tipRef.current.scrollHeight;
            setTipHeight(`${scrollHeight}px`);
          } else {
            setTipHeight("0px");
          }
    }, [focused]);

    return <div className={classNames(styles.inputBox_container, {[styles.tipActive]: helperText && focused})}>
        <div className={classNames(styles.inputBox, {[styles.active]: focused, [styles.empty]: empty})}>
        <label htmlFor={id} className={styles.inputBoxLabel}>{placeholder}</label>
        <input type={type} id={id} name={name} value={value} onChange={(e)=>{onChange(e.target.value);updateEmpty(e.target.value=="");checkValid(e.target.value);}} onFocus={(e)=>updateFocused(true)} onBlur={(e)=>updateFocused(false)} className={styles.inputBoxField} />
        { status && <ExclamationTriangleIcon className={classNames("w-5 h-5 text-red-500 stroke-5", styles.inputBoxIcon, styles.warn)} />}
    </div>
    {helperText && <div ref={tipRef} style={{height: tipHeight}} className={styles.inputBox_tip}><div>{helperText}</div></div>}
    </div>;
}