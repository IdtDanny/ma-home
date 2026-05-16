import { MomoProvider } from "./momo"
import { PaymentProvider } from "./types"

export function getPaymentProvider(method: "MOMO" | "AIRTEL"): PaymentProvider {
  if (method === "MOMO") return new MomoProvider()
  // Airtel implementation here later
  throw new Error("Unsupported payment method")
}