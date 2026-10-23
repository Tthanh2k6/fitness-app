export const vnd = (n: number) => (Math.round(n / 1000) * 1000).toLocaleString('vi-VN') + 'đ'

/** Ngày theo giờ máy, dạng 2026-10-16 (dùng làm khoá lưu nhật ký) */
export function isoDate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Thứ trong tuần, thứ Hai = 0 … Chủ nhật = 6 */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7

export const WEEKDAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
export const WEEKDAY_LONG = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật']

export function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Thứ Hai của tuần chứa ngày d */
export const mondayOf = (d: Date) => addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -weekdayIndex(d))

export const longDate = (d: Date) => `${WEEKDAY_LONG[weekdayIndex(d)]}, ${d.getDate()} tháng ${d.getMonth() + 1}`
