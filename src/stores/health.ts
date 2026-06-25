/**
 * Health Store - Pinia
 * Manages health records and reminders
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HealthRecord, HealthTodo } from '@/types'
import * as dataAdapter from '@/platform/data'
import { usePetStore } from './pet'

export const useHealthStore = defineStore('health', () => {
  // State
  const records = ref<HealthRecord[]>([])
  const loading = ref(false)

  // Getters
  const recordsByType = computed(() => (petId: string, type: string) => {
    return records.value.filter(r => r.petId === petId && r.type === type)
  })

  const upcomingRecords = computed(() => (petId: string) => {
    const now = Date.now()
    return records.value
      .filter(r => r.petId === petId && r.nextDate && r.nextDate > now)
      .sort((a, b) => (a.nextDate || 0) - (b.nextDate || 0))
  })

  const overdueRecords = computed(() => (petId: string) => {
    const now = Date.now()
    return records.value
      .filter(r => r.petId === petId && r.nextDate && r.nextDate < now)
      .sort((a, b) => (a.nextDate || 0) - (b.nextDate || 0))
  })

  const allTodos = computed((): HealthTodo[] => {
    const petStore = usePetStore()
    const now = Date.now()
    const today = new Date().setHours(0, 0, 0, 0)
    const tomorrow = today + 24 * 60 * 60 * 1000
    const week = today + 7 * 24 * 60 * 60 * 1000

    const todos: HealthTodo[] = []

    records.value.forEach(record => {
      if (!record.nextDate) return

      const pet = petStore.pets.find(p => p.id === record.petId)
      if (!pet) return

      let urgency: HealthTodo['urgency'] = 'month'
      let overdueDays: number | undefined

      if (record.nextDate < now) {
        urgency = 'overdue'
        overdueDays = Math.floor((now - record.nextDate) / (24 * 60 * 60 * 1000))
      } else if (record.nextDate < today + 24 * 60 * 60 * 1000) {
        urgency = 'today'
      } else if (record.nextDate < tomorrow + 24 * 60 * 60 * 1000) {
        urgency = 'tomorrow'
      } else if (record.nextDate < week) {
        urgency = 'week'
      }

      todos.push({
        id: record.id,
        petId: record.petId,
        petName: pet.name,
        type: record.type,
        name: record.name,
        dueDate: record.nextDate,
        overdueDays,
        urgency
      })
    })

    return todos.sort((a, b) => a.dueDate - b.dueDate)
  })

  const todayTodos = computed(() => {
    return allTodos.value.filter(t => t.urgency === 'today' || t.urgency === 'overdue')
  })

  // Actions
  async function loadRecords(petId: string) {
    loading.value = true
    try {
      const result = await dataAdapter.getHealthRecords(petId)
      if (result.success && result.data) {
        // Merge with existing records (avoid duplicates)
        const existingIds = new Set(records.value.map(r => r.id))
        const newRecords = result.data.filter(r => !existingIds.has(r.id))
        records.value.push(...newRecords)
      }
    } catch (error) {
      console.error('Failed to load health records', error)
    } finally {
      loading.value = false
    }
  }

  async function createRecord(recordData: Omit<HealthRecord, 'id' | 'createTime'>) {
    loading.value = true
    try {
      const result = await dataAdapter.createHealthRecord(recordData)

      if (result.success && result.data) {
        records.value.push(result.data)
        return { success: true, data: result.data }
      }

      return { success: false, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  async function updateRecord(id: string, updates: Partial<HealthRecord>) {
    loading.value = true
    try {
      const result = await dataAdapter.updateHealthRecord(id, updates)

      if (result.success && result.data) {
        const index = records.value.findIndex(r => r.id === id)
        if (index !== -1) {
          records.value[index] = result.data
        }

        return { success: true, data: result.data }
      }

      return { success: false, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  async function deleteRecord(id: string) {
    loading.value = true
    try {
      const result = await dataAdapter.deleteHealthRecord(id)

      if (result.success) {
        records.value = records.value.filter(r => r.id !== id)
        return { success: true }
      }

      return { success: false, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  async function completeRecord(id: string, completedDate?: number) {
    const record = records.value.find(r => r.id === id)
    if (!record) return { success: false, message: '记录不存在' }

    // TODO: Implement next date calculation based on health cycle
    // For now, just mark as completed
    return updateRecord(id, {
      date: completedDate || Date.now(),
      remindStatus: 'completed'
    })
  }

  async function postponeRecord(id: string, newDate: number) {
    return updateRecord(id, {
      nextDate: newDate
    })
  }

  return {
    // State
    records,
    loading,

    // Getters
    recordsByType,
    upcomingRecords,
    overdueRecords,
    allTodos,
    todayTodos,

    // Actions
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    completeRecord,
    postponeRecord
  }
})
