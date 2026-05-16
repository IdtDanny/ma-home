import { PaymentProvider, PaymentRequest, PaymentResponse } from "./types"

interface MomoToken {
  access_token: string
  expires_in: number
}

export class MomoProvider implements PaymentProvider {
  private baseUrl: string
  private subscriptionKey: string
  private apiUser: string
  private apiKey: string
  private token: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.baseUrl = process.env.MOMO_API_BASE_URL!
    this.subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY!
    this.apiUser = process.env.MOMO_API_USER!
    this.apiKey = process.env.MOMO_API_KEY!
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) return this.token

    const credentials = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString("base64")
    const res = await fetch(`${this.baseUrl}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Ocp-Apim-Subscription-Key": this.subscriptionKey
      }
    })
    const data: MomoToken = await res.json()
    this.token = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // buffer
    return this.token!
  }

  async requestToPay(req: PaymentRequest): Promise<PaymentResponse> {
    const token = await this.getToken()
    const referenceId = req.externalId // our payment ID

    const body = {
      amount: req.amount.toString(),
      currency: req.currency,
      externalId: referenceId,
      payer: {
        partyIdType: "MSISDN",
        partyId: req.phone.replace("+", "")
      },
      payerMessage: req.payerNote || "MA Home bill payment",
      payeeNote: "MA Home"
    }

    const res = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": this.subscriptionKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    if (res.status === 202) {
      return { success: true, transactionId: referenceId, status: "PENDING" }
    } else {
      const err = await res.json()
      return { success: false, status: "FAILED" }
    }
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentResponse> {
    const token = await this.getToken()
    const res = await fetch(
      `${this.baseUrl}/collection/v1_0/requesttopay/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": this.subscriptionKey
        }
      }
    )
    const data = await res.json()
    // status can be PENDING, SUCCESSFUL, FAILED
    return {
      success: data.status === "SUCCESSFUL",
      transactionId,
      status: data.status
    }
  }
}