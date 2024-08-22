import jwt from 'jsonwebtoken';

const {
  JWT_KEY,
} = process.env;

export default function jwtSign(payload) {
  return jwt.sign(payload, JWT_KEY);
}
