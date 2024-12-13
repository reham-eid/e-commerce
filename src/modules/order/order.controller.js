import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { Cart } from "../../../DB/models/cart.model.js";
import Order from "../../../DB/models/order.model.js";
import Product from "../../../DB/models/product.model.js";
import createInvoice from "../../services/trmpInvoices/pdfInvoice.js";
import { ApiFeature } from "../../utils/ApiFeature.js";
import { CouponValidation } from "../coupon/service/coupon.service.js";
import { orderStatus, payStatus } from "../../utils/system.roles.js";
import CouponUsers from "../../../DB/models/coupon.users.model.js";
import { QRgeneration } from "../../utils/qr-code.js";
import {
  confirmPaymentIntent,
  createCheckoutSession,
  createCouponSession,
  createPaymentIntent,
  refundPaymentIntent,
} from "../../payment-handler/stripe.js";
import generateUniqueString from "../../utils/generateUniqueString.js";
import { sendEmail } from "../../services/emails/sendEmail.js";
import {LoggerService} from "../../services/logger/logger.service.js";

const logger = new LoggerService('orderLogger.controller')

const createOrder = asyncHandler(async (req, res, next) => {
  const {
    couponCode,
    payment,
    phoneNumbers,
    city,
    street,
    productId,
    quantity,
  } = req.body;
  const { _id: user } = req.user;
  // check on coupon
  let coupon = null;
  if (couponCode) {
    const couponValid = await CouponValidation(couponCode, user);
    if (couponValid.status) {
      return res.status(couponValid.status).json(couponValid);
    }
    coupon = couponValid;
  }
  // check productId if exisit or not
  const product = await Product.findById(productId);
  if (!product) return next(new Error("product not found", { cause: 404 }));
  // check productQuantity
  if (!product.inStock(quantity)) {
    return next(
      new Error(`sorry, only ${product.quantity} items is avaliable`, {
        cause: 400,
      })
    );
  }
  // object of cart
  const cartObj = [
    {
      productId,
      quantity,
      name: product.title,
      description: product.description,
      price: product.priceAfterDiscount,
    },
  ];
  //calc totalOrderPrice
  let totalOrderPrice = cartObj[0].itemPrice * quantity;
  let totalOrderPriceAfterDiscount = totalOrderPrice;
  if (coupon?.isFixed && totalOrderPrice < coupon?.discount) {
    return next(new Error("cant use this coupon", { cause: 400 }));
  }
  if (coupon?.isFixed) {
    totalOrderPriceAfterDiscount = totalOrderPrice - coupon.discount;
  } else if (coupon?.isPercentage) {
    totalOrderPriceAfterDiscount =
      totalOrderPrice - (totalOrderPrice * coupon.discount) / 100;
  }
  //paymentMethod + status
  let statusOfOrder;
  if (payment == payStatus.cash) statusOfOrder = orderStatus.placed;
  if (payment == payStatus.stripe) statusOfOrder = orderStatus.pending;

  //create order
  const newOrder = {
    user,
    cart: cartObj,
    shippingAddress: { city, street },
    phoneNumbers,
    payment,
    totalOrderPrice,
    coupon: coupon?._id,
    totalOrderPriceAfterDiscount,
    payment,
    statusOfOrder,
  };
  const order = await Order.create(newOrder);
  product.quantity -= quantity;
  await product.save();
  const QRorder = await QRgeneration([
    {
      ID: order._id,
      user: order.user,
      totalPrice: order.totalOrderPrice,
      statusOfOrder: order.statusOfOrder,
    },
  ]);
  res
    .status(201)
    .json({ message: "order created succeccfully ", order, QRorder });
});

const createCashOrderFromCart = asyncHandler(async (req, res, next) => {
  const { couponCode, payment, phoneNumbers, city, street, quantity } =
    req.body;
  const { _id: user } = req.user;
  const { id } = req.params;
  // get cart from user and check
  const isCart = await Cart.findOne({ _id: id, user });
  if (!isCart) return next(new Error("cart not found", { cause: 404 }));
  // check on coupon
  let coupon = null;
  if (couponCode) {
    const couponValid = await CouponValidation(couponCode, user);
    if (couponValid.status) {
      return res.status(couponValid.status).json(couponValid);
    }
    coupon = couponValid;
  }
  // order object
  let cart = isCart.cartItems.map((item) => {
    return {
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      description: item.description,
      productId: item.productId,
    };
  });
  //calc totalOrderPrice
  let totalOrderPrice = isCart.totalPrice;
  let totalOrderPriceAfterDiscount = totalOrderPrice;

  if (coupon?.isFixed && totalOrderPrice < coupon?.discount) {
    return next(new Error("cant use this coupon", { cause: 400 }));
  }
  if (coupon?.isFixed) {
    totalOrderPriceAfterDiscount = totalOrderPrice - coupon.discount;
  } else if (coupon?.isPercentage) {
    totalOrderPriceAfterDiscount =
      totalOrderPrice - (totalOrderPrice * coupon.discount) / 100;
  }
  //paymentMethod + status
  let status;
  if (payment == payStatus.cash) status = orderStatus.placed;
  if (payment == payStatus.stripe) status = orderStatus.pending;

  //create order
  const newOrder = {
    user,
    cart,
    shippingAddress: { city, street },
    phoneNumbers,
    totalOrderPrice,
    coupon: coupon?._id,
    totalOrderPriceAfterDiscount,
    payment,
    statusOfOrder: status,
  };
  const order = await Order.create(newOrder);

  //increment sold & decrement quantity in products
  for (const item of order.cart) {
    await Product.updateOne(
      { _id: item.productId, quantity: { $gt: 1 } },
      { $inc: { quantity: -item.quantity, sold: item.quantity } }
    );
  }

  if (coupon) {
    await CouponUsers.updateOne(
      { code: coupon._id, userId: user },
      { $inc: { maxUsage: 1 } }
    );
  }
  //create invoice
  const orderCode = `${req.user.username}_${generateUniqueString(3)}`;
  const invoice = {
    shipping: {
      name: req.user.username,
      address: order.shippingAddress.street,
      country: order.shippingAddress.city,
    },
    items: order.cart.map(({ name, description, quantity, price }) => ({
      item: name,
      description: description,
      quantity: quantity,
      amount: price,
    })),
    subtotal: order.totalOrderPrice, //before discount
    paid: order.totalOrderPriceAfterDiscount, //after discount
    invoice_nr: order._id,
  };
  // logger.info("Invoice>>> " , invoice)
  const newInvoice = createInvoice(invoice, `${orderCode}.pdf`); //
  //send invoice at email
  const isEmail = await sendEmail({
    to: req.user.email,
    subject: "confirm your order...",
    html: `<h1>please find your pdf invoice below...</h1>`,
    attatchments: [
      {
        path: `../../services/trmpInvoices/files/${orderCode}.pdf`,
      },
    ],
  });
  if (!isEmail) {
    return next(new Error("Email Confirmatiom is not send", { cause: 500 }));
  }
  // clear cart
  // await Cart.findOneAndDelete({ user: req.user._id });
  // send res
  res.status(201).json({ message: "order created", order });
  req.savedDocument = { model: Order, condition: order._id };
});
const deliveredOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { _id: user } = req.user;
  const order = await Order.findOneAndUpdate(
    { _id: id, status: { $in: [orderStatus.paid, orderStatus.placed] } },
    {
      status: orderStatus.delivered,
      isDelivered: true,
      deliveredAt: Date.now(),
      deliveredBy: user,
    },
    { new: true }
  );
  if (!order) return next(new Error("order cant be deliverd", { cause: 404 }));
  res.status(200).json({ message: "order is delivered now ", order });
});
const OneOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ user: req.user._id })
    .populate("cart.productId")
    .lean();
  if (!order) return next(new Error("no result", { cause: 404 }));
  res.status(200).json({ message: "your Order ", order });
});

const allOrders = asyncHandler(async (req, res, next) => {
  let apiFeature = new ApiFeature(Order.find({}), req.query)
    .fields()
    .sort()
    .pagination()
    .filter();
  const orders = await apiFeature.mongoQuery.populate("cart.productId").lean();
  res.status(200).json({ message: "your Order ", orders });
});

const payWithStripe = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { _id: user } = req.user;
  // check order details
  const isOrder = await Order.findOne({
    _id: orderId,
    user,
    statusOfOrder: orderStatus.pending,
  });
  if (!isOrder) {
    return next(new Error("order not found or cant be paid", 404));
  }
  const paySessionObj = {
    metadata: { OrderId: isOrder._id.toString() },
    customer_email: req.user.email,
    client_reference_id: user,
    discounts: [],
    line_items: isOrder.cart.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          unit_amount: item.price * 100, //cents
          product_data: {
            name: item.name,
          },
        },
        quantity: item.quantity,
      };
    }),
  };
  if (isOrder.coupon) {
    const couponSession = await createCouponSession({
      couponId: isOrder.coupon,
    });
    if (couponSession.status) {
      return next({ message: couponSession.message, cause: 400 });
    }
    paySessionObj.discounts.push({
      coupon: couponSession.id,
    });
  }
  const checkoutSession = await createCheckoutSession(paySessionObj);
  const paymentIntent = await createPaymentIntent({
    amount: isOrder.totalOrderPriceAfterDiscount,
    currency: "EGP",
  });
  isOrder.payment_intent = paymentIntent.id;
  await isOrder.save();
  res.status(200).json({ message: "success", checkoutSession, paymentIntent });
});

const stripeWebhookLocal = asyncHandler(async (req, res, next) => {
  const orderId = req.body.data.object.metadata.OrderId;
  // console.log("webhook :  ", req.body.data.object.metadata.OrderId);

  const confirmOrder = await Order.findById(orderId);
  if (!confirmOrder) {
    return next(new Error("order not found", { cause: 404 }));
  }
  // console.log("confirmOrder :  ", confirmOrder);
  const confirmPaymentIntentDetails = await confirmPaymentIntent({
    paymentIntentID: confirmOrder.payment_intent,
  });
  // console.log(confirmPaymentIntentDetails);

  confirmOrder.statusOfOrder = orderStatus.paied;
  confirmOrder.paidAt = Date.now();
  confirmOrder.isPaid = true;
  await confirmOrder.save();
  res.status(200).json({ message: "webhook received" });
});

const stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type == "checkout.session.async_payment_failed") {
    const orderId = event.data.object.metadata.OrderId;
    await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        statusOfOrder: orderStatus.failedToPaied,
        isPaid: false,
      }
    );
    return;
  } else if (event.type == "checkout.session.completed") {
    const orderId = event.data.object;
    await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        statusOfOrder: orderStatus.paied,
        isPaid: true,
        paidAt: Date.now(),
      }
    );
    return;
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }
});
const refundOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { _id: user } = req.user;
  // check if order can refund or not
  const isOrder = await Order.findOne({ _id: orderId, user, isPaid: true });
  if (!isOrder) {
    return next(new Error("order not found or cant be refund", { cause: 404 }));
  }
  // refund order
  const refundedOrder = await refundPaymentIntent({
    paymentIntentID: isOrder.payment_intent,
  });
  //update order status
  isOrder.statusOfOrder = orderStatus.refunded;
  await isOrder.save();

  res.status(200).json({
    message: "order refunded successfully",
    refundOrder: refundedOrder,
  });
});
export {
  stripeWebhookLocal,
  stripeWebhook,
  createOrder,
  createCashOrderFromCart,
  deliveredOrder,
  payWithStripe,
  refundOrder,
  OneOrder,
  allOrders,
};
