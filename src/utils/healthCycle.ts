/**
 * Health Cycle Calculation Utility
 * Computes next dates for vaccines, deworming, and medical exams based on cycles
 */

export type VaccinePreset = 'rabies' | 'triple' | 'quadruple' | 'custom'
export type DewormType = 'internal' | 'external'

export interface NextDateParams {
  type: 'vaccine' | 'deworm' | 'medical'
  preset?: VaccinePreset
  dewormType?: DewormType
  fromDate: number // Timestamp
  petAge?: number // Pet age in months (for medical exams)
  currentShot?: number // For multi-shot vaccines (1, 2, 3)
}

/**
 * Compute next date for a health record based on type and cycle rules
 */
export function computeNextDate(params: NextDateParams): number {
  const { type, preset, dewormType, fromDate, petAge, currentShot } = params
  const date = new Date(fromDate)

  switch (type) {
    case 'vaccine':
      return computeVaccineNextDate(date, preset, currentShot)

    case 'deworm':
      return computeDewormNextDate(date, dewormType)

    case 'medical':
      return computeMedicalNextDate(date, petAge)

    default:
      return fromDate
  }
}

/**
 * Compute next vaccine date based on preset and shot number
 *
 * Rules:
 * - Rabies: 365 days
 * - Triple/Quadruple: First year 3 shots at 21-day intervals, then 365 days annually
 */
function computeVaccineNextDate(date: Date, preset?: VaccinePreset, currentShot?: number): number {
  const oneDay = 24 * 60 * 60 * 1000

  switch (preset) {
    case 'rabies':
      // Annual booster
      return date.getTime() + 365 * oneDay

    case 'triple':
    case 'quadruple':
      // First year: 3 shots at 21-day intervals
      if (currentShot === 1 || currentShot === 2) {
        return date.getTime() + 21 * oneDay
      }
      // After 3rd shot, annual booster
      return date.getTime() + 365 * oneDay

    case 'custom':
    default:
      // Default to annual for custom vaccines
      return date.getTime() + 365 * oneDay
  }
}

/**
 * Compute next deworming date based on type
 *
 * Rules:
 * - Internal: 90 days
 * - External: 30 days
 */
function computeDewormNextDate(date: Date, dewormType?: DewormType): number {
  const oneDay = 24 * 60 * 60 * 1000

  switch (dewormType) {
    case 'internal':
      return date.getTime() + 90 * oneDay

    case 'external':
      return date.getTime() + 30 * oneDay

    default:
      // Default to 90 days
      return date.getTime() + 90 * oneDay
  }
}

/**
 * Compute next medical exam date based on pet age
 *
 * Rules:
 * - Regular: 365 days
 * - Senior (age >= 7 years = 84 months): 180 days
 */
function computeMedicalNextDate(date: Date, petAge?: number): number {
  const oneDay = 24 * 60 * 60 * 1000

  // If pet is 7 years old or more (84 months), check every 6 months
  if (petAge !== undefined && petAge >= 84) {
    return date.getTime() + 180 * oneDay
  }

  // Default to annual checkup
  return date.getTime() + 365 * oneDay
}

/**
 * Get cycle description in Chinese
 */
export function getCycleDescription(type: 'vaccine' | 'deworm' | 'medical', preset?: string, dewormType?: string): string {
  switch (type) {
    case 'vaccine':
      if (preset === 'rabies') return '每年一次'
      if (preset === 'triple' || preset === 'quadruple') return '首年三针（间隔21天），之后每年一次'
      return '每年一次'

    case 'deworm':
      if (dewormType === 'internal') return '每90天一次'
      if (dewormType === 'external') return '每30天一次'
      return '每90天一次'

    case 'medical':
      return '每年一次（7岁以上每半年一次）'

    default:
      return ''
  }
}

/**
 * Calculate pet age in months from birthday
 */
export function calculatePetAgeMonths(birthday: number): number {
  const now = new Date()
  const birth = new Date(birthday)

  const yearsDiff = now.getFullYear() - birth.getFullYear()
  const monthsDiff = now.getMonth() - birth.getMonth()

  let totalMonths = yearsDiff * 12 + monthsDiff

  if (now.getDate() < birth.getDate()) {
    totalMonths -= 1
  }

  return Math.max(0, totalMonths)
}
