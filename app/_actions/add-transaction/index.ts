"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { addTransactionSchema } from "./schema";
import { revalidatePath } from "next/cache";

interface AddTransactionParams {
  name: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: TransactionPaymentMethod;
  date: Date;
  isRecurring?: boolean;
  recurrence?: "MONTHLY";
  endDate?: Date;
}

export const addTransaction = async (params: AddTransactionParams) => {
  addTransactionSchema.parse(params);

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (params.isRecurring && params.recurrence === "MONTHLY" && params.endDate) {
    const parentTransaction = await db.transaction.create({
      data: {
        ...params,
        userId,
      },
    });

    await createRecurringTransactions(parentTransaction.id, params, userId);
  } else {
    await db.transaction.create({
      data: { ...params, userId },
    });
  }

  revalidatePath("/");
  revalidatePath("/transactions");
};

async function createRecurringTransactions(
  parentId: string,
  params: AddTransactionParams,
  userId: string,
) {
  const startDate = new Date(params.date);
  const endDate = new Date(params.endDate!);

  const currentDate = new Date(startDate);
  currentDate.setMonth(currentDate.getMonth() + 1);

  while (currentDate <= endDate) {
    await db.transaction.create({
      data: {
        name: params.name,
        amount: params.amount,
        type: params.type,
        category: params.category,
        paymentMethod: params.paymentMethod,
        date: new Date(currentDate),
        userId: userId,
        isRecurring: false,
        parentId: parentId,
      },
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }
}
