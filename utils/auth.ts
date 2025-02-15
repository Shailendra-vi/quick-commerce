import { User } from "@/types/type";
import * as jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export function verifyToken(token: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not defined");
  }
  // const JWT_SECRET = "Shailendra@JWT"

  return jwt.verify(token, process.env.JWT_SECRET);
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}

export function getUserIdFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (!token) return null;

    try {
      const decoded = verifyToken(token) as { _id: string };
      return decoded._id;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (!token) return null;

    try {
      const decoded = decodeToken(token) as User;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
