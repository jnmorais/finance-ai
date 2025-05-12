"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type MonthOption = {
  value: string;
  label: string;
};

const MONTH_OPTIONS: MonthOption[] = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const TransactionMonthFilter = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const currentMonth = searchParams.get("month") || "all";

  useEffect(() => {
    if (!currentMonth || currentMonth === "all") {
      const now = new Date();
      const currentMonthNumber = String(now.getMonth() + 1).padStart(2, "0");

      const params = new URLSearchParams(searchParams.toString());
      params.set("month", currentMonthNumber);

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      push(newUrl);
    }
  }, [currentMonth, push, searchParams]);

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    push(newUrl);
  };

  return (
    <Select onValueChange={handleMonthChange} value={currentMonth}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por mês" />
      </SelectTrigger>
      <SelectContent>
        {MONTH_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TransactionMonthFilter;
