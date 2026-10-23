import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import Pose, { stretchPose } from '../components/Pose'
import { Body, Page } from '../components/ui'
import { STRETCHES } from '../data/stretches'
import { isoDate } from '../lib/format'
import { clock, useCountdown } from '../lib/useCountdown'
import { useStore } from '../store'
import { useVietnameseVoice } from '../ai/speech'

const R = 100
const C = 2 * Math.PI * R

export default function Stretch() {
  const [params] = useSearchParams()
  const phase = params.get('phase') === 'warmup' ? 'warmup' : 'cooldown'
  const warm = phase === 'warmup'
  const list = STRETCHES[phase]
  const nav = useNavigate()
  const store = useStore()
  const voice = useVietnameseVoice()
  const [i, setI] = useState(0)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [paused, setPaused] = useState<number | null>(null)

  const s = list[i]
  const last = i === list.length - 1
  const started = endAt !== null || paused !== null
  const tone = warm ? 'yellow' : 'green'

  const finish = () => {
    store.markStretch(isoDate(new Date()), phase)
    voice.speak(warm ? 'Khởi động xong, vào bài tập thôi' : 'Xong buổi tập, làm tốt lắm')
    nav(warm ? '/workout' : '/done')
  }

  const goTo = (k: number, autoStart: boolean) => {
    setI(k)
    setPaused(null)
    setEndAt(autoStart ? Date.now() + list[k].sec * 1000 : null)
    if (autoStart) voice.speak(list[k].name)
  }

  const left = useCountdown(paused === null ? endAt : null, () => (last ? finish() : goTo(i + 1, true)))
  const shown = paused ?? (endAt === null ? s.sec : left)

  // Động tác từng bên: nhắc đổi bên khi hết nửa thời gian
  const halfway = s.side && endAt !== null && paused === null && left === Math.ceil(s.sec / 2)
  useEffect(() => {
    if (halfway) voice.speak('Đổi bên')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [halfway])

  const toggle = () => {
    if (!started) {
      setEndAt(Date.now() + s.sec * 1000)
      voice.speak(s.name)
    } else if (paused !== null) {
      setEndAt(Date.now() + paused * 1000)
      setPaused(null)
    } else {
      setPaused(left)
      setEndAt(null)
    }
  }

  const running = started && paused === null
  return (
    <Page className={warm ? 'bg-yellow-soft' : 'bg-green-soft'}>
      <Body gap={16}>
        <header className="row">
          <Link to="/train" className="icon-btn" aria-label="Thoát"><X size={22} /></Link>
          <div className="grow" style={{ textAlign: 'center' }}>
            <p className="lbl" style={{ color: `var(--${tone}-ink)` }}>{warm ? 'Khởi động trước tập' : 'Giãn cơ sau tập'}</p>
            <p className="h3">Động tác {i + 1}/{list.length}</p>
          </div>
          <button className="mini-btn plain" style={{ height: 36, padding: '0 14px' }} onClick={finish}>Bỏ qua</button>
        </header>

        <div className="row" style={{ gap: 4 }} aria-hidden="true">
          {list.map((x, k) => (
            <i key={x.name} style={{ flex: 1, height: 5, borderRadius: 3, background: k < i ? 'var(--green)' : k === i ? 'var(--ink)' : 'var(--surface)' }} />
          ))}
        </div>

        <div key={i} className="step-in col" style={{ alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 232, height: 232, display: 'grid', placeItems: 'center', marginTop: 6 }}>
            <svg viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="110" cy="110" r={R} fill="none" stroke="var(--surface)" strokeWidth="12" opacity="0.7" />
              <circle cx="110" cy="110" r={R} fill="none" stroke={`var(--${tone})`} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - shown / s.sec)} style={{ transition: 'stroke-dashoffset .2s linear' }} />
            </svg>
            <span style={{ width: 180, height: 180, borderRadius: '50%', background: 'var(--surface)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              <Pose name={stretchPose(s.name)} size={180} color={`var(--${tone}-ink)`} />
            </span>
          </div>
          <span className="num" style={{ fontSize: 56 }} aria-live="polite">{clock(shown)}</span>
          {s.side && (
            <span className="tag" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
              {started && shown <= Math.ceil(s.sec / 2) ? 'Bên thứ hai' : 'Bên thứ nhất'} · mỗi bên {s.sec / 2} giây
            </span>
          )}
          <h1 className="h1" style={{ fontSize: 26, marginTop: 4 }}>{s.name}</h1>
          <p className="muted" style={{ maxWidth: 320 }}>{s.how}</p>
        </div>
      </Body>

      <div className="col" style={{ gap: 14, padding: '8px 20px calc(20px + env(safe-area-inset-bottom))' }}>
        <p className="small muted" style={{ textAlign: 'center' }}>
          {last ? (warm ? 'Động tác cuối, xong là vào bài tập' : 'Động tác cuối, xong là xem tổng kết') : <>Tiếp theo: <b style={{ color: 'var(--ink)' }}>{list[i + 1].name}</b></>}
        </p>
        <div className="row" style={{ justifyContent: 'center', gap: 20 }}>
          <button onClick={() => goTo(Math.max(0, i - 1), false)} disabled={i === 0} aria-label="Động tác trước"
            className="icon-btn" style={{ width: 56, height: 56, opacity: i === 0 ? 0.4 : 1 }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={toggle} aria-label={!started ? 'Bắt đầu' : paused !== null ? 'Tiếp tục' : 'Tạm dừng'}
            style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--cta)', color: 'var(--on-cta)', display: 'grid', placeItems: 'center' }}>
            {running ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" style={{ marginLeft: 3 }} />}
          </button>
          <button onClick={() => (last ? finish() : goTo(i + 1, false))} aria-label={last ? 'Hoàn thành' : 'Động tác tiếp'}
            className="icon-btn" style={{ width: 56, height: 56 }}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </Page>
  )
}
