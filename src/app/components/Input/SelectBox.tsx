"use client";
import React, { useEffect, useRef, useState } from "react";
import classNames from "../../../../node_modules/classnames/index";

import styles from "./Input.module.css";

import Option from "./Input/types.ts";

import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

export function SelectBox({options, selected, placeholder, onChange, closeAfterSelect=true}: {options: Option[], selected: Option, placeholder: String, onChange: any, closeAfterSelect: Boolean}){
    const [focused, updateFocused] = useState(false);
    const [empty, updateEmpty] = useState(selected==null);

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

    return <div className={styles.selectBox_container}>
        <div onClick={(e)=>updateFocused(!focused)} className={classNames(styles.inputBox, styles.selectBox, {[styles.active]: focused, [styles.empty]: empty})}>
            <div className={styles.inputBoxLabel}>{placeholder}</div>
            <div className={styles.inputBoxField}>{selected?.text}</div>
            <ChevronDownIcon className={classNames("w-5", "h-5", styles.inputBoxIcon)} />

        </div>
        <div className={styles.selectBox_options} style={{height: height }} ref={optionsRef}>
            {options.map((option)=>(
                <div key={"option_"+option.id} className={classNames(styles.selectBox_option, {[styles.selected]: option.id==selected?.id})} onClick={()=>{onChange(option);updateEmpty(false);updateFocused(!closeAfterSelect);}}><div>{option.text}</div><CheckIcon className={classNames("w-5 h-5", styles.optionIcon)} /></div>
            )
            )}
            
        </div>
    </div>;
}