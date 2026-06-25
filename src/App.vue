<template>
  <view class="app-container">
    <!-- Privacy Consent Modal -->
    <PrivacyModal
      :show="showPrivacyModal"
      @accept="handlePrivacyAccept"
      @reject="handlePrivacyReject"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import PrivacyModal from '@/components/PrivacyModal.vue'

const userStore = useUserStore()
const showPrivacyModal = ref(false)

onLaunch(() => {
  console.log('毛叽 Maoji App Launch')

  // Check privacy consent
  checkPrivacyConsent()

  // Initialize user session
  userStore.init()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

function checkPrivacyConsent() {
  const consent = uni.getStorageSync('privacy_consent')
  if (!consent || !consent.acceptedAt) {
    // First launch - show privacy modal
    showPrivacyModal.value = true
  }
}

function handlePrivacyAccept() {
  // Record consent
  const consent = {
    version: '1.0.0',
    acceptedAt: Date.now(),
    agreements: {
      userAgreement: true,
      privacyPolicy: true
    }
  }

  uni.setStorageSync('privacy_consent', consent)
  showPrivacyModal.value = false

  uni.showToast({
    title: '感谢您的信任',
    icon: 'success'
  })
}

function handlePrivacyReject() {
  uni.showModal({
    title: '无法继续',
    content: '如果不同意用户协议和隐私政策，将无法使用本应用',
    showCancel: false,
    confirmText: '重新阅读',
    success: (res) => {
      if (res.confirm) {
        // Keep modal open
      }
    }
  })
}
</script>

<style lang="scss">
/* Import global styles */
@import '@/uni.scss';

/* Base styles */
page {
  background-color: #F8F8F8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* Global utility classes */
.container {
  padding: 24rpx;
}

.text-center {
  text-align: center;
}

.text-primary {
  color: var(--primary-color);
}

.bg-primary {
  background-color: var(--primary-color);
}
</style>
