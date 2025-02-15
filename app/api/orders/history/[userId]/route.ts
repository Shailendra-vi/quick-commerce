import Orders from "@/models/Orders";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "Customer not present" },
        { status: 401 }
      );
    }

    let orders;
    if (user.role === "customer") {
      orders = await Orders.find({
        customerId: userId,
        status: "Delivered",
      }).populate("customerId", "name email").populate("productId", "name price");
    } else {
      orders = await Orders.find({
        deliveryPartnerId: userId,
        status: "Delivered",
      }).populate("customerId", "name email").populate("productId", "name price");
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
