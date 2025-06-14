"use client";
import React, { useEffect, useRef, useState } from "react";
import classNames from "../../../../node_modules/classnames/index";

import styles from "./Input.module.css";

import Option from "./Input/types.ts";

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

export function MultipleBox({options, selected, placeholder="Выберите несколько", onChange, closeAfterSelect=true, limit}: {options: Option[], selected: Option[], placeholder?: String, onChange: any, closeAfterSelect?: Boolean, limit?: Number}){
    const [focused, updateFocused] = useState(false);
    const [empty, updateEmpty] = useState(selected==[]);

    const optionsRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState("0px");

    useEffect(() => {
      if (focused && optionsRef.current) {
        const scrollHeight = optionsRef.current.scrollHeight;
        setHeight(`${scrollHeight}px`);
      } else {
        setHeight("0px");
      }
    }, [focused, options]);

    function changeStatus(option: Option){
        if(selected.some(sel => sel.id === option.id)){
            var result_array = selected.filter((item)=>item.id!=option.id);
            onChange(result_array);
            updateEmpty(result_array.length==0);
        }else{
            if(limit){
                if(selected.length+1<=limit){
                    onChange([...selected, option]);
                    updateEmpty(false);
                }
            }else{
                onChange([...selected, option]);
                updateEmpty(false);
            }
            
        }
        
    }

    return <div className={styles.selectBox_container}>
        <div onClick={(e)=>updateFocused(!focused)} className={classNames(styles.inputBox, styles.selectBox, {[styles.active]: focused, [styles.empty]: selected.length==0})}>
            <div className={styles.inputBoxLabel}>{placeholder}</div>
            <div className={styles.inputBoxField}>{selected.map((sel)=>sel.text+", ")}</div>
            <ChevronDownIcon className={classNames("w-5", "h-5", styles.inputBoxIcon)} />

        </div>
        <div className={styles.selectBox_options} style={{height: height }} ref={optionsRef}>
            {options.map((option)=>(
                <div key={"multi_option_"+option.id} className={classNames(styles.selectBox_option, {[styles.selected]: selected.some(sel => sel.id === option.id)})} onClick={()=>changeStatus(option)}><div>{option.text}</div><CheckIcon className={classNames("w-5 h-5", styles.optionIcon)} /></div>
            )
            )}
            
        </div>
    </div>;
}