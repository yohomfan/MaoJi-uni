/**
 * Platform Adapter - Payment
 *
 * Abstracts VIP membership payment for both H5 and mp-weixin.
 * - H5: Mock payment flow with success/fail simulation
 * - mp-weixin: Uses uni.requestPayment with cloud function backend
 */

export interface PaymentResult {
  success: boolean
  orderId?: string
  message?: string
}

export interface PaymentParams {
  amount: number // Amount in cents (e.g., 1990 for ¥19.90)
  description: string
  orderType: 'vip' | 'other'
}

// #ifdef H5
/**
 * H5 Mock Payment
 * Simulates VIP purchase flow for verification
 */
export async function requestPayment(
  params: PaymentParams
): Promise<PaymentResult> {
  try {
    // Show mock payment dialog
    const confirmRes = await uni.showModal({
      title: '确认支付',
      content: `${params.description}\n金额：¥${(params.amount / 100).toFixed(2)}`,
      confirmText: '确认支付',
      cancelText: '取消'
    })

    if (!confirmRes[1]?.confirm) {
      return {
        success: false,
        message: '用户取消支付'
      }
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate mock order ID
    const orderId = `h5_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Show success toast
    uni.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000
    })

    return {
      success: true,
      orderId,
      message: '支付成功（H5模拟）'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '支付失败'
    }
  }
}

/**
 * Purchase VIP membership (H5 mock)
 */
export async function purchaseVip(
  months: number = 1
): Promise<PaymentResult> {
  const pricePerMonth = 1990 // ¥19.90 in cents

  return requestPayment({
    amount: pricePerMonth * months,
    description: `健康会员 ${months}个月`,
    orderType: 'vip'
  })
}
// #endif

// #ifdef MP-WEIXIN
/**
 * WeChat Mini Program Payment
 * Uses uni.requestPayment with cloud function backend
 */
export async function requestPayment(
  params: PaymentParams
): Promise<PaymentResult> {
  try {
    // Call cloud function to create order and get payment params
    const createOrderRes = await uni.cloud.callFunction({
      name: 'pay-order',
      data: {
        amount: params.amount,
        description: params.description,
        orderType: params.orderType
      }
    })

    if (!createOrderRes.result?.paymentParams) {
      return {
        success: false,
        message: '创建订单失败'
      }
    }

    const paymentParams = createOrderRes.result.paymentParams
    const orderId = createOrderRes.result.orderId

    // Request WeChat payment
    await uni.requestPayment({
      provider: 'wxpay',
      ...paymentParams
    })

    // Payment succeeded
    return {
      success: true,
      orderId,
      message: '支付成功'
    }
  } catch (error: any) {
    if (error.errMsg?.includes('cancel')) {
      return {
        success: false,
        message: '用户取消支付'
      }
    }

    return {
      success: false,
      message: error.message || '支付失败'
    }
  }
}

/**
 * Purchase VIP membership (mp-weixin)
 */
export async function purchaseVip(
  months: number = 1
): Promise<PaymentResult> {
  const pricePerMonth = 1990 // ¥19.90 in cents

  return requestPayment({
    amount: pricePerMonth * months,
    description: `健康会员 ${months}个月`,
    orderType: 'vip'
  }  )
}
// #endif
