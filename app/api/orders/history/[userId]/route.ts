import Orders from "@/models/Orders";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;
    const user = User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "Customer not present" },
        { status: 401 }
      );
    }

    const orders = await Orders.find({
      customerId: userId,
    });
    

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
