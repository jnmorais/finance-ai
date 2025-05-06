import AddTransactionButton from "@/app/_components/add-transaction-button";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import type { ReactNode } from "react";

interface SummaryCardProps {
  icon: ReactNode;
  title: string;
  amount: number;
  className?: string;
  bg?: "primary" | "secondary";
  size?: "small" | "large";
  userCanAddTransaction?: boolean;
}

const SummaryCard = ({
  icon,
  title,
  amount,
  bg,
  size = "small",
  userCanAddTransaction,
}: SummaryCardProps) => {
  return (
    <Card
      className={`${size === "large" || title === "Investido" ? "bg-white bg-opacity-5" : ""}`}
    >
      <CardHeader className="flex-row items-center justify-between gap-2 p-1">
        <div className="flex flex-row items-center gap-2">
          <div
            className={`${
              bg === "primary"
                ? "bg-primary/10 hover:bg-primary/10"
                : bg === "secondary"
                  ? "bg-danger/10 hover:bg-danger/10"
                  : "bg-white/10 hover:bg-white/10"
            } text-${bg} rounded-lg p-2`}
          >
            {icon}
          </div>
          <p
            className={`text-sm ${size === "small" ? "text-muted-foreground max-[459px]:text-xs max-[403px]:text-[11px]" : "text-white opacity-70"}`}
          >
            {title}
          </p>
        </div>
        {size === "large" && (
          <AddTransactionButton userCanAddTransaction={userCanAddTransaction} />
        )}
      </CardHeader>
      <CardContent className="flex justify-between p-2">
        <div className="flex flex-row items-center gap-4">
          <p
            className={`font-bold ${size === "small" ? "text-2xl max-lg:text-xl max-[501px]:text-lg max-[458px]:text-sm" : "text-4xl"}`}
          >
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
