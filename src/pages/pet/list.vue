<template>
  <view class="pet-list-page">
    <view v-if="petStore.hasPets" class="pet-grid">
      <view
        v-for="pet in petStore.pets"
        :key="pet.id"
        class="pet-card"
        @click="viewPetDetail(pet.id)"
      >
        <image v-if="pet.avatar" :src="pet.avatar" class="pet-avatar" mode="aspectFill" />
        <view v-else class="pet-avatar-placeholder">
          <text>{{ pet.name[0] }}</text>
        </view>
        <view class="pet-info">
          <text class="pet-name">{{ pet.name }}</text>
          <text class="pet-breed">{{ pet.breed }}</text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">🐾</text>
      <text class="empty-text">还没有宠物档案</text>
      <text class="empty-desc">快去添加你的毛孩子吧</text>
    </view>

    <!-- Add Pet Button -->
    <view class="fab" @click="addPet">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePetStore } from '@/stores/pet'

const petStore = usePetStore()

onMounted(async () => {
  await petStore.loadPets()
})

function viewPetDetail(id: string) {
  uni.navigateTo({
    url: `/pages/pet/detail?id=${id}`
  })
}

function addPet() {
  uni.navigateTo({
    url: '/pages/pet/edit'
  })
}
</script>

<style lang="scss" scoped>
.pet-list-page {
  min-height: 100vh;
  padding: $spacing-md;
  background: $bg-secondary;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;

  .pet-card {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    text-align: center;
    box-shadow: $shadow-sm;

    .pet-avatar,
    .pet-avatar-placeholder {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      margin: 0 auto $spacing-md;
      background: $bg-disabled;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64rpx;
    }

    .pet-info {
      .pet-name {
        display: block;
        font-size: $font-lg;
        font-weight: bold;
        color: $text-primary;
        margin-bottom: $spacing-xs;
      }

      .pet-breed {
        display: block;
        font-size: $font-sm;
        color: $text-secondary;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx $spacing-md;
  text-align: center;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: $spacing-lg;
  }

  .empty-text {
    display: block;
    font-size: $font-lg;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }

  .empty-desc {
    display: block;
    font-size: $font-md;
    color: $text-secondary;
  }
}

.fab {
  position: fixed;
  right: 48rpx;
  bottom: 160rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-lg;

  .fab-icon {
    font-size: 64rpx;
    color: white;
    line-height: 1;
  }
}
</style>
