import { randomBytes } from "crypto";

export function generateToken(length = 10) {
  return randomBytes(length).toString("hex");
}
