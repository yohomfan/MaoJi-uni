<template>
  <view class="medicine-page">
    <view class="page-header">
      <view class="header-title">用药记录</view>
      <u-button type="primary" size="small" @click="showAddForm = true">
        <u-icon name="plus" size="16"></u-icon>
        <text class="ml-1">添加用药</text>
      </u-button>
    </view>

    <!-- Medicine List -->
    <view v-if="medicineRecords.length > 0" class="records-list">
      <view v-for="record in medicineRecords" :key="record.id" class="record-card">
        <view class="card-header">
          <view class="medicine-name">{{ record.name }}</view>
          <view :class="['status-badge', isActive(record) ? 'status-active' : 'status-completed']">
            {{ isActive(record) ? '用药中' : '已完成' }}
          </view>
        </view>

        <view class="card-body">
          <view class="info-row">
            <text class="info-label">用量：</text>
            <text class="info-value">{{ record.dosage }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">开始：</text>
            <text class="info-value">{{ formatDate(record.startDate) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">结束：</text>
            <text class="info-value">{{ formatDate(record.endDate) }}</text>
          </view>
          <view v-if="record.note" class="info-row">
            <text class="info-label">备注：</text>
            <text class="info-value">{{ record.note }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <text class="empty-icon">💊</text>
      <text class="empty-text">还没有用药记录</text>
      <text class="empty-desc">点击右上角添加用药记录</text>
    </view>

    <!-- Add Form Popup -->
    <u-popup v-model:show="showAddForm" mode="bottom" :round="20">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">添加用药记录</text>
          <u-icon name="close" size="20" @click="closeForm"></u-icon>
        </view>

        <u-form :model="form" ref="formRef" label-width="140rpx" class="form-content">
          <u-form-item label="药品名称" required>
            <u-input v-model="form.name" placeholder="请输入药品名称" />
          </u-form-item>

          <u-form-item label="用药剂量" required>
            <u-input v-model="form.dosage" placeholder="如：每日2次，每次1片" />
          </u-form-item>

          <u-form-item label="开始日期" required>
            <view @click="showStartPicker = true" class="date-picker-trigger">
              <text v-if="form.startDate">{{ formatDate(form.startDate) }}</text>
              <text v-else class="placeholder-text">请选择开始日期</text>
            </view>
          </u-form-item>

          <u-form-item label="结束日期" required>
            <view @click="showEndPicker = true" class="date-picker-trigger">
              <text v-if="form.endDate">{{ formatDate(form.endDate) }}</text>
              <text v-else class="placeholder-text">请选择结束日期</text>
            </view>
          </u-form-item>

          <u-form-item label="备注">
            <u-textarea v-model="form.note" placeholder="可选填写备注信息" maxlength="200"></u-textarea>
          </u-form-item>
        </u-form>

        <view class="form-actions">
          <u-button type="primary" @click="handleSubmit" :loading="loading">添加</u-button>
        </view>
      </view>
    </u-popup>

    <!-- Date Pickers -->
    <u-datetime-picker
      v-model="showStartPicker"
      :show="showStartPicker"
      mode="date"
      @confirm="onStartConfirm"
      @cancel="showStartPicker = false"
    ></u-datetime-picker>

    <u-datetime-picker
      v-model="showEndPicker"
      :show="showEndPicker"
      mode="date"
      :min-date="form.startDate || Date.now()"
      @confirm="onEndConfirm"
      @cancel="showEndPicker = false"
    ></u-datetime-picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health'
import { usePetStore } from '@/stores/pet'
import type { HealthRecord } from '@/types'

const healthStore = useHealthStore()
const petStore = usePetStore()

const loading = ref(false)
const showAddForm = ref(false)
const showStartPicker = ref(false)
const showEndPicker = ref(false)

const form = ref({
  name: '',
  dosage: '',
  startDate: 0,
  endDate: 0,
  note: ''
})

onMounted(async () => {
  if (petStore.currentPet) {
    await healthStore.loadRecords(petStore.currentPet.id)
  }
})

const medicineRecords = computed(() => {
  if (!petStore.currentPet) return []
  return healthStore.recordsByType(petStore.currentPet.id, 'medicine')
    .sort((a, b) => (b.startDate || 0) - (a.startDate || 0))
})

function formatDate(timestamp?: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isActive(record: HealthRecord): boolean {
  if (!record.endDate) return false
  return record.endDate > Date.now()
}

function closeForm() {
  showAddForm.value = false
  form.value = {
    name: '',
    dosage: '',
    startDate: 0,
    endDate: 0,
    note: ''
  }
}

function onStartConfirm(e: any) {
  form.value.startDate = e.value
  showStartPicker.value = false
}

function onEndConfirm(e: any) {
  form.value.endDate = e.value
  showEndPicker.value = false
}

async function handleSubmit() {
  if (!petStore.currentPet) {
    uni.showToast({ title: '请先选择宠物', icon: 'none' })
    return
  }

  if (!form.value.name || !form.value.dosage || !form.value.startDate || !form.value.endDate) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  loading.value = true

  try {
    const recordData = {
      petId: petStore.currentPet.id,
      type: 'medicine' as const,
      name: form.value.name,
      dosage: form.value.dosage,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      date: form.value.startDate,
      note: form.value.note
    }

    const result = await healthStore.createRecord(recordData)

    if (result.success) {
      uni.showToast({ title: '添加成功', icon: 'success' })
      closeForm()
    } else {
      uni.showToast({ title: result.message || '操作失败', icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.medicine-page {
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

.records-list {
  .record-card {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    box-shadow: $shadow-sm;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-sm;

      .medicine-name {
        font-size: $font-lg;
        font-weight: bold;
        color: $text-primary;
      }

      .status-badge {
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        font-size: $font-xs;
        font-weight: 500;

        &.status-active {
          background: #e3f2fd;
          color: #1565c0;
        }

        &.status-completed {
          background: #e0e0e0;
          color: #616161;
        }
      }
    }

    .card-body {
      .info-row {
        display: flex;
        margin-bottom: 8rpx;

        .info-label {
          font-size: $font-sm;
          color: $text-secondary;
          min-width: 100rpx;
        }

        .info-value {
          font-size: $font-sm;
          color: $text-primary;
          flex: 1;
        }
      }
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

.form-popup {
  background: $bg-primary;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    border-top: 1rpx solid $border-color;

    .popup-title {
      font-size: $font-lg;
      font-weight: bold;
      color: $text-primary;
    }
  }

  .form-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-md;
  }

  .date-picker-trigger {
    padding: 16rpx;
    border: 1rpx solid $border-color;
    border-radius: $radius-sm;

    .placeholder-text {
      color: $text-placeholder;
    }
  }

  .form-actions {
    padding: $spacing-md;
    border-top: 1rpx solid $border-color;
  }
}
</style>
