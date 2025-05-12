"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";
import { upsertTransactionSchema } from "./schema";
import { revalidatePath } from "next/cache";

interface UpsertTransactionParams {
  id?: string;
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

export const upsertTransaction = async (params: UpsertTransactionParams) => {
  upsertTransactionSchema.parse(params);
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (params.isRecurring && params.recurrence === "MONTHLY" && params.endDate) {
    if (params.id) {
      const updatedParent = await db.transaction.update({
        where: {
          id: params.id,
        },
        data: {
          ...params,
          userId,
        },
      });

      await db.transaction.deleteMany({
        where: {
          parentId: params.id,
        },
      });

      await createRecurringTransactions(updatedParent.id, params, userId);
    } else {
      const parentTransaction = await db.transaction.create({
        data: {
          ...params,
          userId,
        },
      });

      await createRecurringTransactions(parentTransaction.id, params, userId);
    }
  } else {
    if (params.id) {
      await db.transaction.upsert({
        update: { ...params, userId },
        create: { ...params, userId },
        where: {
          id: params.id,
        },
      });
    } else {
      await db.transaction.create({
        data: { ...params, userId },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/transactions");
};

async function createRecurringTransactions(
  parentId: string,
  params: UpsertTransactionParams,
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
