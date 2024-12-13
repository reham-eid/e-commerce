import schedule from "node-schedule";
import Coupon from "../../DB/models/coupon.model.js";

export function job() {
  schedule.scheduleJob("*/10 * * * * *", async () => {
    console.log("copoun expiration!");
    const copoun = await Coupon.findOneAndUpdate(
      {
        toDate: { $lt: Date.now() },
        status: "valid",
      },
      {
        status: "expired",
      },
      { new: true }
    );
    console.log("done");
  });
}
