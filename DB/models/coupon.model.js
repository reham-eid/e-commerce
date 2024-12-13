import { Schema, Types, model } from "mongoose";

const CouponSchema = new Schema(
  {
    code: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 8,
      unique:true,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 1,
    },
    isFixed:{
      type: Boolean,
      default:false
    },
    isPercentage:{
      type: Boolean,
      default:false
    },
    fromDate:{
      type: Date,
      required:true,
    },
    toDate:{
      type: Date,
      required:true,
    },
    couponStatus:{
      type:String,
      enum:['expired' , 'valid'],
      default:'valid'
    }, // change to couponStatus 
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true, strictQuery: true }
);

const Coupon = model("coupon", CouponSchema);
export default Coupon;
