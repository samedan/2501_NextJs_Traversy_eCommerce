"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema } from "../validators";

// ADD TO CART
export async function addItemToCart(data: CartItem) {
  try {
    // Check for Cart Cookie
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("cart session not found");
    // Get Session and user ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    // Get cart
    const cart = await getMyCart();
    // Parse and validate item
    const item = cartItemSchema.parse(data);
    // Find product in DBB
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    // TESTING
    console.log({
      "Session Cart Id": sessionCartId,
      "User ID": userId,
      "Item requested": item,
      "Product found in DBB": product,
    });

    return {
      success: true,
      message: "Item added to cart",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// READ CART
export async function getMyCart() {
  // Check for Cart Cookie
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("cart session not found");
  // et Session and use ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;
  // get the cart from DBB
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;
  //  Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}
