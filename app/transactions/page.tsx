import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-table";
import { transactionColumns } from "./_columns";
import AddTransactionButton from "../_components/add-transaction-button";
import Navbar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ScrollArea } from "../_components/ui/scroll-area";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";

import { Prisma } from "@prisma/client";
import TransactionMonthFilter from "./_components/transaction-month-filter";

interface SearchParams {
  month?: string;
}

interface TransactionsPageProps {
  searchParams: SearchParams;
}

const TransactionsPage = async ({ searchParams }: TransactionsPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const selectedMonth = searchParams.month;

  const where: Prisma.TransactionWhereInput = {
    userId,
  };

  if (selectedMonth) {
    const year = new Date().getFullYear();

    const startDate = new Date(`${year}-${selectedMonth}-01`);

    const lastDay = new Date(year, parseInt(selectedMonth), 0).getDate();

    where.date = {
      gte: startDate,
      lte: new Date(`${year}-${selectedMonth}-${lastDay}T23:59:59.999Z`),
    };
  }

  const transactions = await db.transaction.findMany({ where });
  const userCanAddTransaction = await canUserAddTransaction();

  return (
    <>
      <Navbar />
      <div className="space-y-6 overflow-hidden p-6">
        {/* TÍTULO, FILTRO E BOTÃO */}
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Transações</h1>
          <div className="flex items-center gap-4">
            <TransactionMonthFilter />
            <AddTransactionButton
              userCanAddTransaction={userCanAddTransaction}
            />
          </div>
        </div>
        <ScrollArea className="col-span-2 h-full rounded-md border pb-6">
          <DataTable columns={transactionColumns} data={transactions} />
        </ScrollArea>
      </div>
    </>
  );
};

export default TransactionsPage;
