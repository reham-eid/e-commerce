import { Schema, Types, model } from "mongoose";
import bcryptjs from "bcryptjs";
import { status, systemRoles } from "../../src/utils/system.roles.js";

const userSchema = new Schema(
  {
    username: String,
    profilePic: {
      url: { type: String },
      id: {
        type: String,
      },
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    changePassAt: Date,
    age: {
      type: Number,
      min: [10, "age not allowed"],
    },
    role: {
      type: String,
      enum: Object.values(systemRoles),
      default: systemRoles.user,
    },
    wishList: [
      {
        type: Types.ObjectId,
        ref: "product",
      },
    ],
    phone: {
      type: String,
      unique: true,
      trim: true,
    },
    addresses: [
      {
        street: String,
        city: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(status),
      default: status.offline,
    },
    isEmailConfirm: {
      type: Boolean,
      default: false,
    },
    forgetCode: {
      type: String,
      unique: false,
    },
    token: String,
    provider:{
      type:String,
      enum:["GOOGLE","System"],
      default:"System"
    }
  },
  { timestamps: true, strictQuery: true }
);
userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(this.password, +process.env.SALT);
  }
  return this;
});
userSchema.pre("findOneAndUpdate", function (next) {
  // console.log(this._update.password);
  if (this._update.password) {
    this._update.password = bcryptjs.hashSync(
      this._update.password,
      +process.env.SALT
    );
  }
  next()
});

const User = model("user", userSchema);
export default User;
