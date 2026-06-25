/**
 * Pet Store - Pinia
 * Manages pet data and operations
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pet } from '@/types'
import * as dataAdapter from '@/platform/data'

export const usePetStore = defineStore('pet', () => {
  // State
  const pets = ref<Pet[]>([])
  const currentPetId = ref<string | null>(null)
  const loading = ref(false)

  // Getters
  const currentPet = computed(() => {
    if (!currentPetId.value) return null
    return pets.value.find(p => p.id === currentPetId.value) || null
  })

  const hasPets = computed(() => pets.value.length > 0)

  const petsCount = computed(() => pets.value.length)

  // Actions
  async function loadPets() {
    loading.value = true
    try {
      const result = await dataAdapter.getPets()
      if (result.success && result.data) {
        pets.value = result.data

        // Set current pet to first pet if not set
        if (pets.value.length > 0 && !currentPetId.value) {
          currentPetId.value = pets.value[0].id
        }
      }
    } catch (error) {
      console.error('Failed to load pets', error)
    } finally {
      loading.value = false
    }
  }

  async function getPetById(id: string): Promise<Pet | null> {
    // Check cache first
    const cached = pets.value.find(p => p.id === id)
    if (cached) return cached

    // Load from data adapter
    const result = await dataAdapter.getPetById(id)
    if (result.success && result.data) {
      return result.data
    }

    return null
  }

  async function createPet(petData: Omit<Pet, 'id' | 'createTime' | '_openid'>) {
    loading.value = true
    try {
      // Get openid from storage (set by auth adapter)
      const openid = uni.getStorageSync('openid') || 'demo_user_h5_12345'

      const result = await dataAdapter.createPet({
        ...petData,
        _openid: openid
      })

      if (result.success && result.data) {
        pets.value.push(result.data)

        // Set as current pet if it's the first one
        if (pets.value.length === 1) {
          currentPetId.value = result.data.id
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

  async function updatePet(id: string, updates: Partial<Pet>) {
    loading.value = true
    try {
      const result = await dataAdapter.updatePet(id, updates)

      if (result.success && result.data) {
        const index = pets.value.findIndex(p => p.id === id)
        if (index !== -1) {
          pets.value[index] = result.data
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

  async function deletePet(id: string) {
    loading.value = true
    try {
      const result = await dataAdapter.deletePet(id)

      if (result.success) {
        // Remove from local array
        pets.value = pets.value.filter(p => p.id !== id)

        // Update current pet if needed
        if (currentPetId.value === id) {
          currentPetId.value = pets.value.length > 0 ? pets.value[0].id : null
        }

        return { success: true }
      }

      return { success: false, message: result.message }
    } catch (error: any) {
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  function setCurrentPet(id: string) {
    const pet = pets.value.find(p => p.id === id)
    if (pet) {
      currentPetId.value = id
      uni.setStorageSync('currentPetId', id)
    }
  }

  return {
    // State
    pets,
    currentPetId,
    loading,

    // Getters
    currentPet,
    hasPets,
    petsCount,

    // Actions
    loadPets,
    getPetById,
    createPet,
    updatePet,
    deletePet,
    setCurrentPet
  }
})
