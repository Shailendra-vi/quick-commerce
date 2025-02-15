import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.REFRESH_SECRET || !process.env.JWT_SECRET) {
      throw new Error("Secrets are not defined");
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET) as {
      _id: string;
    };

    const newAccessToken = jwt.sign(
      { _id: decoded._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({ token: newAccessToken });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 403 }
    );
  }
}
