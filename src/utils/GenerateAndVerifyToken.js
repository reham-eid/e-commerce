import jwt from "jsonwebtoken";

export const generateToken = ({  
  payload= {},
  signature = process.env.JWT_SECRET_KEY,
  expiresIn = "364d",
} = {}) => {
  const token = jwt.sign(payload, signature, {
    expiresIn,
  });
  return token;
};

export const verifyToken = ({
  token,
  signature = process.env.JWT_SECRET_KEY,
} = {}) => {
  const payload = jwt.verify(token, signature);
  return payload;
};
