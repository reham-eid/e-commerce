import { Cart } from "../../../../DB/models/cart.model.js";

export async function createCart(user , product, productId, quantity) {
  const cartObj ={
    user,
    cartItems: [
      {
        name: product.title,
        description: product.description,
        productId,
        quantity,
        price: product.priceAfterDiscount,
        finalPrice: product.priceAfterDiscount * quantity,
      },
    ],
    totalPrice: product.priceAfterDiscount * quantity,
  };
  const cart =await Cart.create(cartObj)
  return cart;
}
