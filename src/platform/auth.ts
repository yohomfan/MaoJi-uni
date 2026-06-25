/**
 * Platform Adapter - Authentication
 *
 * Abstracts login and user initialization for both H5 and mp-weixin platforms.
 * - H5: Returns deterministic demo openid for verification
 * - mp-weixin: Uses uni.login() and cloud function user-init
 */

export interface LoginResult {
  success: boolean
  openid: string
  message?: string
}

// #ifdef H5
/**
 * H5 Mock Login
 * Returns deterministic demo openid for testing and verification
 */
export async function login(): Promise<LoginResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))

  const demoOpenid = 'demo_user_h5_12345'

  // Store login state
  uni.setStorageSync('openid', demoOpenid)
  uni.setStorageSync('isLoggedIn', true)

  return {
    success: true,
    openid: demoOpenid,
    message: 'Demo 一键登录成功'
  }
}

/**
 * Check if user is logged in (H5)
 */
export function isLoggedIn(): boolean {
  return uni.getStorageSync('isLoggedIn') || false
}

/**
 * Get current user openid (H5)
 */
export function getOpenid(): string | null {
  return uni.getStorageSync('openid') || null
}

/**
 * Logout (H5)
 */
export function logout(): void {
  uni.removeStorageSync('openid')
  uni.removeStorageSync('isLoggedIn')
  uni.removeStorageSync('userInfo')
}
// #endif

// #ifdef MP-WEIXIN
/**
 * WeChat Mini Program Login
 * Uses uni.login() and cloud function for user initialization
 */
export async function login(): Promise<LoginResult> {
  try {
    // Get WeChat login code
    const loginRes = await uni.login({
      provider: 'weixin'
    })

    if (!loginRes[1]?.code) {
      return {
        success: false,
        openid: '',
        message: '获取登录凭证失败'
      }
    }

    // Call cloud function to initialize user and get openid
    const cloudRes = await uni.cloud.callFunction({
      name: 'user-init',
      data: {
        code: loginRes[1].code
      }
    })

    if (cloudRes.result?.openid) {
      const openid = cloudRes.result.openid

      // Store login state
      uni.setStorageSync('openid', openid)
      uni.setStorageSync('isLoggedIn', true)

      return {
        success: true,
        openid,
        message: '登录成功'
      }
    }

    return {
      success: false,
      openid: '',
      message: '用户初始化失败'
    }
  } catch (error: any) {
    return {
      success: false,
      openid: '',
      message: error.message || '登录失败'
    }
  }
}

/**
 * Check if user is logged in (mp-weixin)
 */
export function isLoggedIn(): boolean {
  return uni.getStorageSync('isLoggedIn') || false
}

/**
 * Get current user openid (mp-weixin)
 */
export function getOpenid(): string | null {
  return uni.getStorageSync('openid') || null
}

/**
 * Logout (mp-weixin)
 */
export function logout(): void {
  uni.removeStorageSync('openid')
  uni.removeStorageSync('isLoggedIn')
  uni.removeStorageSync('userInfo')
}
// #endif
