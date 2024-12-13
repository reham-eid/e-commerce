export const systemRoles = {
  user: "User",
  admin: "Admin",
  delievery: "Delievery",
};
Object.freeze(systemRoles);

export const status = {
  online: "Online",
  offline: "Offline",
  blocked: "Blocked",
  softDelete: "soft Deleted",
};
Object.freeze(status);

export const orderStatus = {
  placed: "Placed",
  pending:"Pending",
  canclled: "Canclled",
  delivered:"Delivered",
  refunded: "Refunded", 
  paied:"Visa Paied",
  failedToPaied:"Failed to Paied",
};
Object.freeze(orderStatus);

export const payStatus = {
  cash:"Cash",
  stripe: "Stripe",
  paymob:"Paymob"
};
Object.freeze(payStatus);

