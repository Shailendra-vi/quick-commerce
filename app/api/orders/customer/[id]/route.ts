import { connectToDatabase } from "@/lib/mongodb";
import Orders from "@/models/Orders";
import User from "@/models/User";
import { getUserIdFromRequest } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await segmentData.params;
    if (!id) {
      return NextResponse.json(
        { message: "Customer ID is required" },
        { status: 400 }
      );
    }

    const userId = getUserIdFromRequest(request);
    if (id !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user || user.role !== "customer") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const totalOrders = await Orders.countDocuments({
      customerId: id,
      status: { $ne: "Delivered" },
    });

    const orders = await Orders.find({
      customerId: id,
      status: { $ne: "Delivered" },
    })
      .populate("customerId", "name email")
      .populate("productId", "name price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
