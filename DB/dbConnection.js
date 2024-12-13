import mongoose from "mongoose";

const connectDB = async () => {
  return await mongoose
    .connect(process.env.DB_LOCAL_URI)
    .then(() => console.log("connected to DB"))
    .catch((err) => console.log("faild to connect to DB", err));
};
export default connectDB;

