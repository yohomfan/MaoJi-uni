/**
 * User Store - Pinia
 * Manages user authentication and profile state
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import * as authAdapter from '@/platform/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const openid = ref<string | null>(null)

  // Getters
  const isVip = computed(() => {
    if (!user.value?.vipExpireAt) return false
    return user.value.vipExpireAt > Date.now()
  })

  const vipDaysRemaining = computed(() => {
    if (!isVip.value || !user.value?.vipExpireAt) return 0
    const days = Math.ceil((user.value.vipExpireAt - Date.now()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  })

  // Actions
  async function init() {
    // Check if user is already logged in from storage
    const loggedIn = authAdapter.isLoggedIn()
    const storedOpenid = authAdapter.getOpenid()

    if (loggedIn && storedOpenid) {
      isLoggedIn.value = true
      openid.value = storedOpenid

      // Load user profile from storage
      const userProfile = uni.getStorageSync('userInfo')
      if (userProfile) {
        try {
          user.value = JSON.parse(userProfile)
        } catch (e) {
          console.error('Failed to parse user profile', e)
        }
      }
    }
  }

  async function login() {
    const result = await authAdapter.login()

    if (result.success) {
      isLoggedIn.value = true
      openid.value = result.openid

      // Create or load user profile
      const userProfile: User = {
        _openid: result.openid,
        nickname: '毛孩子主人',
        avatar: '',
        subscribeMsg: {},
        createTime: Date.now()
      }

      user.value = userProfile
      uni.setStorageSync('userInfo', JSON.stringify(userProfile))

      return { success: true, message: result.message }
    }

    return { success: false, message: result.message }
  }

  function logout() {
    authAdapter.logout()
    user.value = null
    isLoggedIn.value = false
    openid.value = null
  }

  function updateProfile(updates: Partial<User>) {
    if (!user.value) return

    user.value = { ...user.value, ...updates }
    uni.setStorageSync('userInfo', JSON.stringify(user.value))
  }

  function setVipExpireAt(timestamp: number) {
    if (!user.value) return

    user.value.vipExpireAt = timestamp
    uni.setStorageSync('userInfo', JSON.stringify(user.value))
  }

  function updateSubscribeMsg(templateId: string, granted: boolean) {
    if (!user.value) return

    user.value.subscribeMsg[templateId] = granted
    uni.setStorageSync('userInfo', JSON.stringify(user.value))
  }

  return {
    // State
    user,
    isLoggedIn,
    openid,

    // Getters
    isVip,
    vipDaysRemaining,

    // Actions
    init,
    login,
    logout,
    updateProfile,
    setVipExpireAt,
    updateSubscribeMsg
  }
})
