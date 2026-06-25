<template>
  <view class="medical-page">
    <!-- Header -->
    <view class="page-header">
      <view class="header-title">体检记录</view>
      <u-button type="primary" size="small" @click="showAddForm = true">
        <u-icon name="plus" size="16"></u-icon>
        <text class="ml-1">添加记录</text>
      </u-button>
    </view>

    <!-- Medical Records List -->
    <view v-if="medicalRecords.length > 0" class="records-list">
      <view
        v-for="record in medicalRecords"
        :key="record.id"
        class="record-card"
        @click="viewRecord(record)"
      >
        <view class="card-header">
          <view class="record-name">{{ record.name || '体检记录' }}</view>
          <view :class="['status-badge', getStatusClass(record)]">
            {{ getStatusText(record) }}
          </view>
        </view>

        <view class="card-body">
          <view class="info-row">
            <u-icon name="calendar" size="14" color="#999"></u-icon>
            <text class="info-text">体检日期: {{ formatDate(record.date) }}</text>
          </view>

          <view v-if="record.nextDate" class="info-row">
            <u-icon name="clock" size="14" color="#999"></u-icon>
            <text class="info-text">下次体检: {{ formatDate(record.nextDate) }}</text>
          </view>

          <view v-if="record.hospital" class="info-row">
            <u-icon name="home" size="14" color="#999"></u-icon>
            <text class="info-text">{{ record.hospital }}</text>
          </view>

          <view v-if="record.conclusion" class="info-row">
            <u-icon name="file-text" size="14" color="#999"></u-icon>
            <text class="info-text">{{ record.conclusion }}</text>
          </view>

          <view v-if="record.attachments && record.attachments.length > 0" class="attachments">
            <u-icon name="paperclip" size="14" color="#FF8A65"></u-icon>
            <text class="attachment-text">{{ record.attachments.length }} 个附件</text>
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
      <text class="empty-icon">📋</text>
      <text class="empty-text">还没有体检记录</text>
      <text class="empty-desc">点击右上角添加体检记录</text>
    </view>

    <!-- Add/Edit Form Popup -->
    <u-popup v-model:show="showAddForm" mode="bottom" :round="20">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editingRecord ? '编辑体检记录' : '添加体检记录' }}</text>
          <u-icon name="close" size="20" @click="closeForm"></u-icon>
        </view>

        <u-form :model="form" ref="formRef" label-width="140rpx" class="form-content">
          <!-- Record Name -->
          <u-form-item label="体检类型">
            <u-input v-model="form.name" placeholder="如：年度体检、专项检查等" />
          </u-form-item>

          <!-- Date -->
          <u-form-item label="体检日期" required>
            <view @click="showDatePicker = true" class="date-picker-trigger">
              <text v-if="form.date">{{ formatDate(form.date) }}</text>
              <text v-else class="placeholder-text">请选择体检日期</text>
            </view>
          </u-form-item>

          <!-- Hospital -->
          <u-form-item label="医院/诊所" required>
            <u-input v-model="form.hospital" placeholder="请输入医院或诊所名称" />
          </u-form-item>

          <!-- Conclusion -->
          <u-form-item label="体检结论">
            <u-textarea v-model="form.conclusion" placeholder="请输入体检结论" maxlength="200"></u-textarea>
          </u-form-item>

          <!-- File Upload -->
          <u-form-item label="体检报告">
            <view class="upload-section">
              <u-button size="small" @click="uploadFile">
                <u-icon name="camera-fill" size="16"></u-icon>
                <text class="ml-1">上传报告</text>
              </u-button>
              <text v-if="form.attachments.length > 0" class="upload-count">
                已上传 {{ form.attachments.length }} 个文件
              </text>
            </view>
          </u-form-item>

          <!-- Note -->
          <u-form-item label="备注">
            <u-textarea v-model="form.note" placeholder="可选填写备注信息" maxlength="200"></u-textarea>
          </u-form-item>

          <!-- Cycle Info -->
          <view class="cycle-info">
            <u-icon name="info-circle" size="14" color="#42A5F5"></u-icon>
            <text class="cycle-text">
              {{ petAge >= 84 ? '高龄宠物建议每半年体检一次' : '建议每年体检一次' }}
            </text>
          </view>
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
import { computeNextDate, calculatePetAgeMonths } from '@/utils/healthCycle'
import * as storageAdapter from '@/platform/storage'

const healthStore = useHealthStore()
const petStore = usePetStore()

const loading = ref(false)
const showAddForm = ref(false)
const showDatePicker = ref(false)
const showPostponePicker = ref(false)
const editingRecord = ref<HealthRecord | null>(null)
const postponingRecord = ref<HealthRecord | null>(null)

const form = ref({
  name: '年度体检',
  date: 0,
  hospital: '',
  conclusion: '',
  attachments: [] as string[],
  note: ''
})

onMounted(async () => {
  if (petStore.currentPet) {
    await healthStore.loadRecords(petStore.currentPet.id)
  }
})

const medicalRecords = computed(() => {
  if (!petStore.currentPet) return []
  return healthStore.recordsByType(petStore.currentPet.id, 'medical')
    .sort((a, b) => (b.date || 0) - (a.date || 0))
})

const petAge = computed(() => {
  if (!petStore.currentPet) return 0
  return calculatePetAgeMonths(petStore.currentPet.birthday)
})

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
  if (daysUntil === 0) return '今日应体检'
  if (daysUntil <= 30) return `${daysUntil}天后`
  return '正常'
}

function getStatusClass(record: HealthRecord): string {
  if (!record.nextDate) return 'status-completed'
  const now = Date.now()
  const daysUntil = Math.ceil((record.nextDate - now) / (24 * 60 * 60 * 1000))

  if (daysUntil < 0) return 'status-overdue'
  if (daysUntil <= 30) return 'status-urgent'
  return 'status-normal'
}

function viewRecord(record: HealthRecord) {
  editingRecord.value = record
  form.value = {
    name: record.name,
    date: record.date,
    hospital: record.hospital || '',
    conclusion: record.conclusion || '',
    attachments: record.attachments || [],
    note: record.note || ''
  }
  showAddForm.value = true
}

function closeForm() {
  showAddForm.value = false
  editingRecord.value = null
  form.value = {
    name: '年度体检',
    date: 0,
    hospital: '',
    conclusion: '',
    attachments: [],
    note: ''
  }
}

function onDateConfirm(e: any) {
  form.value.date = e.value
  showDatePicker.value = false
}

async function uploadFile() {
  try {
    const result = await storageAdapter.uploadFile({
      type: 'image',
      maxSize: 10 * 1024 * 1024 // 10MB
    })

    if (result.success && result.url) {
      form.value.attachments.push(result.url)
      uni.showToast({ title: '上传成功', icon: 'success' })
    } else {
      uni.showToast({ title: result.message || '上传失败', icon: 'none' })
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '上传失败', icon: 'none' })
  }
}

async function handleSubmit() {
  if (!petStore.currentPet) {
    uni.showToast({ title: '请先选择宠物', icon: 'none' })
    return
  }

  if (!form.value.date) {
    uni.showToast({ title: '请选择体检日期', icon: 'none' })
    return
  }

  if (!form.value.hospital) {
    uni.showToast({ title: '请输入医院或诊所', icon: 'none' })
    return
  }

  loading.value = true

  try {
    // Calculate next date based on pet age
    const nextDate = computeNextDate({
      type: 'medical',
      fromDate: form.value.date,
      petAge: petAge.value
    })

    const recordData = {
      petId: petStore.currentPet.id,
      type: 'medical' as const,
      name: form.value.name || '年度体检',
      date: form.value.date,
      nextDate,
      hospital: form.value.hospital,
      conclusion: form.value.conclusion,
      attachments: form.value.attachments,
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
  const result = await uni.showModal({
    title: '完成体检',
    content: '确认已完成这次体检？系统将自动计算下次体检时间。'
  })

  if (!result.confirm) return

  loading.value = true

  try {
    const newNextDate = computeNextDate({
      type: 'medical',
      fromDate: Date.now(),
      petAge: petAge.value
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
.medical-page {
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

      .record-name {
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

      .attachments {
        display: flex;
        align-items: center;
        margin-top: 8rpx;
        padding: 8rpx 12rpx;
        background: #fff3e0;
        border-radius: $radius-sm;

        .attachment-text {
          margin-left: 8rpx;
          font-size: $font-sm;
          color: #e65100;
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

  .upload-section {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .upload-count {
      font-size: $font-sm;
      color: $text-secondary;
    }
  }

  .cycle-info {
    display: flex;
    align-items: center;
    padding: $spacing-sm;
    background: #e3f2fd;
    border-radius: $radius-sm;
    margin: $spacing-sm 0;

    .cycle-text {
      margin-left: 8rpx;
      font-size: $font-sm;
      color: #1565c0;
    }
  }

  .form-actions {
    padding: $spacing-md;
    border-top: 1rpx solid $border-color;
  }
}
</style>
