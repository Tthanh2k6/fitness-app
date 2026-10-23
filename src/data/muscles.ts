export type Plate = 'red' | 'blue' | 'yellow' | 'green'
export type Group = 'legs' | 'upper' | 'core' | 'cardio'

/** Màu đĩa tạ thi đấu, đổi theo giao diện sáng/tối (xem src/index.css) */
export const PLATE: Record<Plate, string> = {
  red: 'var(--red)',
  blue: 'var(--blue)',
  yellow: 'var(--yellow)',
  green: 'var(--green)',
}
/** Nền nhạt và màu chữ đậm đi kèm mỗi màu đĩa */
export const PLATE_SOFT: Record<Plate, string> = {
  red: 'var(--red-soft)',
  blue: 'var(--blue-soft)',
  yellow: 'var(--yellow-soft)',
  green: 'var(--green-soft)',
}
export const PLATE_INK: Record<Plate, string> = {
  red: 'var(--red-ink)',
  blue: 'var(--blue-ink)',
  yellow: 'var(--yellow-ink)',
  green: 'var(--green-ink)',
}

// Bản đồ cơ (react-body-highlighter) cần mã màu thật. light = base trộn 38% với màu thân #DDDCD7, cho cơ phụ
export const PLATE_HEX: Record<Plate, { base: string; light: string }> = {
  red: { base: '#E4473A', light: '#E0A39C' },
  blue: { base: '#2C6BEF', light: '#9AB2E3' },
  yellow: { base: '#F1B11A', light: '#E5CB8F' },
  green: { base: '#11A068', light: '#8CC5AC' },
}

export const MUSCLE: Record<Group, { label: string; plate: Plate }> = {
  legs: { label: 'Chân & mông', plate: 'red' },
  upper: { label: 'Thân trên', plate: 'blue' },
  core: { label: 'Bụng', plate: 'yellow' },
  cardio: { label: 'Cardio', plate: 'green' },
}

/** Tên tiếng Việt của từng cơ (react-body-highlighter) */
export const MUSCLE_NAME: Record<string, string> = {
  quadriceps: 'Đùi trước',
  gluteal: 'Mông',
  hamstring: 'Đùi sau',
  calves: 'Bắp chân',
  'left-soleus': 'Bắp chân',
  'right-soleus': 'Bắp chân',
  adductor: 'Đùi trong',
  abductors: 'Hông ngoài',
  abs: 'Bụng',
  obliques: 'Eo',
  chest: 'Ngực',
  'front-deltoids': 'Vai trước',
  'back-deltoids': 'Vai sau',
  trapezius: 'Cầu vai',
  'upper-back': 'Lưng trên',
  'lower-back': 'Lưng dưới',
  biceps: 'Tay trước',
  triceps: 'Tay sau',
  forearm: 'Cẳng tay',
  neck: 'Cổ',
  head: 'Đầu',
  knees: 'Gối',
}
