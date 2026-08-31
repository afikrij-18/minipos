import {
    Boxes,
    CircleDollarSign,
    ReceiptText,
    TriangleAlert,
} from "lucide-react";

export default function DashboardPage() {
    const cards = [
        {
            label: "Total Produk",
            value: "0",
            icon: Boxes,
        },
        {
            label: "Transaksi Har ini",
            value: "0",
            icon: ReceiptText
        },
        {
            label: "Omzet hari ini",
            value: "Rp0",
            icon: CircleDollarSign
        },
        {
            label: "Stok Menipis",
            value: "0",
            icon: TriangleAlert
        }
    ];
  return (    
   <div>
    <div className="mb-7">
			<p className="text-sm font-bold text-indigo-600">
				OVERVIEW
			</p>
			<h1 className="mt-1 text-3x1 font-black tracking-tight">
				Dashboard
			</h1>
			<p className="mt-2 text-sm text-slate-500">
				Ringkasan aktivitas MiniPOS hari ini.
			</p>
		</div>
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div 
						key={card.label}
						className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
					>
						<div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
							<Icon size={19} />
						</div>

						<div className="mt-5 text-sm font-semibold text-slate-500">
							{card.label}
						</div>
					
					<div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
						{card.value}
					</div>
					</div>
				);
			})}

		</div>
   </div>   
  )
}
