import { Cart } from "../../../DB/models/cart.model.js";
import Product from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { pricCalc } from "./services/calcPrice.service.js";
import { createCart } from "./services/create.cart.service.js";

const addCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  // check productId if exisit or not
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found", { cause: 404 }));
  // check productQuantity
  if (!product.inStock(quantity))
    return next(
      new Error(`sorry, only ${product.quantity} items is avaliable`, {
        cause: 400,
      })
    );
  // one cart per user
  const isCart = await Cart.findOne({ user: req.user._id });
  // check if cart exisit or not

  //if not exisit {create cart with first product}
  if (!isCart) {
    const cart = await createCart(req.user._id, product, productId, quantity);
    // rollback middleware
    req.savedDocument = { model: Cart, condition: cart._id };
    res.status(201).json({ message: "added to cart successfully ", cart });
  } else {
    //if exisit { push new product}{if product>> check quantity in db >> ++ quantity }
    // find if body.product === cartItems.product (same product)
    let item = isCart.cartItems.find((i) => i.productId == productId); // shallow copy

    //then add quantity in one product
    if (item) {
      //check quantity in db مع كل مره بيزود
      if (item.quantity > product.quantity)
        return next(new Error("product sold out"));
      item.quantity += quantity || 1;
      item.finalPrice += item.price * quantity;
      // calc with new quantity & save in db
      await pricCalc(isCart);
    }

    // else push new product to cartItems
    else {
      isCart.cartItems.push({
        name: product.title,
        description: product.description,
        productId: productId,
        quantity: quantity,
        price: product.priceAfterDiscount,
        finalPrice: product.priceAfterDiscount * quantity,
      });
      // calc with new quantity & save in db
      await pricCalc(isCart);
    }

    // rollback middleware
    req.savedDocument = { model: Cart, condition: isCart._id };
    // send res
    res
      .status(201)
      .json({ message: "added to cart successfully ", cart: isCart });
  }
});
const removeItemFromCart = asyncHandler(async (req, res, next) => {
  // check productId if exisit or not
  const product = await Product.findById(req.params.id);
  if (!product) return next(new Error("product not found", { cause: 404 }));

  const cart = await Cart.findOne({
    user: req.user._id,
    "cartItems.productId": req.params.id,
  });
  if (!cart) {
    return res
      .status(404)
      .json({ message: "cart Not found or product not found in this cart" });
  }
  if (cart.cartItems.length === 0) {
    await cart.deleteOne();
    return res.status(404).json({
      status: "Seccuss",
      message: "cart is empty",
    });
  }
  cart.cartItems = cart.cartItems.filter((item) => {
    item.productId.toString() !== req.params.id;
  });
  await pricCalc(cart); // reCalc
  res.status(200).json({ message: "product deleted from cart ", cart });
});

const updateQuantity = asyncHandler(async (req, res, next) => {
  // check productId if exisit or not
  const product = await Product.findById(req.params.id);
  if(!product) return next(new Error("product not found", { cause: 404 }));

  if (!product.inStock(req.body.quantity))
    return next(
      new Error(`sorry, only ${product.quantity} items is avaliable`, {
        cause: 400,
      })
    );
  // update quantity of this product id
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id, "cartItems.productId": req.params.id },
    { "cartItems.$.quantity": req.body.quantity },
    { new: true }
  );
  if (!cart) {
    return res
      .status(404)
      .json({ message: "cart Not found or product not found this cart" });
  }
  // calc price
  await pricCalc(cart);
  // save
  //send res
  res.status(200).json({ message: "cart : ", cart });
});

const getLogedUserCart = asyncHandler(async (req, res) => {
  // check cart
  const cart = await Cart.findOne({ user: req.user._id }).populate([
    { path: "cartItems.productId" },
  ]);
  //send res
  if (!cart) return res.status(404).json({ message: "cart Not found" });
  //cart && error cant set header
  res.status(200).json({ message: "cart : ", cart });
});

const getAllCart = asyncHandler(async (req, res, next) => {
  if (!req.params.id)
    return next(new Error("cart Id is required", { cause: 400 }));
  // check cart
  const cart = await Cart.findById(req.params.id).populate([
    { path: "cartItems.productId" },
  ]);
  //send res
  if (!cart) return res.status(404).json({ message: "cart Not found" });
  res.status(200).json({ message: "cart : ", cart });
});

const clearUserCart = asyncHandler(async (req, res) => {
  // check cart
  const cart = await Cart.findOneAndDelete({ user: req.user._id });
  //send res
  if (!cart) return res.status(404).json({ message: "cart Not found" });
  res.status(200).json({ message: "cart deleted successfully ", cart });
});
export {
  addCart,
  removeItemFromCart,
  updateQuantity,
  getAllCart,
  getLogedUserCart,
  clearUserCart,
};
