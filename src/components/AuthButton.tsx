"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, Star } from "lucide-react";
import Script from "next/script";

export function AuthButton() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const order = await res.json();
      
      if (order.error) {
        alert(order.error);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC variable in real env
        amount: order.amount,
        currency: order.currency,
        name: "FileShare Pro",
        description: "1 Month Premium Subscription",
        order_id: order.orderId,
        handler: function (response: any) {
          alert("Payment successful! You are now a Pro user.");
          window.location.reload();
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: {
          color: "#4f46e5", // Indigo-600
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    }
  };

  if (loading) return null;

  if (session) {
    const isPro = (session as any).isPro;
    return (
      <div className="flex items-center gap-2">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        {!isPro && (
          <button
            onClick={handleCheckout}
            className="flex items-center gap-1 h-8 sm:h-9 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs sm:text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <Star size={16} />
            <span className="hidden sm:inline">Upgrade to Pro</span>
          </button>
        )}
        {isPro && (
          <div className="flex items-center gap-1 h-8 sm:h-9 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs sm:text-sm font-bold shadow-sm">
            <Star size={16} />
            <span className="hidden sm:inline">PRO</span>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="h-8 w-8 sm:h-9 sm:w-auto px-0 sm:px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold bg-[var(--badge-bg)] border-[var(--border-color)] border hover:bg-[var(--border-color)] active:scale-95 transition-all duration-200 shadow-sm cursor-pointer shrink-0"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="h-8 w-8 sm:h-9 sm:w-auto px-0 sm:px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-extrabold bg-[var(--accent-indigo)] text-white hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer shrink-0"
    >
      <LogIn size={16} />
      <span className="hidden sm:inline">Login</span>
    </button>
  );
}
