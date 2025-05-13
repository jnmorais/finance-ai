import { Button } from "@/app/_components/ui/button";
import UpsertTransactionDialog from "@/app/_components/upsert-transaction-dialog";
import { Transaction } from "@prisma/client";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

interface EditTransactionButtonProps {
  transaction: Transaction;
}

const EditTransactionButton = ({ transaction }: EditTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const prepareTransactionData = () => {
    return {
      ...transaction,
      amount: Number(transaction.amount),

      recurrence: transaction.recurrence || undefined,
      endDate: transaction.endDate || undefined,
      parentId: transaction.parentId || undefined,
    };
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() => setDialogIsOpen(true)}
      >
        <PencilIcon />
      </Button>
      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        defaultValues={prepareTransactionData()}
        transactionId={transaction.id}
      />
    </>
  );
};

export default EditTransactionButton;
