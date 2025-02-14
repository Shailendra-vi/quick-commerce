import { connectToDatabase } from "@/lib/mongodb";
import Orders from "@/models/Orders";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Customer ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { message: "Customer ID not found" },
        { status: 400 }
      );
    }
    if (user.role !== "customer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let orders = await Orders.find({ customerId: id }).sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
