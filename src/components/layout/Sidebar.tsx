"use client";
import React from 'react'
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";

const menu = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/products",
    label: "Produk",
    icon: Boxes,
  },
  {
    href: "/transactions/new",
    label: "Kasir / POS",
    icon: ShoppingCart,
  },
  {
    href: "/transactions",
    label: "Riwayat",
    icon: ReceiptText,
  }
];

function Sidebar() {
  const pathname = usePathname();
 

  return (
        <aside className='bg-slate-950 text-white lg:min-h-screen lg:w-64'>
          <div className='p-5'>
            <div className='text-xl font-black'>
              MiniPOS
            </div>

            <div className='mt-1 text-xs text-slate-400'>
              Bootcamp Project
            </div>
          </div>

          <nav className='grid gap-2 px-4'>
            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || 
             (
            item.href !== "/dashboard" && pathname.startsWith(item.href)
            );

              return (
                <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
                >
                  <Icon size={18} />

                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
  )
}

export default Sidebar
