"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";

const SidebarSheet = () => {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Menu</SheetTitle>
        <SheetDescription />
      </SheetHeader>

      <div className="flex items-center justify-between gap-3 border-b border-solid py-5">
        <UserButton showName />
      </div>

      <div className="flex flex-col gap-2 border-b border-solid py-5">
        <Link
          href="/"
          className={
            pathname === "/"
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }
        >
          Dashboard
        </Link>

        <Link
          href="/transactions"
          className={
            pathname === "/transactions"
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }
        >
          Transações
        </Link>

        <Link
          href="/subscription"
          className={
            pathname === "/subscription"
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }
        >
          Assinatura
        </Link>
      </div>

      <Button className="mt-4" variant="ghost" onClick={handleSignOut}>
        <LogOutIcon />
        Sair
      </Button>
    </SheetContent>
  );
};

export default SidebarSheet;
