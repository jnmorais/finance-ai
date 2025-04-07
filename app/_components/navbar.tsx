"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between border-b border-solid px-8 py-4">
      {/* ESQUERDA */}
      <div className="flex items-center gap-10">
        <Image src="/logo.svg" alt="Logo" width={173} height={39} />
        <Link
          href="/"
          className={pathname === "/" ? "text-white" : "text-muted-foreground"}
        >
          Dashboard
        </Link>
        <Link
          href="/transactions"
          className={
            pathname === "/transactions"
              ? "text-white"
              : "text-muted-foreground"
          }
        >
          Transações
        </Link>
        <Link
          href="/subscription"
          className={
            pathname === "/subscription"
              ? "text-white"
              : "text-muted-foreground"
          }
        >
          Assinatura
        </Link>
      </div>
      {/* DIREITA */}
      <UserButton />
    </nav>
  );
};

export default Navbar;
