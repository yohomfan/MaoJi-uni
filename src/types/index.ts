/**
 * TypeScript Type Definitions for Maoji App
 */

// ==================== Pet Types ====================
export interface Pet {
  id: string
  _openid: string
  name: string
  species: 'cat' | 'dog' | 'other'
  breed: string
  gender: 'male' | 'female' | 'unknown'
  birthday: number // Timestamp
  avatar: string // File ID or URL
  weight: number // Current weight in kg
  isNeutered: 'yes' | 'no' | 'unknown'
  chipNo?: string // Optional microchip number
  createTime: number // Timestamp
  deletedAt?: number // Soft delete timestamp
}

// ==================== Health Record Types ====================
export type HealthRecordType = 'vaccine' | 'deworm' | 'medical' | 'medicine' | 'weight'

export interface HealthRecord {
  id: string
  petId: string
  type: HealthRecordType
  date: number // Timestamp of the health event
  nextDate?: number // Timestamp for next scheduled event
  name: string // Name of vaccine/medicine/etc
  hospital?: string // Hospital or clinic name
  note?: string // Additional notes
  attachments?: string[] // File IDs for reports/images
  remindStatus?: 'pending' | 'sent' | 'completed'
  createTime: number

  // Type-specific fields
  // For deworm
  dewormType?: 'internal' | 'external'

  // For medicine
  dosage?: string
  startDate?: number
  endDate?: number

  // For weight
  weightValue?: number // Weight in kg

  // For medical
  conclusion?: string
  metrics?: Record<string, any> // Key health metrics
}

// ==================== Knowledge Types ====================
export interface KnowledgeArticle {
  id: string
  title: string
  category: 'vaccine' | 'deworm' | 'common_disease' | 'nutrition' | 'emergency'
  cover: string // Cover image URL
  content: string // Markdown content
  summary?: string
  sort: number // Display order
  enabled: boolean
  createTime: number
}

export interface Breed {
  id: string
  name: string
  species: 'cat' | 'dog'
  healthTraits: string[]
  commonDiseases: string[]
  careTips: string[]
  weightRange: {
    min: number // kg
    max: number // kg
  }
  description: string
  image?: string
}

// ==================== User Types ====================
export interface User {
  _openid: string
  nickname: string
  avatar: string
  vipExpireAt?: number // Timestamp, undefined if not VIP
  subscribeMsg: Record<string, boolean> // Template ID -> granted status
  createTime: number
}

// ==================== Order Types ====================
export interface Order {
  id: string
  _openid: string
  type: 'vip' | 'other'
  amount: number // Amount in cents
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  payTime?: number
  outTradeNo?: string // Payment platform trade number
  createTime: number
}

// ==================== UI State Types ====================
export interface HealthTodo {
  id: string
  petId: string
  petName: string
  type: HealthRecordType
  name: string
  dueDate: number
  overdueDays?: number
  urgency: 'overdue' | 'today' | 'tomorrow' | 'week' | 'month'
}

export interface CalendarDay {
  date: number // Timestamp (day start)
  isToday: boolean
  isCurrentMonth: boolean
  todos: HealthTodo[]
}

// ==================== Privacy Consent ====================
export interface PrivacyConsent {
  version: string
  acceptedAt: number
  agreements: {
    userAgreement: boolean
    privacyPolicy: boolean
  }
}
