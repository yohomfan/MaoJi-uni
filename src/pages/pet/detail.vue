<template>
  <view class="detail-page" v-if="pet">
    <!-- Avatar Section -->
    <view class="avatar-section">
      <image v-if="pet.avatar" :src="pet.avatar" class="pet-avatar" mode="aspectFill" />
      <view v-else class="pet-avatar-placeholder">
        <text>{{ pet.name[0] }}</text>
      </view>
      <text class="pet-name">{{ pet.name }}</text>
      <text class="pet-breed-species">{{ pet.breed }} · {{ speciesLabel }}</text>
    </view>

    <!-- Basic Info Cards -->
    <view class="info-section">
      <view class="section-title">基本信息</view>

      <view class="info-card">
        <view class="info-row">
          <text class="info-label">性别</text>
          <text class="info-value">{{ genderLabel }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">生日</text>
          <text class="info-value">{{ formatDate(pet.birthday) }} ({{ age }})</text>
        </view>

        <view class="info-row">
          <text class="info-label">当前体重</text>
          <text class="info-value">{{ pet.weight }} kg</text>
        </view>

        <view class="info-row">
          <text class="info-label">绝育状态</text>
          <text class="info-value">{{ neuteredLabel }}</text>
        </view>

        <view class="info-row" v-if="pet.chipNo">
          <text class="info-label">芯片号</text>
          <text class="info-value">{{ pet.chipNo }}</text>
        </view>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="action-section">
      <view class="action-card" @click="goToHealth('vaccine')">
        <text class="action-emoji">💉</text>
        <text class="action-label">疫苗管理</text>
      </view>

      <view class="action-card" @click="goToHealth('deworm')">
        <u-icon name="heart-fill" size="40" color="#66BB6A"></u-icon>
        <text class="action-label">驱虫管理</text>
      </view>

      <view class="action-card" @click="goToHealth('medical')">
        <u-icon name="file-text-fill" size="40" color="#42A5F5"></u-icon>
        <text class="action-label">体检记录</text>
      </view>

      <view class="action-card" @click="goToHealth('weight')">
        <text class="action-emoji">📈</text>
        <text class="action-label">成长记录</text>
      </view>

      <view class="action-card" @click="goToAlbum">
        <u-icon name="photo-fill" size="40" color="#AB47BC"></u-icon>
        <text class="action-label">相册</text>
      </view>
    </view>

    <!-- Edit Button -->
    <view class="button-section">
      <u-button type="primary" @click="editPet">编辑宠物信息</u-button>
    </view>
  </view>

  <view v-else class="loading-state">
    <view class="loading-spinner">
      <text>⏳</text>
    </view>
    <text class="loading-text">加载中...</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePetStore } from '@/stores/pet'
import type { Pet } from '@/types'

const petStore = usePetStore()

// Get pet ID from query params
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1] as any
const petId = currentPage?.options?.id || null

const pet = ref<Pet | null>(null)

onMounted(async () => {
  if (petId) {
    const loadedPet = await petStore.getPetById(petId)
    if (loadedPet) {
      pet.value = loadedPet
    } else {
      uni.showToast({ title: '宠物不存在', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
})

const speciesLabel = computed(() => {
  if (!pet.value) return ''
  const map: Record<string, string> = {
    cat: '猫咪',
    dog: '狗狗',
    other: '其他'
  }
  return map[pet.value.species] || pet.value.species
})

const genderLabel = computed(() => {
  if (!pet.value) return ''
  const map: Record<string, string> = {
    male: '公',
    female: '母',
    unknown: '未知'
  }
  return map[pet.value.gender] || pet.value.gender
})

const neuteredLabel = computed(() => {
  if (!pet.value) return ''
  const map: Record<string, string> = {
    yes: '已绝育',
    no: '未绝育',
    unknown: '未知'
  }
  return map[pet.value.isNeutered] || pet.value.isNeutered
})

const age = computed(() => {
  if (!pet.value || !pet.value.birthday) return ''

  const now = new Date()
  const birth = new Date(pet.value.birthday)
  const yearsDiff = now.getFullYear() - birth.getFullYear()
  const monthsDiff = now.getMonth() - birth.getMonth()

  let totalMonths = yearsDiff * 12 + monthsDiff

  if (now.getDate() < birth.getDate()) {
    totalMonths--
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (years > 0) {
    return months > 0 ? `${years}岁${months}个月` : `${years}岁`
  } else {
    return `${months}个月`
  }
})

function formatDate(timestamp: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function editPet() {
  uni.navigateTo({
    url: `/pages/pet/edit?id=${petId}`
  })
}

function goToHealth(type: string) {
  uni.navigateTo({
    url: `/pages/health/${type}?petId=${petId}`
  })
}

function goToAlbum() {
  uni.navigateTo({
    url: `/pages/pet/album?id=${petId}`
  })
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: $bg-secondary;
  padding-bottom: $spacing-xl;
}

.avatar-section {
  background: $bg-primary;
  padding: $spacing-xl $spacing-md;
  text-align: center;

  .pet-avatar,
  .pet-avatar-placeholder {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    margin: 0 auto $spacing-md;
    background: $bg-disabled;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80rpx;
    color: $text-secondary;
    border: 4rpx solid #fff;
    box-shadow: $shadow-md;
  }

  .pet-name {
    display: block;
    font-size: $font-xxl;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }

  .pet-breed-species {
    display: block;
    font-size: $font-md;
    color: $text-secondary;
  }
}

.info-section {
  padding: $spacing-md;

  .section-title {
    font-size: $font-lg;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
    padding-left: $spacing-xs;
  }

  .info-card {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    box-shadow: $shadow-sm;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-sm 0;
      border-bottom: 1rpx solid $border-color;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: $font-md;
        color: $text-secondary;
      }

      .info-value {
        font-size: $font-md;
        color: $text-primary;
        font-weight: 500;
      }
    }
  }
}

.action-section {
  padding: 0 $spacing-md $spacing-md;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;

  .action-card {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md $spacing-sm;
    text-align: center;
    box-shadow: $shadow-sm;

    .action-emoji {
      display: block;
      font-size: 40px;
      line-height: 1;
    }

    .action-label {
      display: block;
      font-size: $font-sm;
      color: $text-primary;
      margin-top: $spacing-xs;
    }
  }
}

.button-section {
  padding: 0 $spacing-md;

  .u-button {
    width: 100%;
  }
}

.loading-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .loading-spinner {
    font-size: 80rpx;
    animation: spin 2s linear infinite;
  }

  .loading-text {
    margin-top: $spacing-md;
    color: $text-secondary;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
