"use client";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames/index";
import styles from "./styles.module.css";
import React from "react";
import { HomeIcon, ChartBarIcon, FlagIcon, Cog8ToothIcon } from '@heroicons/react/24/solid';
import { usePathname } from "next/navigation";

export default function Header(){

    const pathname = usePathname();

    function HeaderLink({children, icon: Icon, way, active}:{children: React.ReactNode, icon: React.ElementType, way: string, active: boolean}){
        return <Link className={classNames(styles.headerLink, {[styles.active]: active})} href={way}><Icon className="h-5 w-5"></Icon><div>{children}</div></Link>;
    }

    function HeaderLogo(){
        return <Link className={classNames(styles.headerLogo)} href="/analysis"><Image alt="root" width={100} height={100} src="/logo-giant.png"></Image></Link>;
    }

    function Group({children}:{children: React.ReactNode}){
        return <div className={styles.group}>{children}</div>
    }

    return <div className={styles.header}>
        <HeaderLogo></HeaderLogo>
        <Group>
            <HeaderLink active={pathname==="/"} way="/" icon={HomeIcon}>Главная</HeaderLink>
            <HeaderLink active={pathname==="/analysis"} way="/analysis" icon={ChartBarIcon}>Анализ данных</HeaderLink>
            <HeaderLink active={pathname==="/reports"} way="/reports" icon={FlagIcon}>Отчеты</HeaderLink>
{/*             <HeaderLink active={pathname==="/settings"} way="/settings" icon={Cog8ToothIcon}>Настройка</HeaderLink> */}
            <HeaderLink active={pathname==="/predict"} way="/predict" icon={Cog8ToothIcon}>Предсказание</HeaderLink>
        </Group>

    </div>;

   
}