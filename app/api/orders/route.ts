import { connectToDatabase } from "@/lib/mongodb";
import Order from "@/models/Orders";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/utils/auth";
import Products from "@/models/Products";
import User from "@/models/User";
import { getIo } from "@/lib/socket";
import { Server as SocketIOServer } from "socket.io";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { productId, quantity, location } = await request.json();
    if (!productId || !quantity || !location) {
      return NextResponse.json({ message: "Missing fields" }, { status: 404 });
    }

    await connectToDatabase();

    const product = await Products.findById(productId);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const deliveryPartner = await User.findById(product.createdBy.toString());

    const newOrder = new Order({
      customerId: userId,
      deliveryPartnerId: deliveryPartner._id,
      productId,
      quantity,
      location,
      status: "Pending",
    });

    await newOrder.save();
    const io: SocketIOServer = getIo();
    io.to(newOrder.deliveryPartnerId.toString()).emit("newOrder", newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
