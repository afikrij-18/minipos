"use client";
export default function PrintButton() {
  return (
    <button
      type ="button"
      onClick={() => window.print()}
      className="rounded-xl bg-indigo-600 px-4 py-2 my-2 text-sm font-bold text-white"
    >
      Cetak Invoice
    </button>
  )
}