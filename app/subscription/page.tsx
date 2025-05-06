import { auth, clerkClient } from "@clerk/nextjs/server";
import Navbar from "../_components/navbar";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import { Badge } from "../_components/ui/badge";
import { getCurrentMonthTransactions } from "../_data/get-current-month-transactions";
import AcquirePlanButton from "./components/acquire-plan-button";

const SubscriptionsPage = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const user = await (await clerkClient()).users.getUser(userId);
  const currentMonthTransactions = await getCurrentMonthTransactions();
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";

  return (
    <>
      <Navbar />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Assinatura</h1>

        <div className="flex gap-6 max-[540px]:flex-col max-[540px]:gap-3">
          <Card className="w-[450px] max-[540px]:mx-auto max-[540px]:w-[250px]">
            <CardHeader className="border-b border-solid py-8">
              <h2 className="text-center text-2xl font-semibold">
                Plano Básico
              </h2>
              <div className="flex flex-row items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">0</span>
                <span className="text-2xl text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-8 max-[540px]:py-4">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>
                  Apenas 15 transações por mês ({currentMonthTransactions}/15)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <XIcon className="text-danger" />
                <p>Relatórios de IA</p>
              </div>
            </CardContent>
          </Card>

          <Card className="w-[450px] max-[540px]:mx-auto max-[540px]:w-[250px]">
            <CardHeader className="relative border-b border-solid py-8">
              {hasPremiumPlan && (
                <>
                  <Badge className="absolute left-4 top-4 hidden bg-primary/10 text-primary hover:bg-muted min-[541px]:block">
                    Ativo
                  </Badge>

                  <div className="mb-2 block min-[541px]:hidden">
                    <Badge className="bg-primary/10 text-primary hover:bg-muted">
                      Ativo
                    </Badge>
                  </div>
                </>
              )}
              <h2 className="text-center text-2xl font-semibold">
                Plano Premium
              </h2>
              <div className="flex flex-row items-center justify-center gap-3">
                <span className="text-4xl">R$</span>
                <span className="text-6xl font-semibold">10</span>
                <span className="text-2xl text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 py-8 max-[540px]:py-4">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Transações ilimitadas</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="text-primary" />
                <p>Relatórios de IA</p>
              </div>
              <AcquirePlanButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SubscriptionsPage;
