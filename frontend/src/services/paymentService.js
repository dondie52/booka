/**
 * Payment Service — Botswana
 *
 * Supports:
 * - DPO Pay (cards + mobile money via hosted payment page)
 * - Bank Transfer (manual confirmation)
 * - Cash on Delivery
 */

import dpoService from './dpoService'

const PAYMENT_METHODS = {
  DPO: 'dpo',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  BANK_TRANSFER: 'bank_transfer',
}

const PAYMENT_STATUS = {
  PENDING: 'pending',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

const WHATSAPP_NUMBER = '26776984827'

const paymentService = {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  WHATSAPP_NUMBER,

  getSupportedMethods() {
    const methods = []

    // DPO Pay — only show if Supabase is configured
    if (dpoService.isConfigured()) {
      methods.push({
        id: PAYMENT_METHODS.DPO,
        label: 'Pay with Card / Mobile Money',
        instructions: 'You\'ll be redirected to a secure payment page powered by DPO Pay.',
        isDpo: true,
      })
    }

    methods.push(
      {
        id: PAYMENT_METHODS.BANK_TRANSFER,
        label: 'Bank Transfer (EFT)',
        instructions: `Transfer to:\nBank: First National Bank Botswana\nAccount: Contact us for details\nReference: Your Order ID`,
      },
      {
        id: PAYMENT_METHODS.CASH_ON_DELIVERY,
        label: 'Cash on Delivery / Pickup',
        instructions: 'Pay in cash when your order is delivered or when you pick up in store.',
      },
    )

    return methods
  },

  /**
   * Process payment for manual methods (Bank Transfer, COD)
   * DPO payments are handled separately via dpoService
   */
  async processPayment({ amount, method, customerInfo, paymentReference }) {
    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      amount,
      method,
      paymentReference: paymentReference || null,
      status: method === PAYMENT_METHODS.CASH_ON_DELIVERY
        ? PAYMENT_STATUS.PENDING
        : PAYMENT_STATUS.AWAITING_CONFIRMATION,
      timestamp: new Date().toISOString(),
    }
  },

  getWhatsAppLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  },
}

export default paymentService
