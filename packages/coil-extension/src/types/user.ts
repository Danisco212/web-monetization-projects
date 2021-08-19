export interface User {
  id: string
  fullName: string
  email: string
  customerId?: string
  canTip?: boolean
  subscription?: {
    active: boolean
    endDate?: string
    trialEndDate?: string
  }
  invitation?: {
    usedAt: string
  }
  currencyPreferences?: {
    code: string
    scale: number
  }
  tipping?: {
    limitRemaining: string
  }
  minimumTipLimit?: number
  tipSettings?: {
    inTippingBeta?: boolean
    minimumTipLimit: number
    remainingDailyAmount: number
    hotkeyTipAmounts: Array<number>
  }
  paymentMethods?: Array<IUserPaymentMethod>
}

interface IUserPaymentMethod {
  id: string
  type: string
  details: {
    last4: string
    brandCode: string
  } | null
}
