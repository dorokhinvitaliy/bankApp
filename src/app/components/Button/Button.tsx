import classNames from "classnames/index";
import React from "react";
import styles from "./styles.module.css";
export default function Button({children, secondary=false, long=false, disabled=false, className="", ...props}:{children: React.ReactNode, secondary?: boolean, long?: boolean, disabled: boolean, className: any, props?: any}){
    return <button className={classNames(styles.button, {[styles.disabled]: disabled}, {[styles.secondary]: secondary}, {[styles.long]: long}, className)} {...props}>{children}</button>
}