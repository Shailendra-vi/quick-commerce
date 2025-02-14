import { connectToDatabase } from "@/lib/mongodb";
import Orders from "@/models/Orders";
import { getUserFromRequest, getUserIdFromRequest } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { getIo } from "@/lib/socket";
import { Server as SocketIOServer } from "socket.io";
import User from "@/models/User";

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
    if(!user){
      return NextResponse.json(
        { message: "Customer ID not found" },
        { status: 400 }
      );
    }
    let orders 
    if(user.role === "customer"){
      orders = await Orders.find({ customerId: id }).sort({ createdAt: -1 });
    }else{
      orders = await Orders.find({ deliveryPartnerId: id }).sort({ createdAt: -1 });
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }
    await connectToDatabase();

    const order = await Orders.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 400 });
    }

    await Orders.findByIdAndDelete(id);

    const io: SocketIOServer = getIo();
    io.to(order.deliveryPartnerId.toString()).emit("orderDelete", id);

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}