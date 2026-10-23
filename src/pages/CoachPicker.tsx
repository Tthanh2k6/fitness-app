import { Link } from 'react-router-dom'
import { Camera, ChevronRight, ShieldCheck } from 'lucide-react'
import Pose, { poseOf } from '../components/Pose'
import { Body, MuscleTag, Page, TitleBar } from '../components/ui'
import { exById } from '../data/exercises'
import { MUSCLE, PLATE_INK, PLATE_SOFT } from '../data/muscles'
import { amountLabel } from '../logic/plan'
import { itemDone } from '../logic/session'
import { useToday } from '../logic/useToday'
import { EXERCISE_AI } from '../ai/pose/exercises'

/** Chọn bài để tập với camera chỉnh dáng (mở từ nút camera giữa thanh điều hướng) */
export default function CoachPicker() {
  const { session, log } = useToday()
  const list = Object.keys(EXERCISE_AI)
    .map((id) => exById(id))
    .filter((e) => !!e)
    .map((e) => ({ e, it: session?.items.find((x) => x.exId === e.id) }))
    // Bài có trong buổi hôm nay lên đầu
    .sort((a, b) => Number(!!b.it) - Number(!!a.it))

  return (
    <Page>
      <Body>
        <TitleBar title="Chỉnh dáng bằng camera" />
        <p className="muted">Đặt điện thoại nghiêng 90° so với người tập. Camera đếm lần, đo góc khớp và nhắc ngay khi sai tư thế.</p>
        <p className="xs muted row" style={{ gap: 8, background: 'var(--surface)', padding: '10px 12px', borderRadius: 14, alignItems: 'flex-start' }}>
          <ShieldCheck size={16} style={{ color: 'var(--green-ink)', flexShrink: 0 }} />
          Hình ảnh xử lý ngay trên điện thoại, không gửi đi đâu.
        </p>
        <ul className="ex-list">
          {list.map(({ e, it }) => {
            const plate = MUSCLE[e.group].plate
            const done = it ? itemDone(it, log) : false
            return (
              <li key={e.id}>
                <Link to={`/coach/${e.id}`} className={`ex ${done ? 'done' : ''}`}>
                  <span className="ex-main">
                    <span className="thumb" style={{ background: PLATE_SOFT[plate] }}><Pose name={poseOf(e)} size={60} color={PLATE_INK[plate]} /></span>
                    <span className="ex-txt">
                      <b>{e.name}</b>
                      {it && <span className="ex-amt">{it.sets} × {amountLabel(it)}</span>}
                      <span className="ex-meta">
                        {it ? <span className="tag green" style={{ height: 22 }}>Trong buổi hôm nay</span> : <MuscleTag group={e.group} />}
                        <span className="ai"><Camera size={12} strokeWidth={2.4} /> AI</span>
                      </span>
                      <span className="xs muted">Bắt lỗi: {e.mistakes.join(', ').toLowerCase()}</span>
                    </span>
                  </span>
                  <ChevronRight size={18} className="chev" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Body>
    </Page>
  )
}
