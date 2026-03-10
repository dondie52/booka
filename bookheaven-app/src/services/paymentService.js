/**
 * Payment Service
 *
 * Modular payment interface. Swap the active provider
 * via setProvider() to integrate a real gateway.
 */

const PAYMENT_METHODS = {
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  BANK_TRANSFER: 'bank_transfer',
}

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

const defaultProvider = {
  name: 'Default',

  async processPayment({ amount, method, customerInfo }) {
    await new Promise(resolve => setTimeout(resolve, 1500))

    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      amount,
      method,
      status: method === PAYMENT_METHODS.CASH_ON_DELIVERY
        ? PAYMENT_STATUS.PENDING
        : PAYMENT_STATUS.COMPLETED,
      timestamp: new Date().toISOString(),
    }
  },

  async getPaymentStatus(transactionId) {
    return { transactionId, status: PAYMENT_STATUS.COMPLETED }
  },

  getSupportedMethods() {
    return [
      { id: PAYMENT_METHODS.CARD, label: 'Credit / Debit Card' },
      { id: PAYMENT_METHODS.MOBILE_MONEY, label: 'Mobile Money' },
      { id: PAYMENT_METHODS.CASH_ON_DELIVERY, label: 'Cash on Delivery' },
      { id: PAYMENT_METHODS.BANK_TRANSFER, label: 'Bank Transfer' },
    ]
  },
}

let activeProvider = defaultProvider

const paymentService = {
  PAYMENT_METHODS,
  PAYMENT_STATUS,

  setProvider(provider) {
    activeProvider = provider
  },

  getProvider() {
    return activeProvider
  },

  getSupportedMethods() {
    return activeProvider.getSupportedMethods()
  },

  async processPayment(paymentDetails) {
    return activeProvider.processPayment(paymentDetails)
  },

  async getPaymentStatus(transactionId) {
    return activeProvider.getPaymentStatus(transactionId)
  },
}

export default paymentService
