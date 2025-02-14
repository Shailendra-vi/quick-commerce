import { connectToDatabase } from "@/lib/mongodb";
import Orders from "@/models/Orders";
import { getUserFromRequest, getUserIdFromRequest } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    
    const pendingProducts = await Orders.find({
      status: { $ne: "Delivered" },
      deliveryPartnerId: userId
    });

    return NextResponse.json(pendingProducts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
