import Stripe from "stripe";
import Coupon from "../../DB/models/coupon.model.js";
//create stripe Checkout Session
export const createCheckoutSession = async ({
  metadata,
  customer_email,
  client_reference_id,
  discounts,
  line_items,
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // create session
  const session = await stripe.checkout.sessions.create({
    line_items,
    payment_method_types: ["card"],
    mode: "payment",
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    discounts,
    customer_email,
    client_reference_id,
    metadata,
  });
  //send res
  return session;
};
//create stripe Coupon Session
export const createCouponSession = async ({ couponId }) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return { status: false, message: "coupon not found" };
  }
  let couponObj = {};
  if (coupon.isFixed) {
    couponObj = {
      amount_off: coupon.discount * 100,
      currency: "EGP",
      name: coupon.code,
    };
  }
  if (coupon.isPercentage) {
    couponObj = {
      percent_off: coupon.discount,
      name: coupon.code,
    };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // create session
  const couponSession = await stripe.coupons.create(couponObj);
  return couponSession;
};
//create stripe Payment Method
export const createPaymentMethod = async ({ token }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: {
      token,
    },
  });
  return paymentMethod;
};
//create stripe Payment Intent
export const createPaymentIntent = async ({ amount, currency }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentMethod = await createPaymentMethod({ token: "tok_visa" });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    payment_method: paymentMethod.id,
  });
  return paymentIntent;
};
//retrieve a stripe Payment Intent
export const retrievePaymentIntent = async ({ paymentIntentID }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);
  return paymentIntent;
};
//confirm a stripe Payment Intent
export const confirmPaymentIntent = async ({ paymentIntentID }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntentDetails = await retrievePaymentIntent({ paymentIntentID });
  const paymentIntent = await stripe.paymentIntents.confirm(
    paymentIntentDetails.id, //or paymentIntentID
    {
      payment_method: paymentIntentDetails.payment_method,
    }
  );
  return paymentIntent;
};
//refund a stripe Payment Intent
export const refundPaymentIntent = async ({ paymentIntentID }) => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentID,
  });
  return refund;
};
