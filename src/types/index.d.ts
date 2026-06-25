/**
 * Global type definitions for Maoji uni-app project
 */

export interface Pet {
  id: string
  _openid: string
  name: string
  species: 'cat' | 'dog' | 'other'
  breed: string
  gender: 'male' | 'female' | 'unknown'
  birthday: number // timestamp
  avatar: string
  weight: number
  isNeutered: 'yes' | 'no' | 'unknown'
  chipNo?: string
  deletedAt?: number
  createTime: number
}

export interface HealthRecord {
  id: string
  petId: string
  type: 'vaccine' | 'deworm' | 'medical' | 'medicine' | 'weight'
  date: number
  nextDate?: number
  name: string
  hospital?: string
  note?: string
  attachments?: string[]
  remindStatus?: string
  createTime: number
}

export interface KnowledgeArticle {
  id: string
  title: string
  category: string
  cover: string
  content: string
  sort: number
  enabled: boolean
}

export interface Order {
  id: string
  _openid: string
  type: 'vip' | 'other'
  amount: number
  status: string
  payTime?: number
  outTradeNo: string
}

export interface User {
  _openid: string
  nickname: string
  avatar: string
  vipExpireAt: number
  subscribeMsg: Record<string, any>
  createTime: number
}
