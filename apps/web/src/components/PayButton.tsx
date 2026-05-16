"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function PayButton({ billId }: { billId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    const res = await fetch("/api/payments/momo/initiate", {
      method: "POST",
      body: JSON.stringify({ billId }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Payment request sent! Confirm on your phone.");
      pollStatus(data.paymentId);
    } else {
      toast.error(data.error || "Payment failed");
      setLoading(false);
    }
  };

  const pollStatus = (paymentId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payments/momo/status?paymentId=${paymentId}`);
      const { status } = await res.json();
      if (status === "SUCCESSFUL") {
        toast.success("Payment successful!");
        router.refresh();
        clearInterval(interval);
        setLoading(false);
      } else if (status === "FAILED") {
        toast.error("Payment failed. Try again.");
        clearInterval(interval);
        setLoading(false);
      }
    }, 5000);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handlePay}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
    >
      <button
        onClick={handlePay}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : (
          "Pay with MoMo"
        )}
      </button>
    </motion.button>

  );
}