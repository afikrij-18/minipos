import React, { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export  function Button({
  className ="",
  variant = "primary",
  ... props
}: Props) {
  const styles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
    secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger:
    "bg-rose-600 text-white hover:bg-rose-700",
  }[variant];
  return(
    <button 
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed cursor-pointer ${styles} ${className}`}
      {...props} 
      />
  );
}
