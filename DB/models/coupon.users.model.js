import { Schema, Types, model  } from "mongoose";

const CouponUsersSchema = new Schema(
{
code: {
    type: Types.ObjectId,
    ref: "coupon",
    required: true,
},
userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
},
maxUsage: {
    type: Number,
    required: true,
    min: 1,
},
useageCount: {
    type: Number,
    default: 0,
},
},
{ timestamps: true, strictQuery: true }
);

const CouponUsers = model("couponUser", CouponUsersSchema)
export default CouponUsers ;
