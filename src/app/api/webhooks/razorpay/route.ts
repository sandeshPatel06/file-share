export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      // We stored userId in notes when creating the order
      const userId = paymentEntity.notes.userId;
      
      if (userId) {
        // Grant 1 month access for the payment
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + 1);
        
        // Upsert subscription logic
        const existingSub = await db.prepare("SELECT id FROM subscriptions WHERE userId = ?").get(userId) as { id: string } | undefined;
        if (existingSub) {
          await db.prepare("UPDATE subscriptions SET status = 'active', currentPeriodEnd = ? WHERE id = ?").run(
            currentDate.toISOString(),
            existingSub.id
          );
        } else {
          await db.prepare("INSERT INTO subscriptions (id, userId, status, plan, currentPeriodEnd) VALUES (?, ?, ?, ?, ?)").run(
            uuidv4(),
            userId,
            "active",
            "pro",
            currentDate.toISOString()
          );
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
