import Model, { type IExerciseData, type Muscle } from 'react-body-highlighter'
import { PLATE_HEX, type Plate } from '../data/muscles'

// Thư viện tô màu bằng style nội tuyến nên dùng được biến CSS: thân người đổi màu theo giao diện sáng/tối
const BODY = 'var(--line)'

export default function BodyMap({ primary, secondary = [], plate, size = 120, views = ['anterior', 'posterior'] }: {
  primary: Muscle[]
  secondary?: Muscle[]
  plate: Plate
  size?: number
  views?: ('anterior' | 'posterior')[]
}) {
  // react-body-highlighter tô màu theo tần suất: 1 = màu nhạt (cơ phụ), 2 = màu đậm (cơ chính)
  const data: IExerciseData[] = [
    { name: 'primary', muscles: primary, frequency: 2 },
    { name: 'secondary', muscles: secondary, frequency: 1 },
  ]
  return (
    <div className="flex justify-center gap-2">
      {views.map((v) => (
        <Model key={v} type={v} data={data} bodyColor={BODY}
          highlightedColors={[PLATE_HEX[plate].light, PLATE_HEX[plate].base]}
          style={{ width: size }} svgStyle={{ width: '100%', height: 'auto' }} />
      ))}
    </div>
  )
}
