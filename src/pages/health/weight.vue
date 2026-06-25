<template>
  <view class="weight-page">
    <!-- Header -->
    <view class="page-header">
      <view class="header-title">成长记录</view>
      <u-button type="primary" size="small" @click="showAddForm = true">
        <u-icon name="plus" size="16"></u-icon>
        <text class="ml-1">添加记录</text>
      </u-button>
    </view>

    <!-- Weight Records List -->
    <view v-if="weightRecords.length > 0" class="content">
      <!-- Timeline List -->
      <view class="timeline-section">
        <view class="section-title">体重时间轴</view>
        <view class="timeline-list">
          <view
            v-for="(record, index) in weightRecords"
            :key="record.id"
            class="timeline-item"
          >
            <view class="timeline-dot"></view>
            <view v-if="index < weightRecords.length - 1" class="timeline-line"></view>

            <view class="timeline-content">
              <view class="weight-value">{{ record.weightValue }} kg</view>
              <view class="weight-date">{{ formatDate(record.date) }}</view>
              <view v-if="record.note" class="weight-note">{{ record.note }}</view>

              <!-- Weight change indicator -->
              <view v-if="index < weightRecords.length - 1" class="weight-change">
                <text :class="getChangeClass(index)">
                  {{ getChangeText(index) }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Chart Placeholder -->
      <view class="chart-section">
        <view class="section-title">体重曲线</view>
        <view class="chart-placeholder">
          <text class="chart-text">📊</text>
          <text class="chart-desc">图表功能即将上线</text>
        </view>
      </view>
    </view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <text class="empty-icon">📏</text>
      <text class="empty-text">还没有体重记录</text>
      <text class="empty-desc">点击右上角添加体重记录</text>
    </view>

    <!-- Add Form Popup -->
    <u-popup v-model:show="showAddForm" mode="bottom" :round="20">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">添加体重记录</text>
          <u-icon name="close" size="20" @click="closeForm"></u-icon>
        </view>

        <u-form :model="form" ref="formRef" label-width="140rpx" class="form-content">
          <!-- Weight Value -->
          <u-form-item label="体重(kg)" required>
            <u-input
              v-model="form.weightValue"
              type="digit"
              placeholder="请输入体重"
            />
          </u-form-item>

          <!-- Date -->
          <u-form-item label="称重日期" required>
            <view @click="showDatePicker = true" class="date-picker-trigger">
              <text v-if="form.date">{{ formatDate(form.date) }}</text>
              <text v-else class="placeholder-text">请选择称重日期</text>
            </view>
          </u-form-item>

          <!-- Note -->
          <u-form-item label="备注">
            <u-textarea
              v-model="form.note"
              placeholder="可选填写备注信息"
              maxlength="200"
            ></u-textarea>
          </u-form-item>
        </u-form>

        <view class="form-actions">
          <u-button type="primary" @click="handleSubmit" :loading="loading">
            添加
          </u-button>
        </view>
      </view>
    </u-popup>

    <!-- Date Picker -->
    <u-datetime-picker
      v-model="showDatePicker"
      :show="showDatePicker"
      mode="date"
      :max-date="Date.now()"
      @confirm="onDateConfirm"
      @cancel="showDatePicker = false"
    ></u-datetime-picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health'
import { usePetStore } from '@/stores/pet'

const healthStore = useHealthStore()
const petStore = usePetStore()

const loading = ref(false)
const showAddForm = ref(false)
const showDatePicker = ref(false)

const form = ref({
  weightValue: '',
  date: 0,
  note: ''
})

onMounted(async () => {
  if (petStore.currentPet) {
    await healthStore.loadRecords(petStore.currentPet.id)
  }
})

const weightRecords = computed(() => {
  if (!petStore.currentPet) return []
  return healthStore.recordsByType(petStore.currentPet.id, 'weight')
    .sort((a, b) => (b.date || 0) - (a.date || 0))
})

function formatDate(timestamp: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getChangeText(index: number): string {
  if (index >= weightRecords.value.length - 1) return ''

  const current = weightRecords.value[index].weightValue || 0
  const previous = weightRecords.value[index + 1].weightValue || 0
  const change = current - previous

  if (Math.abs(change) < 0.1) return '持平'

  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)} kg`
}

function getChangeClass(index: number): string {
  if (index >= weightRecords.value.length - 1) return ''

  const current = weightRecords.value[index].weightValue || 0
  const previous = weightRecords.value[index + 1].weightValue || 0
  const change = current - previous

  if (Math.abs(change) < 0.1) return 'change-neutral'
  return change > 0 ? 'change-up' : 'change-down'
}

function closeForm() {
  showAddForm.value = false
  form.value = {
    weightValue: '',
    date: 0,
    note: ''
  }
}

function onDateConfirm(e: any) {
  form.value.date = e.value
  showDatePicker.value = false
}

async function handleSubmit() {
  if (!petStore.currentPet) {
    uni.showToast({ title: '请先选择宠物', icon: 'none' })
    return
  }

  if (!form.value.weightValue) {
    uni.showToast({ title: '请输入体重', icon: 'none' })
    return
  }

  if (!form.value.date) {
    uni.showToast({ title: '请选择称重日期', icon: 'none' })
    return
  }

  loading.value = true

  try {
    const recordData = {
      petId: petStore.currentPet.id,
      type: 'weight' as const,
      name: '体重记录',
      date: form.value.date,
      weightValue: parseFloat(form.value.weightValue),
      note: form.value.note
    }

    const result = await healthStore.createRecord(recordData)

    if (result.success) {
      uni.showToast({ title: '添加成功', icon: 'success' })

      // Update pet's current weight if this is the most recent record
      if (form.value.date >= (petStore.currentPet.weight || 0)) {
        await petStore.updatePet(petStore.currentPet.id, {
          weight: parseFloat(form.value.weightValue)
        })
      }

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
.weight-page {
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

.content {
  .section-title {
    font-size: $font-lg;
    font-weight: bold;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.timeline-section {
  margin-bottom: $spacing-lg;

  .timeline-list {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: $spacing-md;
    box-shadow: $shadow-sm;

    .timeline-item {
      position: relative;
      padding-left: 48rpx;
      padding-bottom: $spacing-md;

      &:last-child {
        padding-bottom: 0;
      }

      .timeline-dot {
        position: absolute;
        left: 0;
        top: 8rpx;
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background: #FF8A65;
        border: 4rpx solid #fff;
        box-shadow: 0 0 0 2rpx #FF8A65;
      }

      .timeline-line {
        position: absolute;
        left: 10rpx;
        top: 32rpx;
        bottom: -$spacing-md;
        width: 2rpx;
        background: $border-color;
      }

      .timeline-content {
        .weight-value {
          font-size: 40rpx;
          font-weight: bold;
          color: $text-primary;
          margin-bottom: 8rpx;
        }

        .weight-date {
          font-size: $font-sm;
          color: $text-secondary;
          margin-bottom: 8rpx;
        }

        .weight-note {
          font-size: $font-sm;
          color: $text-placeholder;
          margin-bottom: 8rpx;
        }

        .weight-change {
          margin-top: 8rpx;

          text {
            font-size: $font-xs;
            padding: 4rpx 12rpx;
            border-radius: 20rpx;

            &.change-up {
              background: #ffebee;
              color: #c62828;
            }

            &.change-down {
              background: #e8f5e9;
              color: #2e7d32;
            }

            &.change-neutral {
              background: #e0e0e0;
              color: #616161;
            }
          }
        }
      }
    }
  }
}

.chart-section {
  .chart-placeholder {
    background: $bg-primary;
    border-radius: $radius-md;
    padding: 120rpx $spacing-md;
    text-align: center;
    box-shadow: $shadow-sm;

    .chart-text {
      font-size: 120rpx;
      display: block;
      margin-bottom: $spacing-md;
    }

    .chart-desc {
      font-size: $font-md;
      color: $text-placeholder;
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
    border-bottom: 1rpx solid $border-color;

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
