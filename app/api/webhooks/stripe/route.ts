import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook secret not found");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.error();
  }

  try {
    const text = await request.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    console.log(`Processando evento: ${event.type}`);

    // Manipular checkout.session.completed para obter clerk_user_id imediatamente
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerk_user_id;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      console.log(
        `Checkout completo - User: ${clerkUserId}, Sub: ${subscriptionId}, Customer: ${customerId}`,
      );

      if (clerkUserId && subscriptionId) {
        // Se a assinatura foi criada, vamos adicionar o clerk_user_id aos metadados da assinatura também
        // para garantir que eventos futuros possam acessá-lo
        if (subscriptionId) {
          try {
            await stripe.subscriptions.update(subscriptionId, {
              metadata: {
                clerk_user_id: clerkUserId,
              },
            });
            console.log(
              `Metadados da assinatura atualizados com clerk_user_id`,
            );
          } catch (e) {
            console.error("Erro ao atualizar metadados da assinatura:", e);
          }
        }

        // Atualizar o usuário no Clerk
        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
          publicMetadata: {
            subscriptionPlan: "premium",
          },
        });
        console.log("Usuário atualizado com sucesso no checkout");
      }

      return NextResponse.json({ received: true });
    }

    // Para o invoice.paid ignorar se não conseguirmos encontrar o clerk_user_id
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) {
        console.log("Invoice.paid: Sem ID de assinatura, ignorando");
        return NextResponse.json({ received: true });
      }

      try {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const clerkUserId = subscription.metadata?.clerk_user_id;

        if (!clerkUserId) {
          console.log(
            "Invoice.paid: clerk_user_id não encontrado na assinatura, ignorando pois já deve ter sido processado",
          );
          return NextResponse.json({ received: true });
        }

        //atualizar o usuário no Clerk
        console.log(`Invoice.paid: Atualizando usuário ${clerkUserId}`);
        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: subscription.customer as string,
          },
          publicMetadata: {
            subscriptionPlan: "premium",
          },
        });
        console.log("Invoice.paid: Usuário atualizado com sucesso");
      } catch (error) {
        console.error("Erro ao processar invoice.paid:", error);
        // Não vamos falhar o webhook, apenas registrar o erro
      }

      return NextResponse.json({ received: true });
    }
    if (event.type === "customer.subscription.deleted") {
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );
      const clerkUserId = subscription.metadata.clerk_user_id;
      if (!clerkUserId) {
        return NextResponse.error();
      }
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      });

      console.log(`Assinatura cancelada - usuário ${clerkUserId} atualizado`);

      return NextResponse.json({ received: true });
    }

    // Para outros eventos, apenas responder com sucesso
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Webhook error", details: (error as Error).message },
      { status: 400 },
    );
  }
};
