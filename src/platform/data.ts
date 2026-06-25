/**
 * Platform Adapter - Data (CRUD Operations)
 *
 * Abstracts database operations for both H5 and mp-weixin.
 * - H5: Mock store backed by uni.setStorageSync
 * - mp-weixin: wx.cloud.callFunction / database
 */

import type { Pet, HealthRecord, KnowledgeArticle, Order } from '@/types'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// #ifdef H5
/**
 * H5 Mock Data Store
 * Uses localStorage with uni.setStorageSync
 */

// Initialize demo data on first load
function initDemoData() {
  const initialized = uni.getStorageSync('demo_data_initialized')
  if (initialized) return

  // Seed demo pet
  const demoPet: Pet = {
    id: 'demo_pet_1',
    _openid: 'demo_user_h5_12345',
    name: '毛球',
    species: 'cat',
    breed: '英国短毛猫',
    gender: 'male',
    birthday: new Date(2022, 5, 15).getTime(),
    avatar: '',
    weight: 4.5,
    isNeutered: 'yes',
    chipNo: '',
    createTime: Date.now()
  }

  // Seed demo weight records
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneMonth = 30 * oneDay

  const demoWeightRecords: HealthRecord[] = [
    {
      id: 'weight_1',
      petId: 'demo_pet_1',
      type: 'weight',
      name: '体重记录',
      date: now - 6 * oneMonth,
      weightValue: 3.8,
      note: '刚领养回家'
    },
    {
      id: 'weight_2',
      petId: 'demo_pet_1',
      type: 'weight',
      name: '体重记录',
      date: now - 5 * oneMonth,
      weightValue: 4.0,
      note: ''
    },
    {
      id: 'weight_3',
      petId: 'demo_pet_1',
      type: 'weight',
      name: '体重记录',
      date: now - 4 * oneMonth,
      weightValue: 4.2,
      note: ''
    },
    {
      id: 'weight_4',
      petId: 'demo_pet_1',
      type: 'weight',
      name: '体重记录',
      date: now - 3 * oneMonth,
      weightValue: 4.3,
      note: ''
    },
    {
      id: 'weight_5',
      petId: 'demo_pet_1',
      type: 'weight',
      name: '体重记录',
      date: now - 2 * oneMonth,
      weightValue: 4.4,
      note: ''
    },
    {
      id: 'weight_6',
      petId: 'demo_pet_1',
      type: 'weight',
      name: '体重记录',
      date: now - oneMonth,
      weightValue: 4.5,
      note: ''
    },
    {
      id: 'weight_7',
      petId: 'demo_pet_1',
      type: 'weight',
      name: '体重记录',
      date: now - 15 * oneDay,
      weightValue: 4.5,
      note: '体重稳定'
    }
  ]

  uni.setStorageSync('pets', JSON.stringify([demoPet]))
  uni.setStorageSync('health_records', JSON.stringify(demoWeightRecords))
  uni.setStorageSync('orders', JSON.stringify([]))
  uni.setStorageSync('demo_data_initialized', true)
}

// Ensure demo data is initialized before any operation
let demoDataInitialized = false
function ensureDemoData() {
  if (demoDataInitialized) return
  try {
    initDemoData()
    demoDataInitialized = true
  } catch (e) {
    console.error('Failed to init demo data:', e)
  }
}

// Pet CRUD
export async function getPets(): Promise<ApiResponse<Pet[]>> {
  try {
    ensureDemoData()
    const pets = JSON.parse(uni.getStorageSync('pets') || '[]')
    // Filter out soft-deleted pets
    const activePets = pets.filter((p: Pet) => !p.deletedAt)
    return { success: true, data: activePets }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getPetById(id: string): Promise<ApiResponse<Pet>> {
  try {
    ensureDemoData()
    const pets = JSON.parse(uni.getStorageSync('pets') || '[]')
    const pet = pets.find((p: Pet) => p.id === id && !p.deletedAt)
    if (pet) {
      return { success: true, data: pet }
    }
    return { success: false, message: '宠物不存在' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function createPet(pet: Omit<Pet, 'id' | 'createTime'>): Promise<ApiResponse<Pet>> {
  try {
    const pets = JSON.parse(uni.getStorageSync('pets') || '[]')
    const newPet: Pet = {
      ...pet,
      id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createTime: Date.now()
    }
    pets.push(newPet)
    uni.setStorageSync('pets', JSON.stringify(pets))
    return { success: true, data: newPet }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updatePet(id: string, updates: Partial<Pet>): Promise<ApiResponse<Pet>> {
  try {
    const pets = JSON.parse(uni.getStorageSync('pets') || '[]')
    const index = pets.findIndex((p: Pet) => p.id === id)
    if (index === -1) {
      return { success: false, message: '宠物不存在' }
    }
    pets[index] = { ...pets[index], ...updates }
    uni.setStorageSync('pets', JSON.stringify(pets))
    return { success: true, data: pets[index] }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deletePet(id: string): Promise<ApiResponse<boolean>> {
  try {
    const pets = JSON.parse(uni.getStorageSync('pets') || '[]')
    const index = pets.findIndex((p: Pet) => p.id === id)
    if (index === -1) {
      return { success: false, message: '宠物不存在' }
    }
    // Soft delete
    pets[index].deletedAt = Date.now()
    uni.setStorageSync('pets', JSON.stringify(pets))
    return { success: true, data: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Health Record CRUD
export async function getHealthRecords(petId: string): Promise<ApiResponse<HealthRecord[]>> {
  try {
    ensureDemoData()
    const records = JSON.parse(uni.getStorageSync('health_records') || '[]')
    const petRecords = records.filter((r: HealthRecord) => r.petId === petId)
    return { success: true, data: petRecords }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function createHealthRecord(
  record: Omit<HealthRecord, 'id' | 'createTime'>
): Promise<ApiResponse<HealthRecord>> {
  try {
    const records = JSON.parse(uni.getStorageSync('health_records') || '[]')
    const newRecord: HealthRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createTime: Date.now()
    }
    records.push(newRecord)
    uni.setStorageSync('health_records', JSON.stringify(records))
    return { success: true, data: newRecord }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updateHealthRecord(
  id: string,
  updates: Partial<HealthRecord>
): Promise<ApiResponse<HealthRecord>> {
  try {
    const records = JSON.parse(uni.getStorageSync('health_records') || '[]')
    const index = records.findIndex((r: HealthRecord) => r.id === id)
    if (index === -1) {
      return { success: false, message: '记录不存在' }
    }
    records[index] = { ...records[index], ...updates }
    uni.setStorageSync('health_records', JSON.stringify(records))
    return { success: true, data: records[index] }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteHealthRecord(id: string): Promise<ApiResponse<boolean>> {
  try {
    const records = JSON.parse(uni.getStorageSync('health_records') || '[]')
    const filtered = records.filter((r: HealthRecord) => r.id !== id)
    uni.setStorageSync('health_records', JSON.stringify(filtered))
    return { success: true, data: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Orders
export async function getOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const orders = JSON.parse(uni.getStorageSync('orders') || '[]')
    return { success: true, data: orders }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'createTime'>): Promise<ApiResponse<Order>> {
  try {
    const orders = JSON.parse(uni.getStorageSync('orders') || '[]')
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createTime: Date.now()
    }
    orders.push(newOrder)
    uni.setStorageSync('orders', JSON.stringify(orders))
    return { success: true, data: newOrder }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
// #endif

// #ifdef MP-WEIXIN
/**
 * WeChat Cloud Database Operations
 * Uses cloud functions for CRUD operations
 */

// Pet CRUD
export async function getPets(): Promise<ApiResponse<Pet[]>> {
  try {
    const res = await uni.cloud.callFunction({
      name: 'pet-crud',
      data: { action: 'list' }
    })
    return { success: true, data: res.result?.data || [] }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getPetById(id: string): Promise<ApiResponse<Pet>> {
  try {
    const res = await uni.cloud.callFunction({
      name: 'pet-crud',
      data: { action: 'get', id }
    })
    if (res.result?.data) {
      return { success: true, data: res.result.data }
    }
    return { success: false, message: '宠物不存在' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function createPet(pet: Omit<Pet, 'id' | 'createTime'>): Promise<ApiResponse<Pet>> {
  try {
    const res = await uni.cloud.callFunction({
      name: 'pet-crud',
      data: { action: 'create', pet }
    })
    return { success: true, data: res.result?.data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updatePet(id: string, updates: Partial<Pet>): Promise<ApiResponse<Pet>> {
  try {
    const res = await uni.cloud.callFunction({
      name: 'pet-crud',
      data: { action: 'update', id, updates }
    })
    return { success: true, data: res.result?.data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deletePet(id: string): Promise<ApiResponse<boolean>> {
  try {
    await uni.cloud.callFunction({
      name: 'pet-crud',
      data: { action: 'delete', id }
    })
    return { success: true, data: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Health Record CRUD
export async function getHealthRecords(petId: string): Promise<ApiResponse<HealthRecord[]>> {
  try {
    const res = await uni.cloud.callFunction({
      name: 'health-crud',
      data: { action: 'list', petId }
    })
    return { success: true, data: res.result?.data || [] }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function createHealthRecord(
  record: Omit<HealthRecord, 'id' | 'createTime'>
): Promise<ApiResponse<HealthRecord>> {
  try {
    const res = await uni.cloud.callFunction({
      name: 'health-crud',
      data: { action: 'create', record }
    })
    return { success: true, data: res.result?.data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updateHealthRecord(
  id: string,
  updates: Partial<HealthRecord>
): Promise<ApiResponse<HealthRecord>> {
  try {
    const res = await uni.cloud.callFunction({
      name: 'health-crud',
      data: { action: 'update', id, updates }
    })
    return { success: true, data: res.result?.data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteHealthRecord(id: string): Promise<ApiResponse<boolean>> {
  try {
    await uni.cloud.callFunction({
      name: 'health-crud',
      data: { action: 'delete', id }
    })
    return { success: true, data: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Orders
export async function getOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const res = await uni.cloud.database().collection('orders')
      .where({ _openid: '{openid}' })
      .orderBy('createTime', 'desc')
      .get()
    return { success: true, data: res.data }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'createTime'>): Promise<ApiResponse<Order>> {
  try {
    const res = await uni.cloud.database().collection('orders').add({
      data: order
    })
    return { success: true, data: { ...order, id: res._id, createTime: Date.now() } }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
// #endif
