export interface PaymentRequest {
  amount: number
  currency: string // "RWF"
  externalId: string // our payment ID
  phone: string     // tenant's phone number (format: 25078xxxxxxx)
  payerNote?: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  status?: string
}

export interface PaymentProvider {
  requestToPay(req: PaymentRequest): Promise<PaymentResponse>
  getTransactionStatus(transactionId: string): Promise<PaymentResponse>
}