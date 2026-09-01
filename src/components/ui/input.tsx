import React from 'react'
import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
}

export function Input({
    label,
    error,
    className = "",
    ...props
}: Props) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
        {label && <span>{label}</span>}
    <input 
        className={`min-h-11 rounded-xl border border-slate-200 bg-white px-3 outline-none trasition placeholder:text-slate-400 focus:border=indigo-500 focus:ring-4 focus-ring-indigo-100 ${className}`}
        {...props}
    />

    {error && (
        <span className='text-xs text-rose-600'>
            {error}
        </span>
    )}
    </label>
  );
}
