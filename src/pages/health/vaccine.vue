<template>
  <view class="vaccine-page">
    <!-- Header with Add Button -->
    <view class="page-header">
      <view class="header-title">疫苗管理</view>
      <u-button type="primary" size="small" @click="showAddForm = true">
        <u-icon name="plus" size="16"></u-icon>
        <text class="ml-1">添加记录</text>
      </u-button>
    </view>

    <!-- Vaccine List -->
    <view v-if="vaccineRecords.length > 0" class="records-list">
      <view
        v-for="record in vaccineRecords"
        :key="record.id"
        class="record-card"
        @click="viewRecord(record)"
      >
        <view class="card-header">
          <view class="vaccine-name">{{ record.name }}</view>
          <view :class="['status-badge', getStatusClass(record)]">
            {{ getStatusText(record) }}
          </view>
        </view>

        <view class="card-body">
          <view class="info-row">
            <u-icon name="calendar" size="14" color="#999"></u-icon>
            <text class="info-text">接种日期: {{ formatDate(record.date) }}</text>
          </view>

          <view v-if="record.nextDate" class="info-row">
            <u-icon name="clock" size="14" color="#999"></u-icon>
            <text class="info-text">下次接种: {{ formatDate(record.nextDate) }}</text>
          </view>

          <view v-if="record.hospital" class="info-row">
            <u-icon name="home" size="14" color="#999"></u-icon>
            <text class="info-text">{{ record.hospital }}</text>
          </view>
        </view>

        <view class="card-actions">
          <u-button size="mini" type="success" @click.stop="completeRecord(record)">完成</u-button>
          <u-button size="mini" type="warning" @click.stop="postponeRecord(record)">推迟</u-button>
        </view>
      </view>
    </view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <text class="empty-icon">💉</text>
      <text class="empty-text">还没有疫苗记录</text>
      <text class="empty-desc">点击右上角添加疫苗记录</text>
    </view>

    <!-- Add/Edit Form Popup -->
    <u-popup v-model:show="showAddForm" mode="bottom" :round="20">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editingRecord ? '编辑疫苗记录' : '添加疫苗记录' }}</text>
          <u-icon name="close" size="20" @click="closeForm"></u-icon>
        </view>

        <u-form :model="form" ref="formRef" label-width="140rpx" class="form-content">
          <!-- Vaccine Preset -->
          <u-form-item label="疫苗类型" required>
            <u-radio-group v-model="form.preset">
              <u-radio name="rabies">狂犬疫苗</u-radio>
              <u-radio name="triple">三联疫苗</u-radio>
              <u-radio name="quadruple">四联疫苗</u-radio>
              <u-radio name="custom">自定义</u-radio>
            </u-radio-group>
          </u-form-item>

          <!-- Custom Name (if custom) -->
          <u-form-item v-if="form.preset === 'custom'" label="疫苗名称" required>
            <u-input v-model="form.name" placeholder="请输入疫苗名称" />
          </u-form-item>

          <!-- Current Shot (for triple/quadruple) -->
          <u-form-item v-if="form.preset === 'triple' || form.preset === 'quadruple'" label="第几针" required>
            <u-radio-group v-model="form.currentShot">
              <u-radio :name="1">第一针</u-radio>
              <u-radio :name="2">第二针</u-radio>
              <u-radio :name="3">第三针</u-radio>
            </u-radio-group>
          </u-form-item>

          <!-- Date -->
          <u-form-item label="接种日期" required>
            <view @click="showDatePicker = true" class="date-picker-trigger">
              <text v-if="form.date">{{ formatDate(form.date) }}</text>
              <text v-else class="placeholder-text">请选择接种日期</text>
            </view>
          </u-form-item>

          <!-- Hospital -->
          <u-form-item label="医院/诊所">
            <u-input v-model="form.hospital" placeholder="请输入医院或诊所名称" />
          </u-form-item>

          <!-- Note -->
          <u-form-item label="备注">
            <u-textarea v-model="form.note" placeholder="可选填写备注信息" maxlength="200"></u-textarea>
          </u-form-item>
        </u-form>

        <view class="form-actions">
          <u-button type="primary" @click="handleSubmit" :loading="loading">
            {{ editingRecord ? '保存' : '添加' }}
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

    <!-- Postpone Date Picker -->
    <u-datetime-picker
      v-model="showPostponePicker"
      :show="showPostponePicker"
      mode="date"
      :min-date="Date.now()"
      @confirm="onPostponeConfirm"
      @cancel="showPostponePicker = false"
    ></u-datetime-picker>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health'
import { usePetStore } from '@/stores/pet'
import type { HealthRecord } from '@/types'
import { computeNextDate, getCycleDescription, calculatePetAgeMonths, type VaccinePreset } from '@/utils/healthCycle'

const healthStore = useHealthStore()
const petStore = usePetStore()

const loading = ref(false)
const showAddForm = ref(false)
const showDatePicker = ref(false)
const showPostponePicker = ref(false)
const editingRecord = ref<HealthRecord | null>(null)
const postponingRecord = ref<HealthRecord | null>(null)

const form = ref({
  preset: 'rabies' as VaccinePreset,
  name: '',
  currentShot: 1 as number,
  date: 0,
  hospital: '',
  note: ''
})

onMounted(async () => {
  if (petStore.currentPet) {
    await healthStore.loadRecords(petStore.currentPet.id)
  }
})

const vaccineRecords = computed(() => {
  if (!petStore.currentPet) return []
  return healthStore.recordsByType(petStore.currentPet.id, 'vaccine')
    .sort((a, b) => (b.nextDate || 0) - (a.nextDate || 0))
})

function getVaccineName(preset: string): string {
  const names: Record<string, string> = {
    rabies: '狂犬疫苗',
    triple: '三联疫苗',
    quadruple: '四联疫苗'
  }
  return names[preset] || '自定义疫苗'
}

function formatDate(timestamp: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getStatusText(record: HealthRecord): string {
  if (!record.nextDate) return '已完成'
  const now = Date.now()
  const daysUntil = Math.ceil((record.nextDate - now) / (24 * 60 * 60 * 1000))

  if (daysUntil < 0) return `逾期${-daysUntil}天`
  if (daysUntil === 0) return '今日应接种'
  if (daysUntil <= 7) return `${daysUntil}天后`
  return '正常'
}

function getStatusClass(record: HealthRecord): string {
  if (!record.nextDate) return 'status-completed'
  const now = Date.now()
  const daysUntil = Math.ceil((record.nextDate - now) / (24 * 60 * 60 * 1000))

  if (daysUntil < 0) return 'status-overdue'
  if (daysUntil <= 7) return 'status-urgent'
  return 'status-normal'
}

function viewRecord(record: HealthRecord) {
  // Could navigate to detail page or show detail popup
  editingRecord.value = record
  form.value = {
    preset: (record.name.includes('狂犬') ? 'rabies' : record.name.includes('三联') ? 'triple' : record.name.includes('四联') ? 'quadruple' : 'custom') as VaccinePreset,
    name: record.name,
    currentShot: 1,
    date: record.date,
    hospital: record.hospital || '',
    note: record.note || ''
  }
  showAddForm.value = true
}

function closeForm() {
  showAddForm.value = false
  editingRecord.value = null
  form.value = {
    preset: 'rabies',
    name: '',
    currentShot: 1,
    date: 0,
    hospital: '',
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

  if (!form.value.date) {
    uni.showToast({ title: '请选择接种日期', icon: 'none' })
    return
  }

  loading.value = true

  try {
    // Generate vaccine name
    const vaccineName = form.value.preset === 'custom'
      ? form.value.name
      : getVaccineName(form.value.preset)

    if (!vaccineName) {
      uni.showToast({ title: '请输入疫苗名称', icon: 'none' })
      return
    }

    // Calculate next date
    const petAge = calculatePetAgeMonths(petStore.currentPet.birthday)
    const nextDate = computeNextDate({
      type: 'vaccine',
      preset: form.value.preset,
      fromDate: form.value.date,
      petAge,
      currentShot: form.value.currentShot
    })

    const recordData = {
      petId: petStore.currentPet.id,
      type: 'vaccine' as const,
      name: vaccineName,
      date: form.value.date,
      nextDate,
      hospital: form.value.hospital,
      note: form.value.note,
      remindStatus: 'pending' as const
    }

    let result
    if (editingRecord.value) {
      result = await healthStore.updateRecord(editingRecord.value.id, recordData)
    } else {
      result = await healthStore.createRecord(recordData)
    }

    if (result.success) {
      uni.showToast({ title: editingRecord.value ? '保存成功' : '添加成功', icon: 'success' })
      closeForm()
    } else {
      uni.showToast({ title: result.message || '操作失败', icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

async function completeRecord(record: HealthRecord) {
  if (!petStore.currentPet) return

  const result = await uni.showModal({
    title: '完成接种',
    content: '确认已完成这次疫苗接种？系统将自动计算下次接种时间。'
  })

  if (!result.confirm) return

  loading.value = true

  try {
    const petAge = calculatePetAgeMonths(petStore.currentPet.birthday)
    const preset = record.name.includes('狂犬') ? 'rabies' : record.name.includes('三联') ? 'triple' : record.name.includes('四联') ? 'quadruple' : 'custom'

    const newNextDate = computeNextDate({
      type: 'vaccine',
      preset: preset as VaccinePreset,
      fromDate: Date.now(),
      petAge,
      currentShot: 3 // Assume it's the last shot for calculating next annual booster
    })

    const updateResult = await healthStore.updateRecord(record.id, {
      date: Date.now(),
      nextDate: newNextDate,
      remindStatus: 'completed'
    })

    if (updateResult.success) {
      uni.showToast({ title: '已完成', icon: 'success' })
    } else {
      uni.showToast({ title: updateResult.message || '操作失败', icon: 'none' })
    }
  } finally {
    loading.value = false
  }
}

function postponeRecord(record: HealthRecord) {
  postponingRecord.value = record
  showPostponePicker.value = true
}

async function onPostponeConfirm(e: any) {
  if (!postponingRecord.value) return

  showPostponePicker.value = false
  loading.value = true

  try {
    const result = await healthStore.updateRecord(postponingRecord.value.id, {
      nextDate: e.value
    })

    if (result.success) {
      uni.showToast({ title: '已推迟', icon: 'success' })
    } else {
      uni.showToast({ title: result.message || '操作失败', icon: 'none' })
    }
  } finally {
    loading.value = false
    postponingRecord.value = null
  }
}
</script>

<style lang="scss" scoped>
.vaccine-page {
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

      .vaccine-name {
        font-size: $font-lg;
        font-weight: bold;
        color: $text-primary;
      }

      .status-badge {
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        font-size: $font-xs;
        font-weight: 500;

        &.status-overdue {
          background: #ffebee;
          color: #c62828;
        }

        &.status-urgent {
          background: #fff3e0;
          color: #e65100;
        }

        &.status-normal {
          background: #e8f5e9;
          color: #2e7d32;
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
        align-items: center;
        margin-bottom: 8rpx;

        .info-text {
          margin-left: 8rpx;
          font-size: $font-sm;
          color: $text-secondary;
        }
      }
    }

    .card-actions {
      display: flex;
      gap: $spacing-sm;
      margin-top: $spacing-md;
      padding-top: $spacing-md;
      border-top: 1rpx solid $border-color;
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
