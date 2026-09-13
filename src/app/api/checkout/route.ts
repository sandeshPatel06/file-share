export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // The cost in paise (e.g. 199 INR = 19900 paise)
    const amount = 19900;
    
    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_${uuidv4()}`,
      notes: {
        userId,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
