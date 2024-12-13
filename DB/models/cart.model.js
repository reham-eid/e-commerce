import { Schema, Types, model } from "mongoose";

const CartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "user",
      unique: true, // one cart per user
    },
    cartItems: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "product",
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
          default: 0,
        },
        finalPrice: {
          // price * quantity
          type: Number,
          required: true,
        },
        name: {
          type: String,
          unique: [true, "Product title already Exisit "],
          trim: true,
          required: true,
          maxLength: 50,
          minLength: [2, "too short of Product title "],
        },
        description: {
          type: String,
          required: true,
          maxLength: 100,
          minLength: [10, "too short of Product description "],
        },
      },
    ],
    totalPrice: Number
  },
  {
    timestamps: true,
    strictQuery: true,
  }
);

export const Cart = model("cart", CartSchema);
