import { Schema, Types, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    comment: {
      type: String,
      trim: true,
      minLength: [2, "too short Review comment "],
      maxLength: [500, "too long Review comment "],
    },
    rate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum:[1,2,3,4,5]
    },
    productId: {
      type: Types.ObjectId,
      ref: "product",
    },
    userId: {
      type: Types.ObjectId,
      ref: "user",
    },
    orderId: {
      type: Types.ObjectId,
      ref: "order",
    },
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
  },
  { timestamps: true, strictQuery: true }
);
ReviewSchema.pre(/^find/, function () {
  //['find','findOne'] it works with all or single
  this.populate("user", "username", "age");
});
const Review = model("review", ReviewSchema);
export default Review;
