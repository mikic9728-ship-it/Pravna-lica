import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={twMerge('rounded-2xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5', className)} {...props} />; }
