import { connectToDatabase } from "@/lib/mongodb";
import Orders from "@/models/Orders";
import { getUserIdFromRequest } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { getIo } from "@/lib/socket";
import { Server as SocketIOServer } from "socket.io";


export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = await params;
      const userId = getUserIdFromRequest(request);
      if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  
      if (!id) {
        return NextResponse.json(
          { message: "Order ID is required" },
          { status: 400 }
        );
      }
  
      const { status } = await request.json();
      if (!status) {
        return NextResponse.json(
          { message: "Order status is required" },
          { status: 400 }
        );
      }
  
      await connectToDatabase();
  
      const order = await Orders.findById(id).populate("customerId", "name email").populate("productId", "name price");
      if (!order) {
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
      }
  
  
      if (order.deliveryPartnerId.toString() !== userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  
      order.status = status;
      await order.save();
      
      const io: SocketIOServer = getIo();
      io.to(order.customerId._id.toString()).emit("orderUpdate", order);
  
      return NextResponse.json(
        { message: "Order status updated successfully", order },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: "Internal server error", error: (error as Error).message },
        { status: 500 }
      );
    }
  }
  