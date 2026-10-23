import type { CSSProperties } from 'react'
import { PLATE, type Plate } from '../data/muscles'

export type BarPlate = { c: Plate; pct: number } | { outline: true }

/**
 * Thanh đòn nhìn ngang, hình ảnh nhận diện của app.
 * Mỗi đĩa là một chỉ số (phần màu đậm dâng lên theo % hoàn thành) hoặc một bài tập (đĩa nét đứt là bài chưa xong).
 */
export default function Barbell({ plates, w = 210, h = 130, pw = 28, gap = 5, ph = 118, anim = false, shaft = 'var(--on-hero-2)', empty = 'var(--hero-2)', label }: {
  plates: BarPlate[]
  w?: number
  h?: number
  pw?: number
  gap?: number
  ph?: number
  anim?: boolean
  shaft?: string
  empty?: string
  label?: string
}) {
  const cy = h / 2
  const sleeveEnd = 14
  const x0 = w - sleeveEnd - plates.length * (pw + gap) + gap
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}>
      <rect x={0} y={cy - 3.5} width={Math.max(0, x0 - 12)} height={7} rx={3.5} fill={shaft} opacity={0.55} />
      <rect x={x0 - 16} y={cy - 13} width={10} height={26} rx={3} fill={shaft} />
      <rect x={x0 - 8} y={cy - 7} width={w - x0 + 8} height={14} rx={5} fill={shaft} opacity={0.8} />
      {plates.map((p, i) => {
        const x = x0 + i * (pw + gap)
        const y = cy - ph / 2
        if ('outline' in p) {
          return <rect key={i} x={x + 1} y={y + 1} width={pw - 2} height={ph - 2} rx={6} fill="none" stroke={empty} strokeWidth={2} strokeDasharray="4 4" />
        }
        const pct = Math.max(0, Math.min(1, p.pct))
        const fh = Math.max(12, ph * pct)
        return (
          <g key={i}>
            <rect x={x} y={y} width={pw} height={ph} rx={6} fill={PLATE[p.c]} fillOpacity={0.22} />
            {pct > 0 && (
              <rect className={anim ? 'anim-plate' : undefined} style={{ animationDelay: `${i * 90}ms` } as CSSProperties}
                x={x} y={y + ph - fh} width={pw} height={fh} rx={6} fill={PLATE[p.c]} />
            )}
            <rect x={x + pw / 2 - 1} y={y + 10} width={2} height={ph - 20} rx={1} fill="#000" opacity={0.1} />
          </g>
        )
      })}
    </svg>
  )
}
