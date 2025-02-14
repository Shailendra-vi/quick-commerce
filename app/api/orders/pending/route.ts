import { connectToDatabase } from "@/lib/mongodb";
import Orders from "@/models/Orders";
import { getUserFromRequest } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const pendingProducts = Orders.find({
      status: "Pending",
      deliveryPartnerId: user?._id,
    });

    return NextResponse.json(pendingProducts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
