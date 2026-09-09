import { notFound } from "next/navigation";
import { getTransactionsById } from "@/services/transaction.service";
type PageProps = {
  params: Promise<{ id: string }>;
};
export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const transaction = await getTransactionsById(id);
  if (!transaction) {
    notFound();
  }
  return <div>tes</div>;
}
