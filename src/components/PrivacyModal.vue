<template>
  <u-popup
    :show="show"
    mode="center"
    :close-on-click-overlay="false"
    :round="20"
    :z-index="9999"
  >
    <view class="privacy-modal">
      <view class="modal-header">
        <text class="header-title">用户协议与隐私政策</text>
      </view>

      <view class="modal-content">
        <text class="content-text">
          欢迎使用毛叽！我们非常重视您的隐私保护和个人信息安全。
        </text>
        <text class="content-text">
          在使用我们的服务前，请您仔细阅读并同意以下协议：
        </text>

        <view class="agreement-links">
          <text class="link-text" @click="viewAgreement('user')">
            《用户协议》
          </text>
          <text class="separator">和</text>
          <text class="link-text" @click="viewAgreement('privacy')">
            《隐私政策》
          </text>
        </view>

        <text class="content-text tips">
          我们将按照上述协议为您提供服务，保护您的个人信息。
        </text>
      </view>

      <view class="modal-footer">
        <view class="button-group">
          <u-button
            type="default"
            size="large"
            @click="handleReject"
            custom-style="flex: 1; margin-right: 12rpx;"
          >
            不同意
          </u-button>
          <u-button
            type="primary"
            size="large"
            @click="handleAccept"
            custom-style="flex: 1; margin-left: 12rpx;"
          >
            同意并继续
          </u-button>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  accept: []
  reject: []
}>()

function handleAccept() {
  emit('accept')
}

function handleReject() {
  emit('reject')
}

function viewAgreement(type: 'user' | 'privacy') {
  const url = type === 'user' ? '/pages/user/user-agreement' : '/pages/user/privacy-policy'

  // In H5, open in new tab; in mini-program, navigate
  // #ifdef H5
  window.open(url, '_blank')
  // #endif

  // #ifdef MP-WEIXIN
  uni.navigateTo({ url })
  // #endif
}
</script>

<style lang="scss" scoped>
.privacy-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.modal-header {
  padding: 48rpx 32rpx 24rpx;
  text-align: center;

  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-primary;
  }
}

.modal-content {
  padding: 0 32rpx 32rpx;
  max-height: 600rpx;
  overflow-y: auto;

  .content-text {
    display: block;
    font-size: 28rpx;
    line-height: 1.6;
    color: $text-secondary;
    margin-bottom: 24rpx;

    &.tips {
      font-size: 24rpx;
      color: $text-placeholder;
    }
  }

  .agreement-links {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 24rpx 0;

    .link-text {
      font-size: 28rpx;
      color: $primary-color;
      text-decoration: underline;
    }

    .separator {
      margin: 0 8rpx;
      font-size: 28rpx;
      color: $text-secondary;
    }
  }
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx;
  border-top: 1rpx solid $border-color;

  .button-group {
    display: flex;
    gap: 24rpx;
  }
}
</style>
