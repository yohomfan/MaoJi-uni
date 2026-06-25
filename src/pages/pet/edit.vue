<template>
  <view class="edit-page">
    <u-form :model="form" ref="formRef" label-width="140rpx">
      <!-- Avatar Upload -->
      <u-form-item label="宠物头像">
        <view class="avatar-upload" @click="chooseAvatar">
          <image v-if="form.avatar" :src="form.avatar" class="avatar-preview" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <u-icon name="camera-fill" size="48" color="#999"></u-icon>
            <text class="upload-hint">点击上传</text>
          </view>
        </view>
      </u-form-item>

      <!-- Name -->
      <u-form-item label="宠物名字" required>
        <u-input v-model="form.name" placeholder="请输入宠物名字" />
      </u-form-item>

      <!-- Species -->
      <u-form-item label="物种" required>
        <u-radio-group v-model="form.species">
          <u-radio name="cat" label="猫咪">猫咪</u-radio>
          <u-radio name="dog" label="狗狗">狗狗</u-radio>
          <u-radio name="other" label="其他">其他</u-radio>
        </u-radio-group>
      </u-form-item>

      <!-- Breed -->
      <u-form-item label="品种" required>
        <u-input v-model="form.breed" placeholder="请输入品种" />
      </u-form-item>

      <!-- Gender -->
      <u-form-item label="性别" required>
        <u-radio-group v-model="form.gender">
          <u-radio name="male" label="公">公</u-radio>
          <u-radio name="female" label="母">母</u-radio>
          <u-radio name="unknown" label="未知">未知</u-radio>
        </u-radio-group>
      </u-form-item>

      <!-- Birthday -->
      <u-form-item label="生日" required>
        <view @click="showDatePicker = true" class="date-picker-trigger">
          <text v-if="form.birthday">{{ formatDate(form.birthday) }}</text>
          <text v-else class="placeholder-text">请选择生日</text>
        </view>
      </u-form-item>

      <!-- Weight -->
      <u-form-item label="当前体重(kg)" required>
        <u-input v-model="form.weight" type="number" placeholder="请输入体重" />
      </u-form-item>

      <!-- Neutered -->
      <u-form-item label="绝育状态" required>
        <u-radio-group v-model="form.isNeutered">
          <u-radio name="yes" label="已绝育">已绝育</u-radio>
          <u-radio name="no" label="未绝育">未绝育</u-radio>
          <u-radio name="unknown" label="未知">未知</u-radio>
        </u-radio-group>
      </u-form-item>

      <!-- Chip Number -->
      <u-form-item label="芯片号(可选)">
        <u-input v-model="form.chipNo" placeholder="请输入芯片号" />
      </u-form-item>
    </u-form>

    <!-- Submit Button -->
    <view class="button-group">
      <u-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? '保存修改' : '添加宠物' }}
      </u-button>
      <u-button v-if="isEdit" type="error" @click="handleDelete" :loading="loading">
        删除宠物
      </u-button>
    </view>

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
import { ref, onMounted } from 'vue'
import { usePetStore } from '@/stores/pet'
import * as storageAdapter from '@/platform/storage'

const petStore = usePetStore()

// Get pet ID from query params (if editing)
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1] as any
const petId = currentPage?.options?.id || null
const isEdit = ref(!!petId)
const loading = ref(false)
const showDatePicker = ref(false)

// Form data
const form = ref({
  avatar: '',
  name: '',
  species: 'cat' as 'cat' | 'dog' | 'other',
  breed: '',
  gender: 'unknown' as 'male' | 'female' | 'unknown',
  birthday: 0,
  weight: '',
  isNeutered: 'unknown' as 'yes' | 'no' | 'unknown',
  chipNo: ''
})

onMounted(async () => {
  if (isEdit.value && petId) {
    // Load existing pet data
    const pet = await petStore.getPetById(petId)
    if (pet) {
      form.value = {
        avatar: pet.avatar || '',
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        gender: pet.gender,
        birthday: pet.birthday,
        weight: pet.weight.toString(),
        isNeutered: pet.isNeutered,
        chipNo: pet.chipNo || ''
      }
    }
  }
})

function formatDate(timestamp: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function onDateConfirm(e: any) {
  form.value.birthday = e.value
  showDatePicker.value = false
}

async function chooseAvatar() {
  try {
    // Use platform storage adapter to handle image selection
    const result = await storageAdapter.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    if (result.success && result.tempFilePaths && result.tempFilePaths.length > 0) {
      // Upload the image
      const uploadResult = await storageAdapter.uploadFile({
        filePath: result.tempFilePaths[0],
        cloudPath: `pet-avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      })

      if (uploadResult.success && uploadResult.fileID) {
        form.value.avatar = uploadResult.fileID
        uni.showToast({ title: '头像上传成功', icon: 'success' })
      }
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '上传失败', icon: 'none' })
  }
}

async function handleSubmit() {
  // Validate form
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入宠物名字', icon: 'none' })
    return
  }

  if (!form.value.breed.trim()) {
    uni.showToast({ title: '请输入品种', icon: 'none' })
    return
  }

  if (!form.value.birthday) {
    uni.showToast({ title: '请选择生日', icon: 'none' })
    return
  }

  const weight = parseFloat(form.value.weight)
  if (isNaN(weight) || weight <= 0) {
    uni.showToast({ title: '请输入有效的体重', icon: 'none' })
    return
  }

  loading.value = true

  try {
    const petData = {
      avatar: form.value.avatar,
      name: form.value.name.trim(),
      species: form.value.species,
      breed: form.value.breed.trim(),
      gender: form.value.gender,
      birthday: form.value.birthday,
      weight: weight,
      isNeutered: form.value.isNeutered,
      chipNo: form.value.chipNo.trim() || undefined
    }

    let result
    if (isEdit.value && petId) {
      result = await petStore.updatePet(petId, petData)
    } else {
      result = await petStore.createPet(petData)
    }

    if (result.success) {
      uni.showToast({
        title: isEdit.value ? '修改成功' : '添加成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: result.message || '操作失败',
        icon: 'none'
      })
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: '删除后宠物的所有健康记录都将保留，但宠物档案将被移除。确定要删除吗？',
    confirmText: '确定删除',
    confirmColor: '#ff4444',
    success: async (res) => {
      if (res.confirm && petId) {
        loading.value = true
        const result = await petStore.deletePet(petId)
        loading.value = false

        if (result.success) {
          uni.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: result.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.edit-page {
  min-height: 100vh;
  background: $bg-secondary;
  padding: $spacing-md;
}

.avatar-upload {
  display: flex;
  align-items: center;
  justify-content: center;

  .avatar-preview,
  .avatar-placeholder {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: $bg-disabled;
  }

  .avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed #ddd;

    .upload-hint {
      font-size: $font-sm;
      color: $text-secondary;
      margin-top: $spacing-xs;
    }
  }
}

.date-picker-trigger {
  flex: 1;
  padding: $spacing-sm 0;

  .placeholder-text {
    color: $text-placeholder;
  }
}

.button-group {
  margin-top: $spacing-lg;
  padding: 0 $spacing-md;

  .u-button {
    margin-bottom: $spacing-md;
  }
}
</style>
