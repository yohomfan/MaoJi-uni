<template>
  <view class="profile-page">
    <!-- User Header -->
    <view class="user-header">
      <view class="user-avatar-container">
        <image v-if="userStore.user?.avatar" :src="userStore.user.avatar" class="user-avatar" />
        <view v-else class="user-avatar-placeholder">
          <text>{{ userStore.user?.nickname?.[0] || '用' }}</text>
        </view>
      </view>
      <text class="user-nickname">{{ userStore.user?.nickname || '毛孩子主人' }}</text>

      <!-- VIP Badge -->
      <view v-if="userStore.isVip" class="vip-badge">
        <text>VIP会员 · 剩余{{ userStore.vipDaysRemaining }}天</text>
      </view>
      <view v-else class="vip-action" @click="navigateTo('/pages/user/vip')">
        <text>开通健康会员 ></text>
      </view>
    </view>

    <!-- Menu Items -->
    <view class="menu-section">
      <view class="menu-item" @click="navigateTo('/pages/pet/list')">
        <text class="menu-icon">🐾</text>
        <text class="menu-label">我的宠物</text>
        <text class="menu-value">{{ petStore.petsCount }}</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="navigateTo('/pages/user/orders')">
        <text class="menu-icon">📦</text>
        <text class="menu-label">我的订单</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="navigateTo('/pages/health/calendar')">
        <text class="menu-icon">📅</text>
        <text class="menu-label">健康日历</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="showSubscribeSettings">
        <text class="menu-icon">🔔</text>
        <text class="menu-label">消息提醒</text>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- Settings Section -->
    <view class="menu-section">
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-label">关于毛叽</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="showPrivacy">
        <text class="menu-icon">🔒</text>
        <text class="menu-label">隐私协议</text>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- Logout Button -->
    <view v-if="userStore.isLoggedIn" class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
    <view v-else class="login-section">
      <button class="login-btn" type="primary" @click="handleLogin">立即登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePetStore } from '@/stores/pet'

const userStore = useUserStore()
const petStore = usePetStore()

onMounted(async () => {
  await petStore.loadPets()
})

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

async function handleLogin() {
  const result = await userStore.login()
  if (result.success) {
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
  } else {
    uni.showToast({
      title: result.message || '登录失败',
      icon: 'none'
    })
  }
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '退出登录后需要重新登录',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

function showSubscribeSettings() {
  uni.showToast({
    title: '消息提醒设置',
    icon: 'none'
  })
}

function showAbout() {
  uni.showModal({
    title: '关于毛叽',
    content: '毛叽一声，健康同行\n\n版本：V1.0\n宠物健康管家',
    showCancel: false
  })
}

function showPrivacy() {
  uni.showModal({
    title: '隐私协议',
    content: '用户协议与隐私政策',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: $bg-secondary;
}

.user-header {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 80rpx $spacing-lg 48rpx;
  text-align: center;
  color: white;

  .user-avatar-container {
    margin-bottom: $spacing-md;

    .user-avatar,
    .user-avatar-placeholder {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 64rpx;
      color: white;
    }
  }

  .user-nickname {
    display: block;
    font-size: $font-xl;
    font-weight: bold;
    margin-bottom: $spacing-sm;
  }

  .vip-badge {
    display: inline-block;
    padding: 8rpx 24rpx;
    background: rgba(255, 215, 0, 0.9);
    border-radius: $radius-round;
    font-size: $font-sm;
    color: #8B4513;
  }

  .vip-action {
    padding: 8rpx 24rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: $radius-round;
    font-size: $font-sm;
    display: inline-block;
  }
}

.menu-section {
  margin: $spacing-lg $spacing-md;
  background: $bg-primary;
  border-radius: $radius-md;
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    padding: $spacing-lg $spacing-md;
    border-bottom: 1rpx solid $divider-color;

    &:last-child {
      border-bottom: none;
    }

    .menu-icon {
      font-size: 40rpx;
      margin-right: $spacing-md;
    }

    .menu-label {
      flex: 1;
      font-size: $font-md;
      color: $text-primary;
    }

    .menu-value {
      font-size: $font-md;
      color: $text-secondary;
      margin-right: $spacing-sm;
    }

    .menu-arrow {
      font-size: $font-md;
      color: $text-placeholder;
    }
  }
}

.logout-section,
.login-section {
  padding: $spacing-xl $spacing-lg;

  .logout-btn,
  .login-btn {
    width: 100%;
    height: $touch-target;
    line-height: $touch-target;
    border-radius: $radius-round;
    background: $bg-primary;
    border: 1rpx solid $border-color;
    color: $text-secondary;
    font-size: $font-md;
  }

  .login-btn {
    background: $primary-color;
    color: white;
    border: none;
  }
}
</style>
