<template>
  <view class="home-page">
    <view class="header">
      <text class="title">毛叽</text>
      <text class="slogan">毛叽一声，健康同行</text>
    </view>

    <!-- Pet Switcher (if multiple pets) -->
    <view v-if="petStore.petsCount > 1" class="pet-switcher">
      <scroll-view scroll-x class="pet-list">
        <view
          v-for="pet in petStore.pets"
          :key="pet.id"
          class="pet-item"
          :class="{ active: pet.id === petStore.currentPetId }"
          @click="petStore.setCurrentPet(pet.id)"
        >
          <image v-if="pet.avatar" :src="pet.avatar" class="pet-avatar" />
          <view v-else class="pet-avatar-placeholder">{{ pet.name[0] }}</view>
          <text class="pet-name">{{ pet.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- Today's Todos -->
    <view class="today-todos">
      <view class="section-header">
        <text class="section-title">今日待办</text>
      </view>
      <view v-if="healthStore.todayTodos.length > 0" class="todo-list">
        <view
          v-for="todo in healthStore.todayTodos"
          :key="todo.id"
          class="todo-item"
        >
          <view class="todo-info">
            <text class="todo-name">{{ todo.name }}</text>
            <text class="todo-pet">{{ todo.petName }}</text>
          </view>
          <view class="todo-tag" :class="todo.urgency">
            {{ todo.urgency === 'overdue' ? '逾期' : '今日' }}
          </view>
        </view>
      </view>
      <view v-else class="empty-todos">
        <text>暂无待办事项 ✓</text>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-item" @click="navigateTo('/pages/health/calendar')">
        <text class="action-icon">📅</text>
        <text class="action-label">健康日历</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/pet/edit')">
        <text class="action-icon">➕</text>
        <text class="action-label">添加宠物</text>
      </view>
      <view class="action-item" @click="navigateTo('/pages/knowledge/list')">
        <text class="action-icon">📚</text>
        <text class="action-label">健康知识</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePetStore } from '@/stores/pet'
import { useHealthStore } from '@/stores/health'

const petStore = usePetStore()
const healthStore = useHealthStore()

onMounted(async () => {
  await petStore.loadPets()
  if (petStore.currentPetId) {
    await healthStore.loadRecords(petStore.currentPetId)
  }
})

function navigateTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: $spacing-md;
  background: $bg-secondary;
}

.header {
  text-align: center;
  padding: $spacing-xl 0;

  .title {
    display: block;
    font-size: $font-xxl;
    font-weight: bold;
    color: $primary-color;
  }

  .slogan {
    display: block;
    margin-top: $spacing-xs;
    font-size: $font-sm;
    color: $text-secondary;
  }
}

.pet-switcher {
  margin-bottom: $spacing-lg;

  .pet-list {
    white-space: nowrap;

    .pet-item {
      display: inline-block;
      margin-right: $spacing-md;
      text-align: center;

      &.active .pet-avatar,
      &.active .pet-avatar-placeholder {
        border-color: $primary-color;
      }

      .pet-avatar,
      .pet-avatar-placeholder {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        border: 4rpx solid transparent;
        background: $bg-disabled;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $font-xl;
      }

      .pet-name {
        display: block;
        margin-top: $spacing-xs;
        font-size: $font-sm;
        color: $text-primary;
      }
    }
  }
}

.today-todos {
  background: $bg-primary;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-lg;

  .section-header {
    margin-bottom: $spacing-md;

    .section-title {
      font-size: $font-lg;
      font-weight: bold;
      color: $text-primary;
    }
  }

  .todo-list {
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-md 0;
      border-bottom: 1rpx solid $divider-color;

      &:last-child {
        border-bottom: none;
      }

      .todo-info {
        .todo-name {
          display: block;
          font-size: $font-md;
          color: $text-primary;
        }

        .todo-pet {
          display: block;
          margin-top: $spacing-xs;
          font-size: $font-sm;
          color: $text-secondary;
        }
      }

      .todo-tag {
        padding: 4rpx 16rpx;
        border-radius: $radius-sm;
        font-size: $font-xs;
        background: $info-color;
        color: white;

        &.overdue {
          background: $error-color;
        }

        &.today {
          background: $warning-color;
        }
      }
    }
  }

  .empty-todos {
    text-align: center;
    padding: $spacing-xl 0;
    color: $text-placeholder;
  }
}

.quick-actions {
  display: flex;
  justify-content: space-around;

  .action-item {
    text-align: center;
    flex: 1;

    .action-icon {
      display: block;
      font-size: 64rpx;
      margin-bottom: $spacing-sm;
    }

    .action-label {
      display: block;
      font-size: $font-sm;
      color: $text-secondary;
    }
  }
}
</style>
