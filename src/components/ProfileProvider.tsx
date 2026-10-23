import { useState, type ReactNode } from 'react'
import { isoDate } from '../lib/format'
import { DEFAULT_PROFILE, ProfileContext, type Profile } from '../profile'

const KEY = 'fitcoach.profile.v3'

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_PROFILE
    const saved = JSON.parse(raw) as Partial<Profile>
    const p = { ...DEFAULT_PROFILE, ...saved }
    // Hồ sơ lưu từ bản trước chưa có cân nặng mục tiêu và ngày bắt đầu
    if (saved.startKg === undefined) p.startKg = p.weightKg
    if (saved.targetKg === undefined) p.targetKg = p.goal === 'lose' ? Math.round(p.weightKg - 4) : p.goal === 'health' ? p.weightKg : Math.round(p.weightKg + 3)
    if (!p.joinedAt && p.onboarded) p.joinedAt = isoDate(new Date())
    return p
  } catch {
    return DEFAULT_PROFILE
  }
}

export default function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(load)

  const update = (patch: Partial<Profile>) =>
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // trình duyệt chặn lưu trữ: vẫn dùng được trong phiên hiện tại
      }
      return next
    })

  return <ProfileContext.Provider value={{ profile, update }}>{children}</ProfileContext.Provider>
}
