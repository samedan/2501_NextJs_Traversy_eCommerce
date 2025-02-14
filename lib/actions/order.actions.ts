"use server";

import { isRedirectError } from "next/dist/client/components/redirect";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

// Create ORDER and Create the Order Items
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");
    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");
    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }
    // If no error Create Order
    const createdOrder = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });
    // Create a Transaction (prisma) to create Order and Order Items in DBB
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // 'tx' comes from Prisma Transaction
      // Create order
      const insertedOrder = await tx.order.create({ data: createdOrder });
      // Create the Order Items from the cart Items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      // Clear the Cart in the DBB
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });
      // If All Succesfull
      return insertedOrder.id;
    });
    if (!insertedOrderId) throw new Error("Order not created");
    return {
      success: true,
      message: "Order created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// get Order by ID
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true, // returns all order items
      user: { select: { name: true, email: true } },
    },
  });

  return convertToPlainObject(data);
}

// Create a New PayPal Order
export async function createPayPalOrder(orderId: string) {
  try {
    // get order from teh DBB
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });
    if (order) {
      // Create PayPal Order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
      // Update order with paypal order Id
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: 0,
          },
        },
      });
      return {
        success: true,
        message: "Item order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ApprouvePayPal Order & Update order to 'PAID' (isPaid in the DBB)
// orderId (client), orderID (paypal sent)
export async function approuvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    // get order from teh DBB
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");
    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Error in PayPal payment");
    }
    // Update order to PAID in DBB
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });
    // relidate same Path
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Your order has been paid" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update order to PAID
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // get order from teh DBB
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderitems: true },
  });
  if (!order) throw new Error("Order not found");

  if (order.isPaid) throw new Error("Order already paid");
  // Transaction to Update Order and Account for the product stock
  await prisma.$transaction(async (tx) => {
    // Iterate over products and update stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: { stock: { increment: -item.qty } },
      });
    }
    // Set the order to PAID
    await tx.order.update({
      where: { id: orderId },
      data: { isPaid: true, paidAt: new Date(), paymentResult: paymentResult },
    });
  });
  // get Updated Order after transaction (to reload the page)
  const updatedOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!updatedOrder) throw new Error("Order not found");
}

// Get User's Orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not authorized");
  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id! },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });
  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id! },
  });

  return { data, totalPages: Math.ceil(dataCount / limit) };
}

// TYPE
type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// ADMIN : Get Sales data and Orer Summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();
  // Calculate for total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });
  // Get Monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`
        SELECT to_char("createdAt", 'MM/YY') as "month",
        sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')
      `;
  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));
  // get the latest Sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
}

// ADMIN: get All Orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });
  const dataCount = await prisma.order.count();

  return { data, totalPages: Math.ceil(dataCount / limit) };
}

// ADMIN: Delete an Order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    // refresh page
    revalidatePath("/admin/order");
    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ADMIN Update COD (CashOnDelivery) order to Paid
export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Order marked as paid" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ADMIN Update COD order to Delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");
    await prisma.order.update({
      where: { id: orderId },
      data: { isDelivered: true, deliveredAt: new Date() },
    });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Order marked as delivered" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
