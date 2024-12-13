import { Schema, Types, model } from "mongoose";
import { orderStatus, payStatus } from "../../src/utils/system.roles.js";

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "user",
    },
    cart: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        name: String,
        description: String,
        price: Number,
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    totalOrderPrice: {
      type: Number,
      required: true,
    },
    coupon: {
      type: Types.ObjectId,
      ref: "coupon",
    },
    totalOrderPriceAfterDiscount: {
      //totalOrderPrice - coupon
      type: Number,
      required: true,
    },
    payment_intent:String,
    invoice: {
      url: { type: String },
      id: { type: String },
    },
    payment: {
      type: String,
      enum: Object.values(payStatus),
      required: true,
    },
    statusOfOrder: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.pending,
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    deliveredBy: { type: Types.ObjectId, ref: "user" },
    canclledAt: Date,
    canclledBy: { type: Types.ObjectId, ref: "user" },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
  },
  { timestamps: true, strictQuery: true }
);

export default model("order", orderSchema);
//mongoose.models.order ||
