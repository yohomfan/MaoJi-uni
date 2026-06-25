/**
 * Platform Adapter - Subscribe Message (订阅消息)
 *
 * Abstracts subscription message authorization for both H5 and mp-weixin.
 * - H5: Shows mock dialog and records consent via toast
 * - mp-weixin: Uses uni.requestSubscribeMessage for real authorization
 */

export interface SubscribeResult {
  success: boolean
  granted: string[] // Template IDs that were granted
  rejected: string[] // Template IDs that were rejected
  message?: string
}

/**
 * Health reminder template IDs
 * These would be real template IDs in production mp-weixin
 */
export const HEALTH_REMINDER_TEMPLATES = {
  vaccine: 'vaccine_reminder_template',
  deworm: 'deworm_reminder_template',
  medical: 'medical_reminder_template',
  medicine: 'medicine_reminder_template'
}

// #ifdef H5
/**
 * H5 Mock Subscribe Message Authorization
 * Shows a toast and records consent
 */
export async function requestSubscribeMessage(
  templateIds: string[]
): Promise<SubscribeResult> {
  // Simulate authorization dialog
  await new Promise(resolve => setTimeout(resolve, 300))

  // In H5, we'll simulate user accepting all
  const granted = [...templateIds]
  const rejected: string[] = []

  // Record consent
  const currentConsent = JSON.parse(
    uni.getStorageSync('subscribe_message_consent') || '{}'
  )

  templateIds.forEach(id => {
    currentConsent[id] = {
      granted: true,
      timestamp: Date.now()
    }
  })

  uni.setStorageSync('subscribe_message_consent', JSON.stringify(currentConsent))

  // Show mock toast
  uni.showToast({
    title: '已授权健康提醒',
    icon: 'success',
    duration: 2000
  })

  return {
    success: true,
    granted,
    rejected,
    message: '订阅消息授权成功（H5模拟）'
  }
}

/**
 * Check if template is authorized (H5)
 */
export function isTemplateAuthorized(templateId: string): boolean {
  const consent = JSON.parse(
    uni.getStorageSync('subscribe_message_consent') || '{}'
  )
  return consent[templateId]?.granted || false
}

/**
 * Check if should prompt for authorization
 * Implements anti-spam logic (don't prompt too frequently)
 */
export function shouldPromptSubscribe(templateId: string): boolean {
  const consent = JSON.parse(
    uni.getStorageSync('subscribe_message_consent') || '{}'
  )

  if (!consent[templateId]) {
    return true // Never asked before
  }

  if (consent[templateId].granted) {
    return false // Already granted
  }

  // If rejected, wait 7 days before asking again
  const daysSinceRejected =
    (Date.now() - consent[templateId].timestamp) / (1000 * 60 * 60 * 24)
  return daysSinceRejected > 7
}
// #endif

// #ifdef MP-WEIXIN
/**
 * WeChat Mini Program Subscribe Message Authorization
 * Uses uni.requestSubscribeMessage
 */
export async function requestSubscribeMessage(
  templateIds: string[]
): Promise<SubscribeResult> {
  try {
    const res = await uni.requestSubscribeMessage({
      tmplIds: templateIds
    })

    const granted: string[] = []
    const rejected: string[] = []

    // Parse result
    Object.keys(res[1] || {}).forEach(templateId => {
      const status = res[1][templateId]
      if (status === 'accept') {
        granted.push(templateId)
      } else {
        rejected.push(templateId)
      }
    })

    // Record consent
    const currentConsent = JSON.parse(
      uni.getStorageSync('subscribe_message_consent') || '{}'
    )

    granted.forEach(id => {
      currentConsent[id] = {
        granted: true,
        timestamp: Date.now()
      }
    })

    rejected.forEach(id => {
      currentConsent[id] = {
        granted: false,
        timestamp: Date.now()
      }
    })

    uni.setStorageSync(
      'subscribe_message_consent',
      JSON.stringify(currentConsent)
    )

    return {
      success: granted.length > 0,
      granted,
      rejected,
      message:
        granted.length > 0
          ? '订阅消息授权成功'
          : '订阅消息授权被拒绝'
    }
  } catch (error: any) {
    return {
      success: false,
      granted: [],
      rejected: templateIds,
      message: error.message || '订阅消息授权失败'
    }
  }
}

/**
 * Check if template is authorized (mp-weixin)
 */
export function isTemplateAuthorized(templateId: string): boolean {
  const consent = JSON.parse(
    uni.getStorageSync('subscribe_message_consent') || '{}'
  )
  return consent[templateId]?.granted || false
}

/**
 * Check if should prompt for authorization
 */
export function shouldPromptSubscribe(templateId: string): boolean {
  const consent = JSON.parse(
    uni.getStorageSync('subscribe_message_consent') || '{}'
  )

  if (!consent[templateId]) {
    return true
  }

  if (consent[templateId].granted) {
    return false
  }

  const daysSinceRejected =
    (Date.now() - consent[templateId].timestamp) / (1000 * 60 * 60 * 24)
  return daysSinceRejected > 7
}
// #endif

/**
 * Request authorization for all health reminder templates
 * Unified interface for both platforms
 */
export async function requestHealthReminders(): Promise<SubscribeResult> {
  const templateIds = Object.values(HEALTH_REMINDER_TEMPLATES)
  return requestSubscribeMessage(templateIds)
}
