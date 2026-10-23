import type { Muscle } from 'react-body-highlighter'

export interface Stretch {
  name: string
  sec: number
  muscles: Muscle[]
  how: string
  /** Làm từng bên: chia đôi thời gian, giữa chừng nhắc đổi bên */
  side?: boolean
}

export const STRETCHES: Record<'warmup' | 'cooldown', Stretch[]> = {
  warmup: [
    { name: 'Xoay khớp vai', sec: 30, muscles: ['front-deltoids', 'back-deltoids', 'trapezius'], how: 'Duỗi thẳng tay, xoay vòng lớn ra trước rồi ra sau.' },
    { name: 'Xoay hông', sec: 30, muscles: ['obliques', 'lower-back', 'gluteal'], how: 'Hai tay chống hông, xoay vòng tròn chậm theo cả hai chiều.' },
    { name: 'Đá chân trước sau', sec: 30, muscles: ['hamstring', 'quadriceps', 'gluteal'], how: 'Vịn tường, đá chân thả lỏng ra trước rồi ra sau.', side: true },
    { name: 'Nâng cao gối tại chỗ', sec: 45, muscles: ['quadriceps', 'calves', 'abs'], how: 'Chạy tại chỗ, nâng gối ngang hông, đánh tay theo nhịp.' },
  ],
  cooldown: [
    { name: 'Kéo giãn đùi trước', sec: 30, muscles: ['quadriceps'], how: 'Đứng một chân, kéo gót chân còn lại về sát mông, hai gối khép.', side: true },
    { name: 'Gập người giãn đùi sau', sec: 30, muscles: ['hamstring', 'calves', 'lower-back'], how: 'Duỗi thẳng chân, gập người từ hông, với tay về mũi chân.' },
    { name: 'Giãn mông chữ số 4', sec: 30, muscles: ['gluteal', 'abductors'], how: 'Nằm ngửa, gác cổ chân lên gối chân kia, kéo đùi về phía ngực.', side: true },
    { name: 'Giãn ngực ở khung cửa', sec: 30, muscles: ['chest', 'front-deltoids'], how: 'Đặt cẳng tay lên khung cửa, bước một chân lên trước đến khi căng ngực.' },
    { name: 'Tư thế em bé', sec: 45, muscles: ['upper-back', 'lower-back', 'triceps'], how: 'Quỳ, ngồi lên gót chân, duỗi tay ra trước, thả lỏng lưng và thở sâu.' },
  ],
}

/** Số phút của phần khởi động / giãn cơ, cộng 1 phút chuyển động tác */
export const stretchMinutes = (list: Stretch[]) => Math.ceil(list.reduce((s, x) => s + x.sec, 0) / 60) + 1
