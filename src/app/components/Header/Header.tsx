"use client";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames/index";
import styles from "./styles.module.css";
import React from "react";
import { HomeIcon, ArrowTrendingUpIcon, FlagIcon, Cog8ToothIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';
import { usePathname } from "next/navigation";

export default function Header(){

    const pathname = usePathname();

    function HeaderLink({children, icon: Icon, way, active}:{children: React.ReactNode, icon: React.ElementType, way: string, active: boolean}){
        return <Link className={classNames(styles.headerLink, {[styles.active]: active})} href={way}><Icon className="h-5 w-5 stroke-2"></Icon><div>{children}</div></Link>;
    }

    function HeaderLogo(){
        return <Link className={classNames(styles.headerLogo)} href="/"><Image alt="root" width={100} height={100} src="/logo-giant.png"></Image></Link>;
    }

    function Group({children}:{children: React.ReactNode}){
        return <div className={styles.group}>{children}</div>
    }

    return <div className={styles.header}>
        <HeaderLogo></HeaderLogo>
        <Group>
            <HeaderLink active={pathname==="/"} way="/" icon={HomeIcon}>Главная</HeaderLink>
            <HeaderLink active={pathname==="/analysis"} way="/analysis" icon={ArrowTrendingUpIcon}>Анализ данных</HeaderLink>
            <HeaderLink active={pathname==="/reports"} way="/reports" icon={FlagIcon}>Отчеты</HeaderLink>
{/*             <HeaderLink active={pathname==="/settings"} way="/settings" icon={Cog8ToothIcon}>Настройка</HeaderLink> */}
            <HeaderLink active={pathname==="/predict"} way="/predict" icon={ArrowPathRoundedSquareIcon}>Предсказание</HeaderLink>
        </Group>

    </div>;

   
}