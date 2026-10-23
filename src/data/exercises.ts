import type { Muscle } from 'react-body-highlighter'
import type { Group } from './muscles'

/** none: tay không / trên sàn, gym: máy tập ở phòng gym */
export type Gear = 'none' | 'dumbbell' | 'band' | 'bar' | 'gym'

export const GEAR_LABEL: Record<Gear, string> = {
  none: 'Không dụng cụ',
  dumbbell: 'Tạ đơn',
  band: 'Dây kháng lực',
  bar: 'Xà đơn',
  gym: 'Máy phòng gym',
}

/**
 * Kiểu chuyển động: lịch tập xếp bài theo kiểu (bài lớn trước, bài phụ sau)
 * và mỗi buổi không giao hai bài cùng kiểu, ví dụ Squat và Squat chân rộng
 */
export type Pattern =
  | 'squat' | 'hinge' | 'lunge' | 'glute' | 'calf' | 'leg-iso'
  | 'push' | 'chest-fly' | 'press' | 'shoulder' | 'row' | 'pulldown' | 'back' | 'biceps' | 'triceps'
  | 'core-hold' | 'core-move' | 'core-rotate'
  | 'jump' | 'run' | 'mixed' | 'machine'

export interface Ex {
  id: string
  name: string
  group: Group
  pattern: Pattern
  primary: Muscle[]
  secondary: Muscle[]
  gear: Gear
  /** 1 dễ · 2 vừa · 3 khó */
  difficulty: 1 | 2 | 3
  /** reps: đếm số lần, time: tính giây */
  mode: 'reps' | 'time'
  /** Bài chế từ đồ trong nhà (bàn, khung cửa), không giao khi tập ở phòng gym */
  homeOnly?: boolean
  /** Tập từng bên (lunge, plank nghiêng...) */
  perSide?: boolean
  /** Hệ số MET để ước tính calo */
  met: number
  ai?: boolean
  cues: string[]
  mistakes: string[]
}

export const DIFFICULTY_LABEL = { 1: 'Dễ', 2: 'Vừa', 3: 'Khó' } as const

export const LIBRARY: Ex[] = [
  // Chân & mông
  {
    id: 'squat', name: 'Squat', group: 'legs', pattern: 'squat', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'calves'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 5, ai: true,
    cues: ['Hai chân rộng bằng vai, mũi chân hơi mở ra ngoài', 'Đẩy hông ra sau như đang ngồi xuống ghế', 'Hạ đến khi đùi song song mặt sàn', 'Đạp gót chân để đứng lên'],
    mistakes: ['Gót chân nhấc khỏi sàn', 'Lưng cong về trước', 'Gối chụm vào trong'],
  },
  {
    id: 'lunge', name: 'Lunge', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'adductor'],
    gear: 'none', difficulty: 2, mode: 'reps', perSide: true, met: 4, ai: true,
    cues: ['Bước một chân lên trước một bước dài', 'Hạ người thẳng xuống, hai gối gập khoảng 90°', 'Giữ thân trên thẳng đứng', 'Đạp chân trước để về vị trí cũ, đổi chân'],
    mistakes: ['Gối trước vượt quá mũi chân', 'Thân trên đổ về trước', 'Bước quá ngắn'],
  },
  {
    id: 'glute-bridge', name: 'Glute bridge', group: 'legs', pattern: 'glute', primary: ['gluteal'], secondary: ['hamstring', 'lower-back'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Nằm ngửa, co gối, bàn chân đặt sát mông', 'Siết mông, đẩy hông lên cao', 'Giữ 1 giây ở đỉnh rồi hạ chậm'],
    mistakes: ['Ưỡn lưng thay vì siết mông', 'Bàn chân đặt quá xa'],
  },
  {
    id: 'wall-sit', name: 'Ngồi dựa tường', group: 'legs', pattern: 'squat', primary: ['quadriceps'], secondary: ['gluteal', 'calves'],
    gear: 'none', difficulty: 1, mode: 'time', met: 3.5,
    cues: ['Lưng áp sát tường, trượt người xuống', 'Đùi song song mặt sàn, gối ngay trên cổ chân', 'Thở đều, giữ nguyên tư thế'],
    mistakes: ['Ngồi quá cao', 'Tay chống lên đùi'],
  },
  {
    id: 'calf-raise', name: 'Nhón gót', group: 'legs', pattern: 'calf', primary: ['calves'], secondary: [],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Đứng thẳng, hai chân rộng bằng hông', 'Nhón gót lên cao nhất có thể', 'Hạ chậm xuống'],
    mistakes: ['Nhún nhảy quá nhanh', 'Đổ người về trước'],
  },
  {
    id: 'goblet-squat', name: 'Goblet squat', group: 'legs', pattern: 'squat', primary: ['quadriceps', 'gluteal'], secondary: ['abs', 'forearm'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 5,
    cues: ['Ôm một quả tạ trước ngực', 'Squat xuống, khuỷu tay đi vào giữa hai gối', 'Giữ ngực mở suốt động tác'],
    mistakes: ['Tạ kéo người đổ về trước', 'Gót chân nhấc lên'],
  },
  {
    id: 'db-rdl', name: 'Romanian deadlift tạ đơn', group: 'legs', pattern: 'hinge', primary: ['hamstring', 'gluteal'], secondary: ['lower-back'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 5,
    cues: ['Cầm hai tạ trước đùi, gối hơi chùng', 'Gập người từ hông, đẩy hông ra sau', 'Tạ trượt sát chân đến giữa ống quyển', 'Siết mông để đứng lên'],
    mistakes: ['Cong lưng khi cúi', 'Gập gối như squat'],
  },
  {
    id: 'band-side-walk', name: 'Bước ngang với dây', group: 'legs', pattern: 'glute', primary: ['abductors', 'gluteal'], secondary: ['quadriceps'],
    gear: 'band', difficulty: 1, mode: 'reps', perSide: true, met: 4,
    cues: ['Đeo dây ngang trên gối', 'Hơi khuỵu gối, bước ngang từng bước', 'Giữ dây luôn căng'],
    mistakes: ['Đứng thẳng gối', 'Hai chân chạm nhau làm chùng dây'],
  },
  {
    id: 'leg-press', name: 'Đạp đùi bằng máy', group: 'legs', pattern: 'squat', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 5,
    cues: ['Ngồi sát lưng ghế, bàn chân rộng bằng vai', 'Hạ bàn đạp đến khi gối gập 90°', 'Đạp lên nhưng không khoá gối'],
    mistakes: ['Hông nhấc khỏi ghế', 'Khoá thẳng gối ở trên'],
  },
  {
    id: 'leg-curl', name: 'Cuốn đùi sau bằng máy', group: 'legs', pattern: 'leg-iso', primary: ['hamstring'], secondary: ['calves'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 4,
    cues: ['Chỉnh đệm nằm ngay trên cổ chân', 'Cuốn gót về phía mông', 'Hạ chậm, không thả rơi'],
    mistakes: ['Nhấc hông khỏi đệm', 'Dùng đà quăng tạ'],
  },
  // Thân trên
  {
    id: 'incline-pushup', name: 'Hít đất tựa bàn', group: 'upper', pattern: 'push', primary: ['chest', 'triceps'], secondary: ['front-deltoids'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Chống tay lên mép bàn hoặc ghế chắc chắn', 'Người thẳng từ đầu đến gót', 'Hạ ngực sát mép bàn rồi đẩy lên'],
    mistakes: ['Võng hông', 'Khuỷu tay bẻ ngang 90°'],
  },
  {
    id: 'pushup', name: 'Hít đất', group: 'upper', pattern: 'push', primary: ['chest', 'triceps'], secondary: ['front-deltoids', 'abs'],
    gear: 'none', difficulty: 2, mode: 'reps', met: 3.8, ai: true,
    cues: ['Hai tay rộng hơn vai một chút', 'Người thẳng một đường từ vai đến gót', 'Hạ ngực gần chạm sàn, khuỷu tay khoảng 45°', 'Đẩy mạnh lên'],
    mistakes: ['Võng hông', 'Nhô hông lên cao', 'Chỉ hạ nửa chừng'],
  },
  {
    id: 'superman', name: 'Superman', group: 'upper', pattern: 'back', primary: ['lower-back', 'upper-back'], secondary: ['gluteal'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Nằm sấp, tay duỗi qua đầu', 'Nâng tay và chân lên cùng lúc', 'Giữ 2 giây rồi hạ xuống'],
    mistakes: ['Ngửa cổ ra sau', 'Giật mạnh'],
  },
  {
    id: 'bench-dip', name: 'Chống đẩy ghế', group: 'upper', pattern: 'triceps', primary: ['triceps'], secondary: ['chest', 'front-deltoids'],
    gear: 'none', difficulty: 2, mode: 'reps', met: 3.8,
    cues: ['Chống tay ra sau lên mép ghế', 'Hạ người đến khi khuỷu tay gập 90°', 'Đẩy lên bằng tay sau'],
    mistakes: ['Nhún vai lên tai', 'Hạ quá sâu gây đau vai'],
  },
  {
    id: 'db-row', name: 'Kéo tạ đơn', group: 'upper', pattern: 'row', primary: ['upper-back', 'trapezius'], secondary: ['biceps', 'back-deltoids'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', perSide: true, met: 4,
    cues: ['Một tay và gối chống lên ghế, lưng thẳng', 'Kéo tạ về phía hông', 'Hạ chậm, duỗi hết tay'],
    mistakes: ['Xoay người để kéo', 'Kéo tạ về phía ngực'],
  },
  {
    id: 'shoulder-press', name: 'Đẩy vai tạ đơn', group: 'upper', pattern: 'press', primary: ['front-deltoids'], secondary: ['triceps', 'trapezius'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 4,
    cues: ['Cầm tạ ngang vai, lòng bàn tay hướng ra trước', 'Đẩy tạ thẳng lên trên đầu', 'Hạ chậm về ngang vai'],
    mistakes: ['Ưỡn lưng khi đẩy', 'Khoá cứng khuỷu tay'],
  },
  {
    id: 'db-curl', name: 'Cuốn tạ tay trước', group: 'upper', pattern: 'biceps', primary: ['biceps'], secondary: ['forearm'],
    gear: 'dumbbell', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Khuỷu tay khép sát thân', 'Cuốn tạ lên ngang vai', 'Hạ chậm, duỗi hết tay'],
    mistakes: ['Đung đưa thân người', 'Khuỷu tay đưa ra trước'],
  },
  {
    id: 'band-row', name: 'Kéo dây kháng lực', group: 'upper', pattern: 'row', primary: ['upper-back'], secondary: ['biceps', 'back-deltoids'],
    gear: 'band', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Ngồi duỗi chân, vòng dây qua bàn chân', 'Kéo dây về bụng, ép hai bả vai lại', 'Thả chậm về'],
    mistakes: ['Ngả người ra sau để kéo', 'Nhún vai'],
  },
  {
    id: 'pull-up', name: 'Kéo xà', group: 'upper', pattern: 'pulldown', primary: ['upper-back', 'biceps'], secondary: ['forearm', 'back-deltoids'],
    gear: 'bar', difficulty: 3, mode: 'reps', met: 8,
    cues: ['Nắm xà rộng hơn vai', 'Kéo người lên đến khi cằm qua xà', 'Hạ chậm đến khi duỗi thẳng tay'],
    mistakes: ['Đu người lấy đà', 'Chỉ kéo nửa chừng'],
  },
  {
    id: 'dead-hang', name: 'Treo xà', group: 'upper', pattern: 'pulldown', primary: ['forearm'], secondary: ['upper-back', 'back-deltoids'],
    gear: 'bar', difficulty: 1, mode: 'time', met: 3,
    cues: ['Nắm xà bằng vai, thả lỏng người', 'Kéo nhẹ bả vai xuống, không nhún vai', 'Thở đều'],
    mistakes: ['Đung đưa người', 'Nín thở'],
  },
  {
    id: 'lat-pulldown', name: 'Kéo xô bằng máy', group: 'upper', pattern: 'pulldown', primary: ['upper-back'], secondary: ['biceps', 'back-deltoids'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 4.5,
    cues: ['Nắm thanh rộng hơn vai', 'Kéo thanh xuống ngang cằm, ưỡn nhẹ ngực', 'Thả lên chậm'],
    mistakes: ['Kéo thanh ra sau gáy', 'Ngả người quá nhiều'],
  },
  {
    id: 'chest-press', name: 'Đẩy ngực bằng máy', group: 'upper', pattern: 'push', primary: ['chest'], secondary: ['triceps', 'front-deltoids'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 4.5,
    cues: ['Chỉnh ghế để tay cầm ngang ngực', 'Đẩy thẳng ra trước', 'Thu về chậm'],
    mistakes: ['Nhấc lưng khỏi ghế', 'Khoá cứng khuỷu tay'],
  },
  // Bụng
  {
    id: 'plank', name: 'Plank', group: 'core', pattern: 'core-hold', primary: ['abs'], secondary: ['obliques', 'front-deltoids'],
    gear: 'none', difficulty: 1, mode: 'time', met: 3, ai: true,
    cues: ['Chống khuỷu tay ngay dưới vai', 'Người thẳng một đường từ vai đến gót', 'Siết bụng và mông, thở đều'],
    mistakes: ['Võng hông', 'Nhô hông lên cao', 'Nín thở'],
  },
  {
    id: 'crunch', name: 'Gập bụng', group: 'core', pattern: 'core-move', primary: ['abs'], secondary: ['obliques'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Nằm ngửa, co gối, tay đặt nhẹ sau tai', 'Cuộn vai lên khỏi sàn bằng cơ bụng', 'Hạ chậm xuống'],
    mistakes: ['Kéo cổ bằng tay', 'Bật cả lưng dậy'],
  },
  {
    id: 'russian-twist', name: 'Russian twist', group: 'core', pattern: 'core-rotate', primary: ['obliques'], secondary: ['abs'],
    gear: 'none', difficulty: 2, mode: 'reps', met: 3.5,
    cues: ['Ngồi ngả lưng 45°, nhấc nhẹ chân', 'Xoay người chạm tay xuống sàn hai bên', 'Giữ lưng thẳng'],
    mistakes: ['Chỉ xoay tay, không xoay vai', 'Cong lưng'],
  },
  {
    id: 'leg-raise', name: 'Nâng chân', group: 'core', pattern: 'core-move', primary: ['abs'], secondary: ['obliques', 'quadriceps'],
    gear: 'none', difficulty: 2, mode: 'reps', met: 3.5,
    cues: ['Nằm ngửa, tay đặt dưới hông', 'Nâng hai chân thẳng lên 90°', 'Hạ chậm, không chạm sàn'],
    mistakes: ['Lưng dưới ưỡn khỏi sàn', 'Thả chân rơi nhanh'],
  },
  {
    id: 'side-plank', name: 'Plank nghiêng', group: 'core', pattern: 'core-hold', primary: ['obliques'], secondary: ['abs', 'abductors'],
    gear: 'none', difficulty: 2, mode: 'time', perSide: true, met: 3,
    cues: ['Chống một khuỷu tay ngay dưới vai', 'Nâng hông lên thành một đường thẳng', 'Giữ rồi đổi bên'],
    mistakes: ['Hông chùng xuống', 'Vai nhún lên tai'],
  },
  // Cardio
  {
    id: 'jumping-jack', name: 'Jumping jack', group: 'cardio', pattern: 'jump', primary: ['calves', 'quadriceps'], secondary: ['front-deltoids'],
    gear: 'none', difficulty: 1, mode: 'time', met: 8,
    cues: ['Bật nhảy dang chân, đưa tay lên đầu', 'Bật về khép chân, hạ tay', 'Tiếp đất nhẹ bằng mũi chân'],
    mistakes: ['Tiếp đất bằng gót', 'Gồng cứng gối'],
  },
  {
    id: 'high-knees', name: 'Nâng cao gối', group: 'cardio', pattern: 'run', primary: ['quadriceps', 'abs'], secondary: ['calves'],
    gear: 'none', difficulty: 1, mode: 'time', met: 8,
    cues: ['Chạy tại chỗ', 'Nâng gối ngang hông', 'Đánh tay theo nhịp'],
    mistakes: ['Ngả người ra sau', 'Gối nâng quá thấp'],
  },
  {
    id: 'mountain-climber', name: 'Mountain climber', group: 'cardio', pattern: 'mixed', primary: ['abs', 'quadriceps'], secondary: ['front-deltoids', 'chest'],
    gear: 'none', difficulty: 2, mode: 'time', met: 8,
    cues: ['Tư thế chống đẩy, tay dưới vai', 'Kéo luân phiên từng gối về ngực', 'Giữ hông thấp, đều nhịp'],
    mistakes: ['Nhô hông cao', 'Vai lệch khỏi tay'],
  },
  {
    id: 'burpee', name: 'Burpee', group: 'cardio', pattern: 'jump', primary: ['quadriceps', 'chest'], secondary: ['abs', 'front-deltoids'],
    gear: 'none', difficulty: 3, mode: 'reps', met: 8,
    cues: ['Ngồi xuống, chống tay', 'Bật hai chân ra sau thành tư thế chống đẩy', 'Thu chân về và bật nhảy lên'],
    mistakes: ['Võng lưng khi bật chân ra sau', 'Tiếp đất nặng'],
  },
  {
    id: 'treadmill', name: 'Chạy bộ trên máy', group: 'cardio', pattern: 'machine', primary: ['quadriceps', 'calves'], secondary: ['hamstring', 'gluteal'],
    gear: 'gym', difficulty: 1, mode: 'time', met: 8,
    cues: ['Khởi động đi bộ nhanh 1 phút', 'Chạy ở tốc độ vẫn nói chuyện được', 'Giảm tốc từ từ trước khi dừng'],
    mistakes: ['Vịn tay vào máy', 'Bước quá dài'],
  },
  {
    id: 'bike', name: 'Đạp xe tập', group: 'cardio', pattern: 'machine', primary: ['quadriceps', 'calves'], secondary: ['hamstring'],
    gear: 'gym', difficulty: 1, mode: 'time', met: 7,
    cues: ['Chỉnh yên ngang hông', 'Đạp đều nhịp, lưng thẳng', 'Tăng lực cản dần'],
    mistakes: ['Yên quá thấp làm đau gối', 'Gồng vai'],
  },
  // Bổ sung: chân & mông
  {
    id: 'sumo-squat', name: 'Squat chân rộng', group: 'legs', pattern: 'squat', primary: ['adductor', 'gluteal'], secondary: ['quadriceps'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 5,
    cues: ['Hai chân rộng gấp rưỡi vai, mũi chân mở 45°', 'Hạ người thẳng xuống, gối mở theo mũi chân', 'Siết mông khi đứng lên'],
    mistakes: ['Gối đổ vào trong', 'Đổ người về trước'],
  },
  {
    id: 'step-up', name: 'Bước lên ghế', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'gluteal'], secondary: ['calves'],
    gear: 'none', difficulty: 1, mode: 'reps', perSide: true, met: 4.5,
    cues: ['Đặt cả bàn chân lên ghế hoặc bậc thang chắc chắn', 'Đạp gót chân trên ghế để đứng lên', 'Bước xuống chậm, đổi chân'],
    mistakes: ['Nhún chân dưới lấy đà', 'Gối trên đổ vào trong'],
  },
  {
    id: 'single-leg-bridge', name: 'Glute bridge một chân', group: 'legs', pattern: 'glute', primary: ['gluteal'], secondary: ['hamstring'],
    gear: 'none', difficulty: 2, mode: 'reps', perSide: true, met: 3.5,
    cues: ['Nằm ngửa, một chân co, một chân duỗi thẳng', 'Đẩy hông lên bằng gót chân đang chống', 'Giữ hông thăng bằng, không lệch'],
    mistakes: ['Hông bị xệ một bên', 'Ưỡn lưng'],
  },
  {
    id: 'bulgarian-split-squat', name: 'Bulgarian split squat', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'adductor'],
    gear: 'none', difficulty: 3, mode: 'reps', perSide: true, met: 5,
    cues: ['Gác mu bàn chân sau lên ghế', 'Hạ người thẳng xuống đến khi đùi trước song song sàn', 'Đạp chân trước để lên'],
    mistakes: ['Chân trước đặt quá gần ghế', 'Thân trên đổ nhiều'],
  },
  {
    id: 'jump-squat', name: 'Squat bật nhảy', group: 'legs', pattern: 'squat', primary: ['quadriceps', 'gluteal'], secondary: ['calves'],
    gear: 'none', difficulty: 3, mode: 'reps', met: 8,
    cues: ['Squat xuống như bình thường', 'Bật nhảy thẳng lên, vung tay', 'Tiếp đất nhẹ rồi vào luôn lần tiếp theo'],
    mistakes: ['Tiếp đất thẳng gối', 'Gối chụm khi tiếp đất'],
  },
  {
    id: 'db-lunge', name: 'Lunge tạ đơn', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'forearm'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', perSide: true, met: 5,
    cues: ['Cầm hai tạ thả dọc thân', 'Bước dài lên trước, hạ người thẳng xuống', 'Đạp chân trước về vị trí cũ'],
    mistakes: ['Tạ kéo vai đổ về trước', 'Gối sau đập xuống sàn'],
  },
  {
    id: 'leg-extension', name: 'Đá đùi trước bằng máy', group: 'legs', pattern: 'leg-iso', primary: ['quadriceps'], secondary: [],
    gear: 'gym', difficulty: 1, mode: 'reps', met: 4,
    cues: ['Chỉnh đệm nằm ngay trên cổ chân', 'Duỗi thẳng chân, siết đùi trước 1 giây', 'Hạ chậm'],
    mistakes: ['Quăng tạ bằng đà', 'Nhấc mông khỏi ghế'],
  },
  {
    id: 'hip-thrust', name: 'Hip thrust', group: 'legs', pattern: 'glute', primary: ['gluteal'], secondary: ['hamstring', 'quadriceps'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 5,
    cues: ['Tựa lưng trên lên ghế, thanh tạ đặt trên hông', 'Đẩy hông lên đến khi thân song song sàn', 'Siết mông ở đỉnh rồi hạ chậm'],
    mistakes: ['Ưỡn lưng thay vì đẩy hông', 'Cằm ngửa lên trời'],
  },
  // Bổ sung: thân trên
  {
    id: 'wide-pushup', name: 'Hít đất tay rộng', group: 'upper', pattern: 'push', primary: ['chest'], secondary: ['front-deltoids', 'triceps'],
    gear: 'none', difficulty: 2, mode: 'reps', met: 3.8,
    cues: ['Hai tay rộng gấp rưỡi vai', 'Người thẳng một đường', 'Hạ ngực gần sàn rồi đẩy lên'],
    mistakes: ['Võng hông', 'Khuỷu tay bẻ ngang quá mức'],
  },
  {
    id: 'diamond-pushup', name: 'Hít đất kim cương', group: 'upper', pattern: 'push', primary: ['triceps', 'chest'], secondary: ['front-deltoids'],
    gear: 'none', difficulty: 3, mode: 'reps', met: 3.8,
    cues: ['Hai bàn tay chụm thành hình kim cương dưới ngực', 'Khuỷu tay khép sát thân khi hạ', 'Đẩy lên bằng tay sau'],
    mistakes: ['Khuỷu tay bung ra ngoài', 'Võng hông'],
  },
  {
    id: 'pike-pushup', name: 'Hít đất chữ V', group: 'upper', pattern: 'press', primary: ['front-deltoids'], secondary: ['triceps', 'trapezius'],
    gear: 'none', difficulty: 3, mode: 'reps', met: 3.8,
    cues: ['Chổng hông lên cao thành chữ V ngược', 'Hạ đầu xuống giữa hai bàn tay', 'Đẩy lên bằng vai'],
    mistakes: ['Hông hạ thấp thành hít đất thường', 'Đầu đập xuống sàn'],
  },
  {
    id: 'db-bench-press', name: 'Đẩy ngực tạ đơn', group: 'upper', pattern: 'push', primary: ['chest'], secondary: ['triceps', 'front-deltoids'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 4,
    cues: ['Nằm trên ghế hoặc sàn, tạ ngang ngực', 'Đẩy tạ thẳng lên, hai tạ gần nhau', 'Hạ chậm về ngang ngực'],
    mistakes: ['Nhấc mông khỏi ghế', 'Thả tạ rơi nhanh'],
  },
  {
    id: 'lateral-raise', name: 'Dang tay tạ đơn', group: 'upper', pattern: 'shoulder', primary: ['front-deltoids'], secondary: ['trapezius'],
    gear: 'dumbbell', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Đứng thẳng, tạ thả hai bên đùi', 'Dang tay sang ngang đến ngang vai', 'Hạ chậm'],
    mistakes: ['Nhún vai lên tai', 'Đung đưa người lấy đà'],
  },
  {
    id: 'hammer-curl', name: 'Cuốn tạ búa', group: 'upper', pattern: 'biceps', primary: ['biceps', 'forearm'], secondary: [],
    gear: 'dumbbell', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Cầm tạ dọc, lòng bàn tay hướng vào thân', 'Cuốn tạ lên ngang vai', 'Hạ chậm'],
    mistakes: ['Khuỷu tay rời khỏi thân', 'Đung đưa người'],
  },
  {
    id: 'overhead-triceps', name: 'Duỗi tay sau qua đầu', group: 'upper', pattern: 'triceps', primary: ['triceps'], secondary: [],
    gear: 'dumbbell', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Hai tay cầm một tạ đưa lên đầu', 'Gập khuỷu hạ tạ ra sau gáy', 'Duỗi thẳng tay lên'],
    mistakes: ['Khuỷu tay bung rộng', 'Ưỡn lưng'],
  },
  {
    id: 'band-pull-apart', name: 'Kéo dãn dây ngang ngực', group: 'upper', pattern: 'shoulder', primary: ['back-deltoids', 'upper-back'], secondary: ['trapezius'],
    gear: 'band', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Cầm dây trước ngực, tay duỗi thẳng', 'Kéo dãn dây sang hai bên đến khi chạm ngực', 'Thu về chậm'],
    mistakes: ['Nhún vai', 'Gập khuỷu tay'],
  },
  {
    id: 'chin-up', name: 'Kéo xà tay ngửa', group: 'upper', pattern: 'pulldown', primary: ['biceps', 'upper-back'], secondary: ['forearm'],
    gear: 'bar', difficulty: 3, mode: 'reps', met: 8,
    cues: ['Nắm xà lòng bàn tay hướng vào mặt, rộng bằng vai', 'Kéo người đến khi cằm qua xà', 'Hạ chậm hết tay'],
    mistakes: ['Đu người lấy đà', 'Kéo nửa chừng'],
  },
  {
    id: 'cable-row', name: 'Kéo cáp ngồi', group: 'upper', pattern: 'row', primary: ['upper-back'], secondary: ['biceps', 'back-deltoids'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 4.5,
    cues: ['Ngồi thẳng lưng, chân chống lên bàn đạp', 'Kéo tay cầm về bụng, ép bả vai', 'Duỗi tay về chậm'],
    mistakes: ['Ngả người ra sau để kéo', 'Cong lưng khi duỗi tay'],
  },
  {
    id: 'shoulder-press-machine', name: 'Đẩy vai bằng máy', group: 'upper', pattern: 'press', primary: ['front-deltoids'], secondary: ['triceps'],
    gear: 'gym', difficulty: 1, mode: 'reps', met: 4,
    cues: ['Chỉnh ghế để tay cầm ngang vai', 'Đẩy thẳng lên', 'Hạ chậm về ngang vai'],
    mistakes: ['Ưỡn lưng khỏi ghế', 'Khoá cứng khuỷu tay'],
  },
  {
    id: 'triceps-pushdown', name: 'Ép tay sau bằng cáp', group: 'upper', pattern: 'triceps', primary: ['triceps'], secondary: [],
    gear: 'gym', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Khuỷu tay khép sát thân', 'Đẩy tay cầm xuống đến khi duỗi thẳng tay', 'Thả lên chậm'],
    mistakes: ['Khuỷu tay di chuyển theo', 'Gập người đè tạ'],
  },
  // Bổ sung: bụng
  {
    id: 'bicycle-crunch', name: 'Gập bụng đạp xe', group: 'core', pattern: 'core-rotate', primary: ['obliques', 'abs'], secondary: [],
    gear: 'none', difficulty: 2, mode: 'reps', met: 3.8,
    cues: ['Nằm ngửa, tay sau đầu, nhấc vai khỏi sàn', 'Đưa khuỷu tay chạm gối đối diện, luân phiên', 'Chân duỗi co như đạp xe'],
    mistakes: ['Kéo cổ bằng tay', 'Làm quá nhanh'],
  },
  {
    id: 'dead-bug', name: 'Dead bug', group: 'core', pattern: 'core-hold', primary: ['abs'], secondary: ['obliques'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Nằm ngửa, tay giơ thẳng, gối co 90°', 'Duỗi tay và chân đối diện xuống gần sàn', 'Lưng dưới luôn áp sát sàn'],
    mistakes: ['Lưng dưới ưỡn khỏi sàn', 'Nín thở'],
  },
  {
    id: 'bird-dog', name: 'Bird dog', group: 'core', pattern: 'core-hold', primary: ['lower-back', 'abs'], secondary: ['gluteal'],
    gear: 'none', difficulty: 1, mode: 'reps', perSide: true, met: 3,
    cues: ['Quỳ bốn điểm, lưng phẳng', 'Duỗi thẳng tay và chân đối diện', 'Giữ 2 giây rồi đổi bên'],
    mistakes: ['Hông xoay lệch', 'Ưỡn lưng'],
  },
  {
    id: 'flutter-kicks', name: 'Đá chân luân phiên', group: 'core', pattern: 'core-move', primary: ['abs'], secondary: ['quadriceps'],
    gear: 'none', difficulty: 2, mode: 'time', met: 3.8,
    cues: ['Nằm ngửa, tay dưới hông', 'Nhấc hai chân cách sàn một gang tay', 'Đá lên xuống luân phiên nhỏ và nhanh'],
    mistakes: ['Lưng dưới ưỡn lên', 'Chân chạm sàn'],
  },
  {
    id: 'hanging-knee-raise', name: 'Treo xà co gối', group: 'core', pattern: 'core-move', primary: ['abs'], secondary: ['obliques', 'forearm'],
    gear: 'bar', difficulty: 2, mode: 'reps', met: 4,
    cues: ['Treo người trên xà', 'Co gối lên ngực bằng cơ bụng', 'Hạ chậm, không đung đưa'],
    mistakes: ['Đung đưa lấy đà', 'Chỉ nhấc chân bằng đùi'],
  },
  // Bổ sung: cardio
  {
    id: 'butt-kicks', name: 'Chạy đá gót', group: 'cardio', pattern: 'run', primary: ['hamstring', 'calves'], secondary: ['quadriceps'],
    gear: 'none', difficulty: 1, mode: 'time', met: 8,
    cues: ['Chạy tại chỗ', 'Đá gót chân chạm mông', 'Giữ thân thẳng, đánh tay theo nhịp'],
    mistakes: ['Ngả người về trước', 'Tiếp đất bằng gót'],
  },
  {
    id: 'skater-jump', name: 'Bật nhảy trượt băng', group: 'cardio', pattern: 'jump', primary: ['gluteal', 'quadriceps'], secondary: ['calves', 'abductors'],
    gear: 'none', difficulty: 2, mode: 'time', met: 8,
    cues: ['Bật sang ngang bằng một chân', 'Chân kia vắt chéo ra sau', 'Đổi bên liên tục'],
    mistakes: ['Tiếp đất thẳng gối', 'Gối đổ vào trong'],
  },
  {
    id: 'jump-rope', name: 'Nhảy dây', group: 'cardio', pattern: 'jump', primary: ['calves'], secondary: ['quadriceps', 'forearm'],
    gear: 'none', difficulty: 1, mode: 'time', met: 10,
    cues: ['Nhảy thấp bằng mũi chân', 'Quay dây bằng cổ tay, khuỷu tay sát thân', 'Không có dây thì nhảy giả động tác'],
    mistakes: ['Nhảy quá cao', 'Quay dây bằng cả cánh tay'],
  },
  {
    id: 'rowing-machine', name: 'Máy chèo thuyền', group: 'cardio', pattern: 'machine', primary: ['upper-back', 'quadriceps'], secondary: ['biceps', 'hamstring'],
    gear: 'gym', difficulty: 1, mode: 'time', met: 7,
    cues: ['Đạp chân trước, rồi ngả người, rồi kéo tay', 'Về theo thứ tự ngược lại', 'Giữ lưng thẳng'],
    mistakes: ['Kéo tay trước khi đạp chân', 'Cong lưng'],
  },
  {
    id: 'elliptical', name: 'Máy chạy elip', group: 'cardio', pattern: 'machine', primary: ['quadriceps', 'gluteal'], secondary: ['calves'],
    gear: 'gym', difficulty: 1, mode: 'time', met: 5,
    cues: ['Đứng thẳng, cầm tay nắm', 'Đạp đều theo nhịp', 'Tăng lực cản dần'],
    mistakes: ['Dồn trọng lượng lên tay', 'Nhón gót'],
  },

  // Chân & mông (bổ sung)
  {
    id: 'box-squat', name: 'Squat ngồi ghế', group: 'legs', pattern: 'squat', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 4,
    cues: ['Đứng trước ghế, hai chân rộng bằng vai', 'Đẩy hông ra sau, ngồi chạm nhẹ mép ghế', 'Không thả người, đạp gót đứng lên ngay'],
    mistakes: ['Ngồi phịch xuống ghế', 'Đổ người về trước khi đứng lên'],
  },
  {
    id: 'db-sumo-squat', name: 'Sumo squat tạ đơn', group: 'legs', pattern: 'squat', primary: ['adductor', 'gluteal'], secondary: ['quadriceps'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 5,
    cues: ['Chân rộng hơn vai, mũi chân mở 45°', 'Hai tay cầm một đầu tạ thả giữa hai chân', 'Hạ thẳng người xuống, gối mở theo hướng mũi chân', 'Siết mông đứng lên'],
    mistakes: ['Gối chụm vào trong', 'Cúi gập lưng'],
  },
  {
    id: 'assisted-pistol', name: 'Squat một chân bám ghế', group: 'legs', pattern: 'squat', primary: ['quadriceps', 'gluteal'], secondary: ['abs', 'calves'],
    gear: 'none', difficulty: 3, mode: 'reps', perSide: true, met: 5,
    cues: ['Một tay bám lưng ghế, đứng một chân', 'Chân kia duỗi ra trước', 'Hạ người chậm hết mức kiểm soát được', 'Đạp gót đứng lên'],
    mistakes: ['Gối đổ vào trong', 'Kéo tay thay vì đạp chân'],
  },
  {
    id: 'barbell-squat', name: 'Squat tạ đòn', group: 'legs', pattern: 'squat', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'lower-back', 'abs'],
    gear: 'gym', difficulty: 3, mode: 'reps', met: 6,
    cues: ['Đặt đòn trên cơ thang, siết bụng', 'Đẩy hông ra sau và khuỵu gối cùng lúc', 'Hạ đến khi đùi song song sàn', 'Đạp cả bàn chân để đứng lên'],
    mistakes: ['Cong lưng dưới ở đáy', 'Gót chân nhấc lên', 'Gối chụm vào trong'],
  },
  {
    id: 'single-leg-rdl', name: 'Deadlift một chân', group: 'legs', pattern: 'hinge', primary: ['hamstring', 'gluteal'], secondary: ['lower-back', 'abs'],
    gear: 'none', difficulty: 2, mode: 'reps', perSide: true, met: 4,
    cues: ['Đứng một chân, gối hơi chùng', 'Gập người về trước, chân kia duỗi thẳng ra sau', 'Thân và chân sau tạo thành đường thẳng', 'Siết mông để về tư thế đứng'],
    mistakes: ['Xoay hông mở ra ngoài', 'Cong lưng'],
  },
  {
    id: 'good-morning', name: 'Good morning tay không', group: 'legs', pattern: 'hinge', primary: ['hamstring'], secondary: ['gluteal', 'lower-back'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Hai tay đặt sau đầu, chân rộng bằng hông', 'Đẩy hông ra sau, gập người đến khi thân gần song song sàn', 'Lưng luôn thẳng, siết mông đứng lên'],
    mistakes: ['Cong lưng', 'Khuỵu gối quá nhiều'],
  },
  {
    id: 'barbell-deadlift', name: 'Deadlift tạ đòn', group: 'legs', pattern: 'hinge', primary: ['hamstring', 'gluteal', 'lower-back'], secondary: ['quadriceps', 'trapezius', 'forearm'],
    gear: 'gym', difficulty: 3, mode: 'reps', met: 6,
    cues: ['Đòn sát ống quyển, chân rộng bằng hông', 'Cầm đòn, ép vai xuống, lưng thẳng', 'Đạp sàn và đẩy hông ra trước để đứng lên', 'Hạ đòn sát chân theo đường cũ'],
    mistakes: ['Cong lưng khi kéo', 'Đòn đi xa người', 'Ngửa người quá đà ở trên'],
  },
  {
    id: 'reverse-lunge', name: 'Lunge lùi', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring'],
    gear: 'none', difficulty: 1, mode: 'reps', perSide: true, met: 4,
    cues: ['Bước một chân lùi ra sau', 'Hạ gối sau gần chạm sàn', 'Đạp gót chân trước để về vị trí cũ'],
    mistakes: ['Gối trước đổ vào trong', 'Thân trên đổ về trước'],
  },
  {
    id: 'split-squat', name: 'Split squat tại chỗ', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'calves'],
    gear: 'none', difficulty: 1, mode: 'reps', perSide: true, met: 4,
    cues: ['Đứng tách chân trước sau, giữ nguyên vị trí bàn chân', 'Hạ thẳng người xuống', 'Đẩy lên bằng chân trước'],
    mistakes: ['Hai chân trên cùng một đường thẳng nên mất thăng bằng', 'Nhấc gót chân trước'],
  },
  {
    id: 'side-lunge', name: 'Lunge ngang', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'adductor'], secondary: ['gluteal'],
    gear: 'none', difficulty: 2, mode: 'reps', perSide: true, met: 4,
    cues: ['Bước một chân sang ngang thật rộng', 'Ngồi xuống bên chân bước, chân kia duỗi thẳng', 'Đạp chân để về giữa'],
    mistakes: ['Gối vượt quá mũi chân', 'Nhấc gót chân đang khuỵu'],
  },
  {
    id: 'cossack-squat', name: 'Cossack squat', group: 'legs', pattern: 'lunge', primary: ['adductor', 'quadriceps'], secondary: ['gluteal', 'hamstring'],
    gear: 'none', difficulty: 3, mode: 'reps', perSide: true, met: 4.5,
    cues: ['Đứng chân thật rộng', 'Ngồi sâu xuống một bên, chân kia duỗi thẳng, mũi chân hướng lên', 'Chuyển sang bên kia mà không đứng hẳn lên'],
    mistakes: ['Nhấc gót chân đang ngồi', 'Cong lưng'],
  },
  {
    id: 'db-step-up', name: 'Bước lên ghế tạ đơn', group: 'legs', pattern: 'lunge', primary: ['quadriceps', 'gluteal'], secondary: ['hamstring', 'calves'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', perSide: true, met: 5,
    cues: ['Cầm tạ hai bên, đặt cả bàn chân lên ghế', 'Đạp chân trên để đứng lên', 'Hạ chậm chân sau xuống sàn'],
    mistakes: ['Đạp chân dưới để bật lên', 'Ghế quá cao'],
  },
  {
    id: 'donkey-kick', name: 'Đá chân sau', group: 'legs', pattern: 'glute', primary: ['gluteal'], secondary: ['hamstring'],
    gear: 'none', difficulty: 1, mode: 'reps', perSide: true, met: 3,
    cues: ['Quỳ bốn điểm, tay dưới vai, gối dưới hông', 'Giữ gối gập 90°, đạp gót lên trần', 'Siết mông ở trên rồi hạ chậm'],
    mistakes: ['Ưỡn lưng khi đá', 'Xoay hông'],
  },
  {
    id: 'fire-hydrant', name: 'Mở hông bốn điểm', group: 'legs', pattern: 'glute', primary: ['abductors', 'gluteal'], secondary: [],
    gear: 'none', difficulty: 1, mode: 'reps', perSide: true, met: 3,
    cues: ['Quỳ bốn điểm, lưng phẳng', 'Giữ gối gập, mở chân sang ngang đến ngang hông', 'Hạ chậm về giữa'],
    mistakes: ['Nghiêng cả thân người', 'Mở chân quá nhanh'],
  },
  {
    id: 'clamshell', name: 'Clamshell với dây', group: 'legs', pattern: 'glute', primary: ['abductors', 'gluteal'], secondary: [],
    gear: 'band', difficulty: 1, mode: 'reps', perSide: true, met: 3,
    cues: ['Nằm nghiêng, đeo dây trên gối, hai gối co', 'Giữ hai bàn chân chạm nhau, mở gối trên lên', 'Hạ chậm, giữ dây căng'],
    mistakes: ['Lăn hông ra sau', 'Tách hai bàn chân'],
  },
  {
    id: 'hip-abduction-machine', name: 'Máy mở hông', group: 'legs', pattern: 'glute', primary: ['abductors'], secondary: ['gluteal'],
    gear: 'gym', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Ngồi sát lưng ghế, đệm đặt ngoài gối', 'Mở hai chân ra hết tầm', 'Khép lại chậm'],
    mistakes: ['Dùng đà bật chân', 'Ngả người về trước'],
  },
  {
    id: 'db-calf-raise', name: 'Nhón gót một chân tạ đơn', group: 'legs', pattern: 'calf', primary: ['calves'], secondary: [],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', perSide: true, met: 3.5,
    cues: ['Cầm tạ một tay, tay kia vịn tường', 'Đứng một chân trên bậc, gót thả thấp', 'Nhón lên cao nhất rồi hạ chậm'],
    mistakes: ['Nhún quá nhanh', 'Chùng gối'],
  },

  // Thân trên (bổ sung)
  {
    id: 'knee-pushup', name: 'Hít đất chống gối', group: 'upper', pattern: 'push', primary: ['chest', 'triceps'], secondary: ['front-deltoids'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Chống gối và hai tay rộng hơn vai', 'Người thẳng từ đầu đến gối', 'Hạ ngực gần chạm sàn rồi đẩy lên'],
    mistakes: ['Chổng mông', 'Đầu cúi trước ngực'],
  },
  {
    id: 'decline-pushup', name: 'Hít đất chân cao', group: 'upper', pattern: 'push', primary: ['chest', 'front-deltoids'], secondary: ['triceps', 'abs'],
    gear: 'none', difficulty: 3, mode: 'reps', met: 4,
    cues: ['Gác hai mũi chân lên ghế', 'Hai tay rộng hơn vai, người thẳng', 'Hạ ngực xuống sàn rồi đẩy lên'],
    mistakes: ['Võng hông', 'Khuỷu tay bẻ ngang'],
  },
  {
    id: 'band-chest-press', name: 'Đẩy ngực với dây', group: 'upper', pattern: 'push', primary: ['chest'], secondary: ['triceps', 'front-deltoids'],
    gear: 'band', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Vòng dây ra sau lưng, hai tay cầm hai đầu ngang ngực', 'Đẩy thẳng tay ra trước', 'Thu về chậm'],
    mistakes: ['Nhún vai', 'Thả dây giật về'],
  },
  {
    id: 'incline-db-press', name: 'Đẩy ngực dốc tạ đơn', group: 'upper', pattern: 'push', primary: ['chest', 'front-deltoids'], secondary: ['triceps'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 4,
    cues: ['Ghế dốc khoảng 30°, tạ ngang ngực trên', 'Đẩy tạ lên, hai tạ tiến lại gần nhau', 'Hạ chậm đến ngang ngực'],
    mistakes: ['Ghế dốc quá cao thành bài vai', 'Đập hai tạ vào nhau'],
  },
  {
    id: 'db-fly', name: 'Ép ngực tạ đơn', group: 'upper', pattern: 'chest-fly', primary: ['chest'], secondary: ['front-deltoids'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 3.5,
    cues: ['Nằm ngửa, tạ trên ngực, khuỷu tay hơi cong', 'Mở hai tay sang ngang như ôm cây lớn', 'Khép tạ về trên ngực, siết ngực'],
    mistakes: ['Duỗi thẳng tay', 'Hạ tạ quá thấp gây đau vai'],
  },
  {
    id: 'pec-deck', name: 'Ép ngực bằng máy', group: 'upper', pattern: 'chest-fly', primary: ['chest'], secondary: ['front-deltoids'],
    gear: 'gym', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Chỉnh ghế để tay cầm ngang ngực', 'Khép hai tay lại phía trước', 'Mở ra chậm, cảm nhận ngực căng'],
    mistakes: ['Nhún vai', 'Mở tay quá rộng'],
  },
  {
    id: 'arnold-press', name: 'Arnold press', group: 'upper', pattern: 'press', primary: ['front-deltoids'], secondary: ['triceps', 'back-deltoids'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 4,
    cues: ['Tạ trước mặt, lòng bàn tay hướng vào người', 'Vừa đẩy lên vừa xoay lòng bàn tay ra trước', 'Hạ xuống và xoay ngược lại'],
    mistakes: ['Ưỡn lưng', 'Xoay quá nhanh'],
  },
  {
    id: 'band-shoulder-press', name: 'Đẩy vai với dây', group: 'upper', pattern: 'press', primary: ['front-deltoids'], secondary: ['triceps'],
    gear: 'band', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Đứng lên giữa dây, cầm hai đầu ngang vai', 'Đẩy thẳng tay lên trên đầu', 'Hạ chậm về ngang vai'],
    mistakes: ['Ưỡn lưng', 'Khuỷu tay xoè quá rộng'],
  },
  {
    id: 'rear-delt-fly', name: 'Dang tay sau tạ đơn', group: 'upper', pattern: 'shoulder', primary: ['back-deltoids'], secondary: ['upper-back', 'trapezius'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 3,
    cues: ['Gập người về trước, lưng thẳng, tạ thả dưới ngực', 'Dang hai tay sang ngang đến ngang vai', 'Hạ chậm'],
    mistakes: ['Dùng đà đứng bật lên', 'Nhún vai'],
  },
  {
    id: 'face-pull', name: 'Kéo cáp về mặt', group: 'upper', pattern: 'shoulder', primary: ['back-deltoids', 'upper-back'], secondary: ['trapezius'],
    gear: 'gym', difficulty: 2, mode: 'reps', met: 3.5,
    cues: ['Ròng rọc cao ngang mặt, cầm dây thừng', 'Kéo về phía trán, tách hai tay ra hai bên', 'Siết bả vai rồi duỗi về chậm'],
    mistakes: ['Kéo xuống ngực', 'Ngả người ra sau'],
  },
  {
    id: 'yt-raise', name: 'Nâng tay chữ Y-T', group: 'upper', pattern: 'shoulder', primary: ['upper-back', 'back-deltoids'], secondary: ['trapezius', 'lower-back'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Nằm sấp, trán cách sàn một chút', 'Nâng hai tay thành chữ Y, hạ xuống', 'Nâng tay thành chữ T, hạ xuống, lặp lại'],
    mistakes: ['Ngửa cổ', 'Nhún vai lên tai'],
  },
  {
    id: 'inverted-row', name: 'Kéo người dưới gầm bàn', group: 'upper', pattern: 'row', primary: ['upper-back', 'biceps'], secondary: ['back-deltoids', 'forearm'],
    gear: 'none', difficulty: 2, mode: 'reps', homeOnly: true, met: 4,
    cues: ['Nằm dưới bàn chắc chắn, hai tay nắm mép bàn', 'Người thẳng, kéo ngực lên sát mép bàn', 'Hạ chậm đến khi duỗi hết tay'],
    mistakes: ['Võng hông', 'Bàn không chắc chắn'],
  },
  {
    id: 'door-row', name: 'Kéo khung cửa', group: 'upper', pattern: 'row', primary: ['upper-back'], secondary: ['biceps', 'forearm'],
    gear: 'none', difficulty: 1, mode: 'reps', homeOnly: true, met: 3,
    cues: ['Đứng sát khung cửa, hai tay nắm hai bên', 'Ngả người ra sau, tay duỗi thẳng', 'Kéo ngực về phía cửa, siết bả vai'],
    mistakes: ['Kéo bằng tay thay vì bằng lưng', 'Đứng quá xa khung cửa'],
  },
  {
    id: 'renegade-row', name: 'Renegade row', group: 'upper', pattern: 'row', primary: ['upper-back', 'abs'], secondary: ['biceps', 'triceps', 'obliques'],
    gear: 'dumbbell', difficulty: 3, mode: 'reps', perSide: true, met: 5,
    cues: ['Chống tay lên hai tạ ở tư thế hít đất', 'Kéo một tạ về hông, giữ hông không xoay', 'Hạ xuống rồi đổi tay'],
    mistakes: ['Xoay hông theo tay kéo', 'Hai chân khép quá sát nên mất thăng bằng'],
  },
  {
    id: 'band-pulldown', name: 'Kéo xô với dây', group: 'upper', pattern: 'pulldown', primary: ['upper-back'], secondary: ['biceps', 'back-deltoids'],
    gear: 'band', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Móc dây lên cao, quỳ hoặc ngồi bên dưới', 'Kéo dây xuống ngang cằm, khuỷu tay hướng xuống sàn', 'Duỗi tay lên chậm'],
    mistakes: ['Ngả người ra sau', 'Nhún vai'],
  },
  {
    id: 'db-pullover', name: 'Pullover tạ đơn', group: 'upper', pattern: 'pulldown', primary: ['upper-back', 'chest'], secondary: ['triceps'],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 3.5,
    cues: ['Nằm ngửa, hai tay ôm một quả tạ trên ngực', 'Hạ tạ ra sau đầu, khuỷu tay hơi cong', 'Kéo tạ về trên ngực'],
    mistakes: ['Hạ quá sâu', 'Ưỡn lưng'],
  },
  {
    id: 'negative-pullup', name: 'Kéo xà hạ chậm', group: 'upper', pattern: 'pulldown', primary: ['upper-back', 'biceps'], secondary: ['forearm', 'back-deltoids'],
    gear: 'bar', difficulty: 2, mode: 'reps', met: 5,
    cues: ['Bật nhảy hoặc đứng ghế lên vị trí cằm trên xà', 'Hạ người thật chậm trong 3–5 giây', 'Duỗi hết tay rồi lặp lại'],
    mistakes: ['Thả rơi người', 'Nhún vai lên tai'],
  },
  {
    id: 'assisted-pullup', name: 'Kéo xà có máy hỗ trợ', group: 'upper', pattern: 'pulldown', primary: ['upper-back', 'biceps'], secondary: ['forearm'],
    gear: 'gym', difficulty: 1, mode: 'reps', met: 4,
    cues: ['Quỳ lên đệm máy, chọn mức hỗ trợ', 'Kéo người lên đến khi cằm qua tay cầm', 'Hạ chậm'],
    mistakes: ['Chọn hỗ trợ quá nhiều', 'Đung đưa người'],
  },
  {
    id: 'band-curl', name: 'Cuốn tay với dây', group: 'upper', pattern: 'biceps', primary: ['biceps'], secondary: ['forearm'],
    gear: 'band', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Đứng lên giữa dây, cầm hai đầu', 'Khuỷu tay sát thân, cuốn tay lên vai', 'Hạ chậm'],
    mistakes: ['Khuỷu tay đưa ra trước', 'Đung đưa người'],
  },
  {
    id: 'db-kickback', name: 'Duỗi tay sau tạ đơn', group: 'upper', pattern: 'triceps', primary: ['triceps'], secondary: [],
    gear: 'dumbbell', difficulty: 1, mode: 'reps', perSide: true, met: 3,
    cues: ['Gập người, khuỷu tay ép sát thân ngang lưng', 'Duỗi thẳng tay ra sau', 'Gập về chậm, cánh tay trên đứng yên'],
    mistakes: ['Vung cả cánh tay', 'Khuỷu tay hạ thấp'],
  },
  {
    id: 'band-pushdown', name: 'Ép tay sau với dây', group: 'upper', pattern: 'triceps', primary: ['triceps'], secondary: [],
    gear: 'band', difficulty: 1, mode: 'reps', met: 3,
    cues: ['Móc dây lên cao, hai tay cầm hai đầu', 'Khuỷu tay sát thân, ép dây xuống đến khi duỗi thẳng', 'Thả lên chậm'],
    mistakes: ['Khuỷu tay mở rộng', 'Cúi người đè xuống'],
  },
  {
    id: 'skull-crusher', name: 'Skull crusher tạ đơn', group: 'upper', pattern: 'triceps', primary: ['triceps'], secondary: [],
    gear: 'dumbbell', difficulty: 2, mode: 'reps', met: 3,
    cues: ['Nằm ngửa, hai tạ trên ngực, lòng bàn tay đối nhau', 'Gập khuỷu, hạ tạ về hai bên đầu', 'Duỗi tay lên lại'],
    mistakes: ['Khuỷu tay xoè ra', 'Hạ tạ quá nhanh'],
  },

  // Bụng (bổ sung)
  {
    id: 'hollow-hold', name: 'Hollow hold', group: 'core', pattern: 'core-hold', primary: ['abs'], secondary: ['obliques', 'quadriceps'],
    gear: 'none', difficulty: 2, mode: 'time', met: 3.8,
    cues: ['Nằm ngửa, ép lưng dưới xuống sàn', 'Nâng vai và chân khỏi sàn, tay duỗi qua đầu', 'Giữ người cong nhẹ như chiếc thuyền'],
    mistakes: ['Lưng dưới nhấc khỏi sàn', 'Nín thở'],
  },
  {
    id: 'plank-shoulder-tap', name: 'Plank chạm vai', group: 'core', pattern: 'core-hold', primary: ['abs', 'obliques'], secondary: ['front-deltoids', 'triceps'],
    gear: 'none', difficulty: 2, mode: 'time', met: 4,
    cues: ['Tư thế hít đất, chân rộng hơn hông', 'Lần lượt đưa tay chạm vai đối diện', 'Giữ hông yên, không lắc'],
    mistakes: ['Lắc hông theo tay', 'Nhô mông lên cao'],
  },
  {
    id: 'pallof-press', name: 'Pallof press với dây', group: 'core', pattern: 'core-hold', primary: ['obliques', 'abs'], secondary: [],
    gear: 'band', difficulty: 2, mode: 'reps', perSide: true, met: 3,
    cues: ['Móc dây ngang ngực, đứng nghiêng với điểm móc', 'Đẩy dây thẳng ra trước ngực', 'Giữ thân không bị kéo xoay, thu về chậm'],
    mistakes: ['Thân xoay theo dây', 'Đứng quá gần điểm móc'],
  },
  {
    id: 'reverse-crunch', name: 'Gập bụng ngược', group: 'core', pattern: 'core-move', primary: ['abs'], secondary: ['obliques'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3.8,
    cues: ['Nằm ngửa, co gối 90°, tay đặt dọc thân', 'Cuộn hông nhấc khỏi sàn, kéo gối về ngực', 'Hạ chậm về vị trí cũ'],
    mistakes: ['Dùng đà vung chân', 'Hạ chân chạm sàn'],
  },
  {
    id: 'v-up', name: 'V-up', group: 'core', pattern: 'core-move', primary: ['abs'], secondary: ['quadriceps', 'obliques'],
    gear: 'none', difficulty: 3, mode: 'reps', met: 4,
    cues: ['Nằm duỗi thẳng, tay qua đầu', 'Cùng lúc nâng thân và chân, tay chạm mũi chân', 'Hạ chậm về nằm'],
    mistakes: ['Gập gối nhiều', 'Đập lưng xuống sàn'],
  },
  {
    id: 'heel-touch', name: 'Chạm gót', group: 'core', pattern: 'core-rotate', primary: ['obliques'], secondary: ['abs'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 3.5,
    cues: ['Nằm ngửa, co gối, nâng nhẹ vai', 'Nghiêng sang trái chạm gót trái, rồi sang phải', 'Giữ vai không chạm sàn'],
    mistakes: ['Hạ vai xuống giữa các lần', 'Kéo cổ'],
  },
  {
    id: 'band-woodchop', name: 'Chặt gỗ với dây', group: 'core', pattern: 'core-rotate', primary: ['obliques'], secondary: ['abs', 'front-deltoids'],
    gear: 'band', difficulty: 2, mode: 'reps', perSide: true, met: 3.5,
    cues: ['Móc dây cao bên cạnh, hai tay cầm đầu dây', 'Kéo chéo xuống qua hông bên kia, xoay thân', 'Về chậm theo đường cũ'],
    mistakes: ['Chỉ dùng tay kéo', 'Cong lưng'],
  },
  {
    id: 'db-side-bend', name: 'Nghiêng người tạ đơn', group: 'core', pattern: 'core-rotate', primary: ['obliques'], secondary: ['lower-back'],
    gear: 'dumbbell', difficulty: 1, mode: 'reps', perSide: true, met: 3,
    cues: ['Cầm tạ một tay, tay kia đặt sau đầu', 'Nghiêng người về phía tạ', 'Kéo người thẳng lại bằng cơ liên sườn bên kia'],
    mistakes: ['Nghiêng về trước hoặc ra sau', 'Dùng tạ quá nặng'],
  },

  // Cardio (bổ sung)
  {
    id: 'step-jack', name: 'Jumping jack không nhảy', group: 'cardio', pattern: 'run', primary: ['abductors', 'front-deltoids'], secondary: ['calves'],
    gear: 'none', difficulty: 1, mode: 'time', met: 4,
    cues: ['Bước một chân sang ngang, đồng thời giơ tay qua đầu', 'Thu chân và tay về', 'Đổi bên liên tục'],
    mistakes: ['Bước quá hẹp', 'Tay chỉ giơ nửa chừng'],
  },
  {
    id: 'run-in-place', name: 'Chạy tại chỗ', group: 'cardio', pattern: 'run', primary: ['quadriceps', 'calves'], secondary: ['hamstring'],
    gear: 'none', difficulty: 1, mode: 'time', met: 7,
    cues: ['Chạy nhẹ bằng mũi chân', 'Tay đánh tự nhiên theo nhịp', 'Thở đều'],
    mistakes: ['Tiếp đất bằng gót', 'Gồng vai'],
  },
  {
    id: 'shadow-boxing', name: 'Đấm gió', group: 'cardio', pattern: 'run', primary: ['front-deltoids'], secondary: ['triceps', 'obliques', 'calves'],
    gear: 'none', difficulty: 1, mode: 'time', met: 6,
    cues: ['Đứng thủ, hai tay che cằm, nhún nhẹ', 'Đấm thẳng luân phiên, xoay hông theo cú đấm', 'Thu tay về che mặt sau mỗi cú'],
    mistakes: ['Duỗi khoá khuỷu tay', 'Đứng im một chỗ'],
  },
  {
    id: 'star-jump', name: 'Bật nhảy hình sao', group: 'cardio', pattern: 'jump', primary: ['quadriceps', 'gluteal'], secondary: ['calves', 'front-deltoids'],
    gear: 'none', difficulty: 2, mode: 'time', met: 8,
    cues: ['Ngồi xuống nửa squat', 'Bật lên, dang tay và chân thành hình ngôi sao', 'Tiếp đất nhẹ, gối hơi chùng'],
    mistakes: ['Tiếp đất thẳng gối', 'Tiếp đất mạnh bằng gót'],
  },
  {
    id: 'tuck-jump', name: 'Bật nhảy co gối', group: 'cardio', pattern: 'jump', primary: ['quadriceps', 'calves'], secondary: ['abs', 'gluteal'],
    gear: 'none', difficulty: 3, mode: 'reps', met: 8,
    cues: ['Bật thẳng lên cao', 'Kéo hai gối về phía ngực', 'Tiếp đất nhẹ bằng mũi chân rồi bật tiếp'],
    mistakes: ['Tiếp đất nặng nề', 'Cúi người xuống gối thay vì kéo gối lên'],
  },
  {
    id: 'half-burpee', name: 'Burpee không nhảy', group: 'cardio', pattern: 'mixed', primary: ['quadriceps', 'chest'], secondary: ['abs', 'front-deltoids'],
    gear: 'none', difficulty: 1, mode: 'reps', met: 5,
    cues: ['Ngồi xuống, chống hai tay xuống sàn', 'Bước lần lượt từng chân ra sau thành plank', 'Bước chân về rồi đứng lên'],
    mistakes: ['Võng lưng ở plank', 'Cong lưng khi cúi'],
  },
  {
    id: 'inchworm', name: 'Inchworm', group: 'cardio', pattern: 'mixed', primary: ['hamstring', 'abs'], secondary: ['front-deltoids', 'chest'],
    gear: 'none', difficulty: 2, mode: 'reps', met: 4,
    cues: ['Đứng thẳng, cúi người chống tay xuống sàn', 'Bò tay ra trước đến tư thế plank', 'Bò tay về sát chân rồi đứng lên'],
    mistakes: ['Võng hông ở plank', 'Gập gối quá nhiều'],
  },
  {
    id: 'plank-jack', name: 'Plank jack', group: 'cardio', pattern: 'mixed', primary: ['abs', 'abductors'], secondary: ['front-deltoids', 'calves'],
    gear: 'none', difficulty: 2, mode: 'time', met: 6,
    cues: ['Tư thế hít đất, hai chân khép', 'Bật hai chân mở rộng rồi khép lại', 'Giữ hông ngang vai'],
    mistakes: ['Nhô mông lên cao', 'Võng lưng'],
  },
  {
    id: 'db-thruster', name: 'Thruster tạ đơn', group: 'cardio', pattern: 'mixed', primary: ['quadriceps', 'front-deltoids'], secondary: ['gluteal', 'triceps', 'abs'],
    gear: 'dumbbell', difficulty: 3, mode: 'reps', met: 8,
    cues: ['Cầm tạ ngang vai, squat xuống', 'Đứng lên mạnh và dùng đà đẩy tạ thẳng lên đầu', 'Hạ tạ về vai và squat tiếp'],
    mistakes: ['Ưỡn lưng khi đẩy', 'Gót chân nhấc lên'],
  },
  {
    id: 'stair-climber', name: 'Máy leo cầu thang', group: 'cardio', pattern: 'machine', primary: ['gluteal', 'quadriceps'], secondary: ['calves', 'hamstring'],
    gear: 'gym', difficulty: 2, mode: 'time', met: 9,
    cues: ['Đứng thẳng, tay chỉ vịn nhẹ', 'Đặt cả bàn chân lên bậc', 'Giữ tốc độ đều, thở đều'],
    mistakes: ['Chống người lên tay vịn', 'Chỉ bước bằng mũi chân'],
  },
]

export const exById = (id: string) => LIBRARY.find((e) => e.id === id)

/** Link tìm video hướng dẫn trên YouTube (miễn phí, luôn có kết quả cập nhật) */
export const youtubeSearch = (e: Ex) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${e.name} cách tập đúng kỹ thuật`)}`
