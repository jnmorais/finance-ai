import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-table";
import { transactionColumns } from "./_columns";
import AddTransactionButton from "../_components/add-transaction-button";
import Navbar from "../_components/navbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import TransactionMonthFilter from "./_components/transaction-month-filter";
import { Prisma } from "@prisma/client";

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

  if (!searchParams.month) {
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");

    redirect(`/transactions?month=${currentMonth}`);
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

  const transactions = await db.transaction.findMany({
    where,
    orderBy: {
      date: "desc",
    },
  });

  const userCanAddTransaction = await canUserAddTransaction();

  return (
    <>
      <Navbar />
      <div className="flex flex-col space-y-6 p-6">
        {/* TÍTULO, FILTRO E BOTÃO */}
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Transações</h1>
          <div className="flex items-center gap-4">
            <TransactionMonthFilter />
            <AddTransactionButton
              userCanAddTransaction={userCanAddTransaction}
            />
          </div>
        </div>

        {/* Div container com overflow-auto para garantir rolagem em todas as telas */}
        <div className="max-h-[calc(100vh-200px)] w-full overflow-auto rounded-md border">
          {transactions.length === 0 && selectedMonth ? (
            <div className="flex h-40 w-full items-center justify-center text-muted-foreground">
              Não há transações nesse mês
            </div>
          ) : (
            <div className="min-w-full">
              <DataTable
                columns={transactionColumns}
                data={JSON.parse(JSON.stringify(transactions))}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;
