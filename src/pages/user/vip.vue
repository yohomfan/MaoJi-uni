<template>
  <view class="vip-page">
    <!-- Header -->
    <view class="vip-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <text class="vip-title">健康会员</text>
        <text class="vip-slogan">专业健康管理，呵护每一天</text>
      </view>
    </view>

    <!-- Current Status -->
    <view class="status-card">
      <view v-if="userStore.isVip" class="vip-active">
        <view class="status-icon">👑</view>
        <text class="status-title">您是尊贵的VIP会员</text>
        <text class="status-desc">有效期至：{{ formatDate(userStore.user?.vipExpireAt || 0) }}</text>
      </view>
      <view v-else class="vip-inactive">
        <view class="status-icon">✨</view>
        <text class="status-title">开通VIP，享受专属特权</text>
        <text class="status-desc">更专业的健康管理服务</text>
      </view>
    </view>

    <!-- Benefits -->
    <view class="benefits-section">
      <view class="section-title">会员特权</view>
      <view class="benefits-grid">
        <view class="benefit-card">
          <view class="benefit-icon">🔔</view>
          <text class="benefit-title">高级提醒</text>
          <text class="benefit-desc">多时段健康提醒</text>
        </view>
        <view class="benefit-card">
          <view class="benefit-icon">📊</view>
          <text class="benefit-title">体检解读</text>
          <text class="benefit-desc">专业报告分析</text>
        </view>
        <view class="benefit-card">
          <view class="benefit-icon">🐾</view>
          <text class="benefit-title">档案位扩展</text>
          <text class="benefit-desc">最多10只宠物</text>
        </view>
        <view class="benefit-card">
          <view class="benefit-icon">📚</view>
          <text class="benefit-title">知识库</text>
          <text class="benefit-desc">独家专业内容</text>
        </view>
        <view class="benefit-card">
          <view class="benefit-icon">🎯</view>
          <text class="benefit-title">优先支持</text>
          <text class="benefit-desc">专属客服通道</text>
        </view>
        <view class="benefit-card">
          <view class="benefit-icon">🎁</view>
          <text class="benefit-title">更多福利</text>
          <text class="benefit-desc">持续上线中</text>
        </view>
      </view>
    </view>

    <!-- Pricing -->
    <view class="pricing-section">
      <view class="section-title">选择套餐</view>
      <view class="pricing-cards">
        <view
          class="pricing-card"
          :class="{ active: selectedPlan === 'monthly' }"
          @click="selectedPlan = 'monthly'"
        >
          <view class="plan-badge">月度</view>
          <view class="plan-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">19.9</text>
            <text class="price-unit">/月</text>
          </view>
          <text class="plan-desc">按月订阅，灵活取消</text>
        </view>
        <view
          class="pricing-card recommended"
          :class="{ active: selectedPlan === 'yearly' }"
          @click="selectedPlan = 'yearly'"
        >
          <view class="recommend-badge">推荐</view>
          <view class="plan-badge">年度</view>
          <view class="plan-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">198</text>
            <text class="price-unit">/年</text>
          </view>
          <text class="plan-desc">省约20元，更划算</text>
          <text class="plan-saving">相当于¥16.5/月</text>
        </view>
      </view>
    </view>

    <!-- CTA Button -->
    <view class="cta-section">
      <u-button
        v-if="!userStore.isVip"
        type="primary"
        size="large"
        @click="handlePurchase"
        :loading="purchasing"
      >
        立即开通 {{ selectedPlan === 'monthly' ? '¥19.9/月' : '¥198/年' }}
      </u-button>
      <u-button
        v-else
        type="primary"
        size="large"
        plain
        @click="handleRenew"
        :loading="purchasing"
      >
        续费会员
      </u-button>
    </view>

    <!-- Terms -->
    <view class="terms">
      <text class="terms-text">开通即表示同意</text>
      <text class="terms-link">《会员服务协议》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { purchaseVip } from '@/platform/pay'

const userStore = useUserStore()
const selectedPlan = ref<'monthly' | 'yearly'>('yearly')
const purchasing = ref(false)

function formatDate(timestamp: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function handlePurchase() {
  purchasing.value = true

  try {
    const amount = selectedPlan.value === 'monthly' ? 19.9 : 198
    const duration = selectedPlan.value === 'monthly' ? 30 : 365

    const result = await purchaseVip(amount, duration)

    if (result.success) {
      uni.showToast({
        title: '开通成功',
        icon: 'success'
      })

      // Reload user info
      await userStore.loadUserInfo()
    } else {
      uni.showToast({
        title: result.message || '支付失败',
        icon: 'none'
      })
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  } finally {
    purchasing.value = false
  }
}

async function handleRenew() {
  // Same as purchase for renewal
  await handlePurchase()
}
</script>

<style lang="scss" scoped>
.vip-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF5F0 0%, $bg-secondary 30%);
  padding-bottom: 120rpx;
}

.vip-header {
  position: relative;
  height: 360rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #FF8A65 0%, #FFB74D 100%);
    opacity: 0.2;
  }

  .header-content {
    position: relative;
    text-align: center;

    .vip-title {
      display: block;
      font-size: 72rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }

    .vip-slogan {
      display: block;
      font-size: $font-md;
      color: $text-secondary;
    }
  }
}

.status-card {
  margin: -80rpx $spacing-lg $spacing-lg;
  background: $bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-md;
  text-align: center;

  .vip-active,
  .vip-inactive {
    display: flex;
    flex-direction: column;
    align-items: center;

    .status-icon {
      font-size: 96rpx;
      margin-bottom: $spacing-md;
    }

    .status-title {
      font-size: $font-xl;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: $spacing-xs;
    }

    .status-desc {
      font-size: $font-sm;
      color: $text-secondary;
    }
  }

  .vip-active .status-title {
    color: #FF8A65;
  }
}

.benefits-section {
  padding: $spacing-lg;

  .section-title {
    font-size: $font-xl;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
    text-align: center;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;

    .benefit-card {
      background: $bg-primary;
      border-radius: $radius-md;
      padding: $spacing-lg $spacing-md;
      text-align: center;
      box-shadow: $shadow-sm;

      .benefit-icon {
        font-size: 64rpx;
        margin-bottom: $spacing-sm;
      }

      .benefit-title {
        display: block;
        font-size: $font-md;
        font-weight: bold;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }

      .benefit-desc {
        display: block;
        font-size: $font-xs;
        color: $text-placeholder;
      }
    }
  }
}

.pricing-section {
  padding: 0 $spacing-lg $spacing-lg;

  .section-title {
    font-size: $font-xl;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
    text-align: center;
  }

  .pricing-cards {
    display: flex;
    gap: $spacing-md;

    .pricing-card {
      flex: 1;
      background: $bg-primary;
      border-radius: $radius-md;
      padding: $spacing-lg;
      text-align: center;
      box-shadow: $shadow-sm;
      border: 2rpx solid transparent;
      position: relative;

      &.active {
        border-color: #FF8A65;
        box-shadow: 0 0 0 2rpx rgba(255, 138, 101, 0.2);
      }

      &.recommended {
        .recommend-badge {
          position: absolute;
          top: -12rpx;
          right: $spacing-md;
          background: #FF8A65;
          color: white;
          font-size: $font-xs;
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
        }
      }

      .plan-badge {
        font-size: $font-md;
        font-weight: bold;
        color: $text-primary;
        margin-bottom: $spacing-sm;
      }

      .plan-price {
        margin-bottom: $spacing-sm;

        .price-symbol {
          font-size: $font-lg;
          color: #FF8A65;
        }

        .price-value {
          font-size: 80rpx;
          font-weight: bold;
          color: #FF8A65;
        }

        .price-unit {
          font-size: $font-sm;
          color: $text-secondary;
        }
      }

      .plan-desc {
        display: block;
        font-size: $font-sm;
        color: $text-secondary;
        margin-bottom: $spacing-xs;
      }

      .plan-saving {
        display: block;
        font-size: $font-xs;
        color: #FF8A65;
      }
    }
  }
}

.cta-section {
  padding: 0 $spacing-lg;
  margin-bottom: $spacing-md;
}

.terms {
  text-align: center;
  padding: 0 $spacing-lg;

  .terms-text {
    font-size: $font-xs;
    color: $text-placeholder;
  }

  .terms-link {
    font-size: $font-xs;
    color: #FF8A65;
  }
}
</style>
