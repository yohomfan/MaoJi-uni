<template>
  <view class="album-page">
    <!-- Header -->
    <view class="page-header">
      <view class="header-title">{{ pet?.name }}的相册</view>
      <u-button type="primary" size="small" @click="addPhoto">
        <u-icon name="plus" size="16"></u-icon>
        <text class="ml-1">添加照片</text>
      </u-button>
    </view>

    <!-- Photo Grid -->
    <view v-if="photos.length > 0" class="photo-grid">
      <view
        v-for="photo in photos"
        :key="photo.id"
        class="photo-item"
        @click="previewPhoto(photo)"
      >
        <image :src="photo.url" class="photo-image" mode="aspectFill" />
        <view class="photo-date">{{ formatDate(photo.date) }}</view>
      </view>
    </view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <text class="empty-icon">📷</text>
      <text class="empty-text">还没有照片</text>
      <text class="empty-desc">点击右上角添加照片</text>
    </view>

    <!-- Preview Modal -->
    <u-popup v-model:show="showPreview" mode="center" :round="20">
      <view class="preview-modal" v-if="currentPhoto">
        <view class="preview-header">
          <text class="preview-date">{{ formatDate(currentPhoto.date) }}</text>
          <u-icon name="close" size="20" @click="showPreview = false"></u-icon>
        </view>
        <image :src="currentPhoto.url" class="preview-image" mode="aspectFit" />
        <view class="preview-actions">
          <u-button type="error" @click="deletePhoto">删除照片</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePetStore } from '@/stores/pet'
import type { Pet } from '@/types'

interface Photo {
  id: string
  url: string
  date: number
  note?: string
}

const petStore = usePetStore()

// Get pet ID from query params
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1] as any
const petId = currentPage?.options?.id || null

const pet = ref<Pet | null>(null)
const photos = ref<Photo[]>([])
const showPreview = ref(false)
const currentPhoto = ref<Photo | null>(null)

onMounted(async () => {
  if (petId) {
    pet.value = await petStore.getPetById(petId)
    loadPhotos()
  }
})

function loadPhotos() {
  // Load from storage
  const stored = uni.getStorageSync(`pet_photos_${petId}`)
  if (stored) {
    try {
      photos.value = JSON.parse(stored)
    } catch (e) {
      photos.value = []
    }
  }
}

function savePhotos() {
  uni.setStorageSync(`pet_photos_${petId}`, JSON.stringify(photos.value))
}

function addPhoto() {
  // In H5, use file input; in mp-weixin, use chooseImage
  // @ts-ignore
  if (typeof window !== 'undefined') {
    // H5 mock: use a placeholder image
    const newPhoto: Photo = {
      id: `photo_${Date.now()}`,
      url: `https://via.placeholder.com/300x300/FF8A65/FFFFFF?text=Photo+${photos.value.length + 1}`,
      date: Date.now()
    }
    photos.value.unshift(newPhoto)
    savePhotos()
    uni.showToast({ title: '照片已添加', icon: 'success' })
  } else {
    // mp-weixin: use chooseImage
    uni.chooseImage({
      count: 1,
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // Upload to cloud storage
        // For now, use temp path
        const newPhoto: Photo = {
          id: `photo_${Date.now()}`,
          url: tempFilePath,
          date: Date.now()
        }
        photos.value.unshift(newPhoto)
        savePhotos()
        uni.showToast({ title: '照片已添加', icon: 'success' })
      }
    })
  }
}

function previewPhoto(photo: Photo) {
  currentPhoto.value = photo
  showPreview.value = true
}

function deletePhoto() {
  if (!currentPhoto.value) return

  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张照片吗？',
    success: (res) => {
      if (res.confirm && currentPhoto.value) {
        photos.value = photos.value.filter(p => p.id !== currentPhoto.value!.id)
        savePhotos()
        showPreview.value = false
        currentPhoto.value = null
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.album-page {
  min-height: 100vh;
  background: $bg-secondary;
  padding: $spacing-md;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  .header-title {
    font-size: $font-xl;
    font-weight: bold;
    color: $text-primary;
  }

  .ml-1 {
    margin-left: 8rpx;
  }
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;

  .photo-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: $radius-sm;
    overflow: hidden;
    background: $bg-primary;
    box-shadow: $shadow-sm;

    .photo-image {
      width: 100%;
      height: 100%;
    }

    .photo-date {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: $font-xs;
      padding: 4rpx 8rpx;
      text-align: center;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx $spacing-md;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: $spacing-md;
  }

  .empty-text {
    font-size: $font-lg;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  .empty-desc {
    font-size: $font-sm;
    color: $text-placeholder;
  }
}

.preview-modal {
  background: $bg-primary;
  border-radius: 20rpx;
  width: 90vw;
  max-width: 600rpx;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    border-bottom: 1rpx solid $border-color;

    .preview-date {
      font-size: $font-md;
      color: $text-secondary;
    }
  }

  .preview-image {
    width: 100%;
    max-height: 60vh;
  }

  .preview-actions {
    padding: $spacing-md;
    border-top: 1rpx solid $border-color;
  }
}
</style>
