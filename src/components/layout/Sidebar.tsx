"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

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
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="border-b border-slate-200 bg-slate-950 text-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:border-slate-800">
      <div className=" flex item-center justify-between p-5 lg:block">
        <div>
          <div className="text-xl font-black">MiniPOS</div>
          <div className="mt-1 text-xs text-slate-400">Bootcamp Project</div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      <nav className="grid gap-2 px-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}
            >
              <Icon size={18} />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden p-4 lg:block">
        <button onClick={handleLogout} className="flex w-full item-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white">
          <LogOut size={18} />
        </button>

      </div>
    </aside>
  );
}
