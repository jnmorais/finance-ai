import { z } from "zod";
import {
  RecurrenceType,
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";

export const addTransactionSchema = z
  .object({
    name: z.string().trim().min(1),
    amount: z.number().positive(),
    type: z.nativeEnum(TransactionType),
    category: z.nativeEnum(TransactionCategory),
    paymentMethod: z.nativeEnum(TransactionPaymentMethod),
    date: z.date(),
    isRecurring: z.boolean().optional(),
    recurrence: z.nativeEnum(RecurrenceType).optional(),
    endDate: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring) {
      if (!data.recurrence) {
        ctx.addIssue({
          code: "custom",
          message:
            "A recorrência é obrigatória quando a transação é recorrente.",
          path: ["recurrence"],
        });
      }
      if (!data.endDate) {
        ctx.addIssue({
          code: "custom",
          message:
            "A data final é obrigatória quando a transação é recorrente.",
          path: ["endDate"],
        });
      }
    }
  });
