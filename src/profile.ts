import { createContext, useContext } from 'react'
import type { Muscle } from 'react-body-highlighter'

export type Goal = 'lose' | 'gain' | 'muscle' | 'health'
export type Level = 'beginner' | 'basic' | 'intermediate' | 'advanced'
export type Sex = 'female' | 'male'
export type Place = 'home' | 'gym'

export interface Profile {
  /** Đã đi hết các bước thiết lập */
  onboarded: boolean
  name: string
  email: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  /** Cân nặng mong muốn (mục tiêu giảm cân, tăng cân, tăng cơ) */
  targetKg: number
  /** Cân nặng lúc bắt đầu, để tính đã giảm/tăng được bao nhiêu */
  startKg: number
  /** Ngày bắt đầu dùng app, dạng 2026-10-16 */
  joinedAt: string
  goal: Goal
  focus: Muscle[]
  level: Level
  minutes: number
  days: number
  place: Place
  equipment: string[]
  budget: number
  /** Nhắc giờ tập (giờ dạng 19:00) */
  remind: boolean
  remindAt: string
  /** Nhắc uống nước mỗi 90 phút trong ngày */
  waterRemind: boolean
}

export const GOAL_LABEL: Record<Goal, string> = { lose: 'Giảm cân', gain: 'Tăng cân', muscle: 'Tăng cơ', health: 'Khỏe hơn mỗi ngày' }
export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Mới bắt đầu',
  basic: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
}

export const DEFAULT_PROFILE: Profile = {
  onboarded: false,
  name: '',
  email: '',
  sex: 'female',
  age: 20,
  heightCm: 160,
  weightKg: 62,
  targetKg: 58,
  startKg: 62,
  joinedAt: '',
  goal: 'lose',
  focus: ['abs', 'obliques', 'gluteal', 'abductors'],
  level: 'beginner',
  minutes: 30,
  days: 4,
  place: 'home',
  equipment: ['Thảm'],
  budget: 120000,
  remind: false,
  remindAt: '19:00',
  waterRemind: true,
}

// Calo mỗi ngày: BMR theo Mifflin-St Jeor × hệ số vận động, cộng/trừ theo mục tiêu
export function kcalTarget(p: Profile) {
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161)
  const activity = p.days >= 5 ? 1.55 : p.days >= 3 ? 1.375 : 1.2
  const delta = p.goal === 'lose' ? -400 : p.goal === 'gain' ? 400 : p.goal === 'muscle' ? 200 : 0
  return Math.round((bmr * activity + delta) / 10) * 10
}

/**
 * Lượng đạm, tinh bột, chất béo mỗi ngày (gam): đạm theo cân nặng và mục tiêu,
 * chất béo khoảng 27% năng lượng, phần còn lại là tinh bột.
 */
export function macroTargets(p: Profile) {
  const kcal = kcalTarget(p)
  const perKg = p.goal === 'muscle' ? 1.8 : p.goal === 'health' ? 1.2 : 1.6
  const protein = Math.round(p.weightKg * perKg)
  const fat = Math.round((kcal * 0.27) / 9)
  const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { kcal, protein, carb, fat }
}

/** Mục tiêu có đếm cân nặng không ("Khỏe hơn mỗi ngày" thì không) */
export const hasWeightGoal = (p: Profile) => p.goal !== 'health' && Math.abs(p.targetKg - p.weightKg) >= 0.1

/** Tốc độ an toàn: giảm 0,5 kg mỗi tuần, tăng 0,25 kg mỗi tuần */
export function targetEta(p: Profile, from = new Date()) {
  if (!hasWeightGoal(p)) return null
  const perWeek = p.targetKg < p.weightKg ? 0.5 : 0.25
  const weeks = Math.ceil(Math.abs(p.weightKg - p.targetKg) / perWeek)
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + weeks * 7)
  return { weeks, perWeek, date: d }
}

export const bmi = (p: Profile) => (p.heightCm > 0 ? p.weightKg / (p.heightCm / 100) ** 2 : 0)

// Ở phòng gym coi như có đủ dụng cụ; ở nhà không chọn gì nghĩa là chỉ tập với trọng lượng cơ thể
export const equipmentLabel = (p: Profile) =>
  p.place === 'gym' ? 'Phòng gym (đủ máy và tạ)' : p.equipment.length ? 'Ở nhà: ' + p.equipment.join(', ').toLowerCase() : 'Ở nhà, không dụng cụ'

export const initials = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join('')

export const firstName = (name: string) => name.trim().split(/\s+/).pop() ?? ''

export const ProfileContext = createContext<{ profile: Profile; update: (patch: Partial<Profile>) => void }>({
  profile: DEFAULT_PROFILE,
  update: () => {},
})

export const useProfile = () => useContext(ProfileContext)
