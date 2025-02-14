import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/Products";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, getUserIdFromRequest } from "@/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { name, price } = await request.json();
    console.log("DATA: ", name, price);
    if (!name || !price) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectToDatabase();

    const newProduct = new Product({
      name,
      price,
      createdBy: userId,
    });

    await newProduct.save();
    const products = await Product.find();
    return NextResponse.json({ products }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.createdBy.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Product.findByIdAndDelete(id);
    const products = await Product.find();
    return NextResponse.json(
      { message: "Product deleted successfully", products },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    await connectToDatabase();
    let products;
    if (user.role === "customer") {
      products = await Product.find().lean();
    } else {
      products = await Product.find({ createdBy: user._id }).lean();
    }

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
