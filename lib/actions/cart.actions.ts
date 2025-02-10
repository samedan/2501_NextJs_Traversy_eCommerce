"use server";

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      // 'reduce' add everything together
      items.reduce(
        (accumulator, item) => accumulator + Number(item.price) * item.qty,
        0 // initial value of accumulator
      )
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

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
    // Add Price to DBB
    if (!product) throw new Error("Product not found");
    if (!cart) {
      // create new cart
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });
      // console.log(newCart);
      // Add Cart to database
      await prisma.cart.create({
        data: newCart,
      });
      // Revalidate product page (clear cache)
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // CHeck if Item is in the cart already
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );
      if (existItem) {
        // check stock
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }
        // increase quantity
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        // New item in cart
        // check stock
        if (product.stock < 1) throw new Error("Not enough stock");

        // add item to cart.items
        cart.items.push(item);
      }
      // save to DBB
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });
      revalidatePath(`/product/${product.slug}`);
      return {
        success: true,
        message: `${product.name} ${
          existItem ? " updated in" : " added to"
        } cart`,
      };
    }
    // TESTING
    // console.log({
    //   "Session Cart Id": sessionCartId,
    //   "User ID": userId,
    //   "Item requested": item,
    //   "Product found in DBB": product,
    // });
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
