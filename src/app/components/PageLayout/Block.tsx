import classNames from "classnames/index";
import React from "react";
import styles from "./styles.module.css";


export default function Block({children, className, theme="", gap="3rem", vertical=false, ...props}:{children: React.ReactNode, className?: string, theme?: string, gap?: string, vertical?:boolean, props?: any}){
    return <div className={classNames(styles.block, styles[theme], {[styles.vertical]: vertical}, className)} style={{gap: gap}} {...props}>
        {children}
    </div>
}

export function VGroup({children, className="", ...props}:{children: React.ReactNode, className?: string, props: any}){
    return <div className={classNames(styles.group, styles.v, className)} {...props}>
        {children}
    </div>
}

export function HGroup({children, className="", ...props}:{children: React.ReactNode, className?: string, props: any}){
    return <div className={classNames(styles.group, styles.h, className)} {...props}>
        {children}
    </div>
}