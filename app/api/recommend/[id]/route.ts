import Orders from "@/models/Orders";
import Products from "@/models/Products";
import { getUserIdFromRequest } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ollama } from "ollama";

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await segmentData.params;
    const userId = getUserIdFromRequest(request);

    if (userId !== id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await Orders.find({ customerId: id }).populate("productId");

    const purchasedCategories = [
      ...new Set(
        orders
          .map((order) => order.productId?.category?.trim())
          .filter((cat): cat is string => Boolean(cat))
      ),
    ];

    if (!purchasedCategories.length) {
      return NextResponse.json(
        { message: "No purchase history found" },
        { status: 404 }
      );
    }

    const allCategories = await Products.distinct("category");

    if (!allCategories.length) {
      return NextResponse.json(
        { message: "No categories found in the product database" },
        { status: 404 }
      );
    }

    const prompt = `A customer has purchased products from these categories: ${purchasedCategories.join(
      ", "
    )}. Here are all available product categories in our store: ${allCategories.join(
      ", "
    )}. Based strictly on the customer's purchase history, suggest 3-5 similar or complementary product categories from the available categories. Respond only with a comma-separated list of categories, nothing else.`;
    let suggestedCategories: string[] = [];

    if (process.env.MODEL === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { message: "API key not found" },
          { status: 500 }
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const messageContent = result.response.text().trim();

      if (!messageContent) {
        return NextResponse.json(
          { message: "No recommendations found" },
          { status: 404 }
        );
      }

      suggestedCategories = allCategories
        .filter((cat) =>
          messageContent.toLowerCase().includes(cat.toLowerCase())
        )
        .slice(0, 5);
    } else {
      const ollama = new Ollama();
      const model = process.env.OLLAMA_MODEL || "deepseek-r1:latest";
      const response = await ollama.chat({
        model: model,
        messages: [{ role: "user", content: prompt }],
      });

      suggestedCategories = response.message.content.split(", ");
    }

    if (!suggestedCategories.length) {
      return NextResponse.json(
        { message: "No matching recommendations found" },
        { status: 404 }
      );
    }

    // Fetch recommended products based on suggested categories
    const recommendedProducts = await Products.find({
      category: { $in: suggestedCategories },
    })
      .limit(5)
      .lean();

    return NextResponse.json({ recommendedProducts });
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
