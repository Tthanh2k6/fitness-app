import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, Check, Pause, Play, Plus, SkipForward, Timer, Video, Volume2, VolumeX, X } from 'lucide-react'
import Pose, { poseOf } from '../components/Pose'
import Sheet from '../components/Sheet'
import VideoPlayer from '../components/VideoPlayer'
import { Body, Page, useToast } from '../components/ui'
import { exById, type Pattern } from '../data/exercises'
import { VIDEOS } from '../data/videos'
import { prescribe, type PlanItem } from '../logic/plan'
import { setsDone } from '../logic/session'
import { useToday } from '../logic/useToday'
import { useVietnameseVoice } from '../ai/speech'
import { clock } from '../lib/useCountdown'

type Phase = 'ready' | 'work' | 'rest'

// Bài nhịp nhanh đếm 2,5 giây một lần, còn lại 3 giây
const FAST = new Set<Pattern>(['jump', 'run', 'mixed'])

const mmss = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function Workout() {
  const { profile, session, log, date, store } = useToday()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const toast = useToast()
  const voice = useVietnameseVoice()

  // ?ex=<id>: bắt đầu từ bài này; bài không có trong buổi hôm nay thì tập riêng một bài
  const exParam = params.get('ex')
  const extraEx = exParam && !session?.items.some((it) => it.exId === exParam) ? exById(exParam) : undefined
  const extra = !!extraEx
  const items: PlanItem[] = useMemo(
    () => (extraEx ? [{ exId: extraEx.id, ...prescribe(extraEx, profile) }] : session?.items ?? []),
    [extraEx, session, profile],
  )
  // Bài tập thêm: chỉ tính các hiệp làm trong lần mở này
  const [base] = useState(() => (exParam ? log?.sets[exParam] ?? 0 : 0))
  const doneOf = (it: PlanItem) => (extra ? Math.min(it.sets, Math.max(0, (log?.sets[it.exId] ?? 0) - base)) : setsDone(it, log))
  const finished = (it: PlanItem) => doneOf(it) >= it.sets

  const [focus, setFocus] = useState<string | null>(exParam && !extra ? exParam : null)
  const [skipped, setSkipped] = useState<string[]>([])
  const pending = (it: PlanItem) => !finished(it) && !skipped.includes(it.exId)
  const focusIdx = focus ? items.findIndex((it) => it.exId === focus && pending(it)) : -1
  const index = focusIdx >= 0 ? focusIdx : items.findIndex(pending)
  const item = index >= 0 ? items[index] : null
  const e = item ? exById(item.exId) : undefined
  const setNo = item ? doneOf(item) + 1 : 0
  const upcoming = index >= 0 ? items.slice(index + 1).find(pending) ?? items.slice(0, index).find(pending) : undefined
  const upEx = upcoming ? exById(upcoming.exId) : undefined

  // Đồng hồ chung cho hiệp tập và lúc nghỉ, dừng được giữa chừng
  const [phase, setPhase] = useState<Phase>('ready')
  const [runStart, setRunStart] = useState<number | null>(null)
  const [accum, setAccum] = useState(0)
  const [restTotal, setRestTotal] = useState(0)
  const [betweenEx, setBetweenEx] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [video, setVideo] = useState(false)
  useEffect(() => {
    if (runStart === null) return
    const id = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(id)
  }, [runStart])
  const activeMs = accum + (runStart !== null ? Math.max(0, now - runStart) : 0)
  const startClock = () => {
    const t = Date.now()
    setAccum(0)
    setNow(t)
    setRunStart(t)
  }
  const stopClock = () => {
    setRunStart(null)
    setAccum(0)
  }
  const paused = phase === 'work' && runStart === null
  const pause = () => {
    if (runStart === null) return
    setAccum((a) => a + Date.now() - runStart)
    setRunStart(null)
  }
  const resume = () => {
    const t = Date.now()
    setNow(t)
    setRunStart(t)
  }

  const timed = item?.unit === 'giây'
  const sides = item?.perSide ? 2 : 1
  const workSec = item && timed ? item.amount * sides : 0
  const target = item && !timed ? item.amount * sides : 0
  const tempo = e && (FAST.has(e.pattern) || e.group === 'cardio') ? 2500 : 3000
  const count = phase === 'work' && !timed ? Math.min(target, Math.floor(activeMs / tempo)) : 0
  const left = phase === 'work' && timed ? Math.max(0, Math.ceil(workSec - activeMs / 1000)) : workSec
  const restLeft = phase === 'rest' ? Math.max(0, Math.ceil(restTotal - activeMs / 1000)) : 0
  const cue = e ? e.cues[(setNo - 1 + e.cues.length) % e.cues.length] : ''

  const startSet = () => {
    setPhase('work')
    startClock()
    voice.speak(cue)
  }

  const finishSet = (reps: number) => {
    if (!item || !e) return
    store.addSets(date, item.exId, 1, reps)
    stopClock()
    const lastSet = setNo >= item.sets
    const anyLeft = items.some((it) => it.exId !== item.exId && pending(it))
    if (lastSet && !anyLeft) {
      setPhase('ready')
      if (extra) {
        voice.speak('Xong bài, làm tốt lắm')
        toast(`Đã xong ${e.name}`)
        nav('/train')
      } else {
        voice.speak('Xong bài cuối, giãn cơ thôi')
        nav('/stretch?phase=cooldown')
      }
      return
    }
    if (lastSet && focus === item.exId) setFocus(null)
    voice.speak(lastSet ? 'Xong bài, nghỉ rồi sang bài tiếp' : 'Nghỉ')
    setBetweenEx(lastSet)
    setRestTotal(item.rest)
    setPhase('rest')
    startClock()
  }

  const endRest = () => {
    stopClock()
    // Hiệp sau của cùng bài tự bắt đầu, sang bài mới thì chờ người tập sẵn sàng
    if (betweenEx) {
      setPhase('ready')
      if (e) voice.speak(`Bài tiếp theo: ${e.name}`)
    } else startSet()
  }

  const finishNow = () => {
    if (!item) return
    if (timed) finishSet(Math.max(1, Math.round(activeMs / 1000 / sides)))
    else finishSet(Math.max(1, Math.round(count / sides)))
  }

  const skipExercise = () => {
    if (!item) return
    if (extra) return nav('/train')
    stopClock()
    setPhase('ready')
    setSkipped((s) => [...s, item.exId])
    if (focus === item.exId) setFocus(null)
  }

  // Đếm đủ số lần hoặc hết giờ thì tự xong hiệp; hết giờ nghỉ thì vào hiệp sau
  useEffect(() => {
    if (phase === 'work' && !timed && target > 0 && count >= target) finishSet(item!.amount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, phase])
  useEffect(() => {
    if (phase === 'work' && timed && runStart !== null && left === 0) finishSet(item!.amount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase])
  useEffect(() => {
    if (phase === 'rest' && runStart !== null && restLeft === 0) endRest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restLeft, phase])
  // Đọc số lần đếm được
  useEffect(() => {
    if (count > 0 && count < target) voice.speak(String(count))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])
  // Bài tính giờ từng bên: nhắc đổi bên khi hết nửa thời gian
  const half = phase === 'work' && timed && !!item?.perSide && runStart !== null && left === item.amount
  useEffect(() => {
    if (half) voice.speak('Đổi bên')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [half])

  const header = (
    <div className="row">
      <Link to="/train" className="icon-btn" aria-label="Thoát buổi tập"><X size={22} /></Link>
      <div className="grow" style={{ textAlign: 'center' }}>
        {item && e ? (
          <><p className="lbl">{extra ? 'Tập thêm' : `Bài ${index + 1}/${items.length}`}</p><p className="h3">{e.name}</p></>
        ) : <p className="h3">Buổi tập</p>}
      </div>
      <button className="icon-btn" onClick={voice.toggle} disabled={!voice.available}
        aria-label={voice.on ? 'Tắt giọng đọc' : 'Bật giọng đọc'} title={voice.available ? undefined : 'Máy chưa có giọng đọc tiếng Việt'}
        style={voice.available ? undefined : { opacity: 0.4 }}>
        {voice.on && voice.available ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </div>
  )
  const segs = (
    <div className="segs">
      {items.map((it, i) => <i key={it.exId} className={finished(it) ? 'on' : i === index ? 'half' : ''} />)}
    </div>
  )

  if (!items.length) {
    return (
      <Empty title="Hôm nay là ngày nghỉ" text="Cơ bắp phát triển trong lúc nghỉ. Giãn cơ nhẹ hoặc đi bộ là đủ.">
        <Link to="/stretch?phase=cooldown" className="btn wide" style={{ background: 'var(--cam-ink)', color: '#14161A' }}>Giãn cơ thư giãn</Link>
        <Link to="/home" className="btn wide on-dark">Về trang chủ</Link>
      </Empty>
    )
  }

  if (!item || !e) {
    const all = items.every(finished)
    return (
      <Empty icon title={all ? 'Xong hết bài tập chính' : 'Hết bài trong buổi'}
        text={all ? 'Giãn cơ 5 phút để cơ hồi phục nhanh hơn.' : 'Bạn đã bỏ qua các bài còn lại. Giãn cơ rồi xem tổng kết nhé.'}>
        <Link to="/stretch?phase=cooldown" className="btn wide" style={{ background: 'var(--cam-ink)', color: '#14161A' }}>Giãn cơ sau tập</Link>
        <Link to="/done" className="btn wide on-dark">Xem tổng kết</Link>
      </Empty>
    )
  }

  const nextCard = (it: PlanItem | undefined, ex: typeof e | undefined, label: string) => (
    ex && it ? (
      <Link to={`/exercise/${ex.id}`} className="next">
        <span className="thumb" style={{ background: 'var(--cam-2)', width: 52, height: 52 }}><Pose name={poseOf(ex)} size={52} color="var(--cam-ink-2)" /></span>
        <span className="grow col" style={{ gap: 2 }}>
          <span className="lbl" style={{ color: 'var(--cam-ink-2)' }}>{label}</span>
          <b style={{ fontWeight: 600 }}>{ex.name}</b>
        </span>
        <span className="num" style={{ fontSize: 20, color: 'var(--cam-ink-2)' }}>{it.sets} × {it.amount >= 120 && it.unit === 'giây' ? `${Math.round(it.amount / 60)}′` : it.amount}</span>
      </Link>
    ) : (
      <Link to="/stretch?phase=cooldown" className="next">
        <span className="thumb" style={{ background: 'var(--cam-2)', width: 52, height: 52 }}><Pose name="fold" size={52} color="var(--cam-ink-2)" floor={false} /></span>
        <span className="grow col" style={{ gap: 2 }}>
          <span className="lbl" style={{ color: 'var(--cam-ink-2)' }}>{label}</span>
          <b style={{ fontWeight: 600 }}>{extra ? 'Hết bài' : 'Giãn cơ sau tập'}</b>
        </span>
      </Link>
    )
  )

  if (phase === 'rest') {
    const pct = restTotal ? Math.min(100, (restLeft / restTotal) * 100) : 0
    return (
      <Page cam>
        <Body gap={16}>
          {header}
          {segs}
          <div className="col" style={{ flex: 1, justifyContent: 'center', gap: 16, minHeight: 360 }}>
            <p className="lbl" style={{ color: 'var(--cam-ink-2)' }}>{betweenEx ? 'Nghỉ trước bài tiếp theo' : 'Nghỉ giữa hiệp'}</p>
            <span className="num" style={{ fontSize: 112, lineHeight: 0.85 }} aria-live="polite">{clock(restLeft)}</span>
            <div className="bar" style={{ height: 8, background: 'var(--cam-3)' }}><i style={{ width: `${pct}%`, background: 'var(--cam-ink)' }} /></div>
            <div className="chipset">
              <button className="choice" onClick={() => setRestTotal((t) => t + 15)}><Plus size={16} /> 15 giây</button>
              <button className="choice" onClick={endRest}><SkipForward size={16} /> Bỏ qua</button>
            </div>
          </div>
          {nextCard(item, e, `Tiếp theo · Hiệp ${setNo}/${item.sets}`)}
        </Body>
      </Page>
    )
  }

  const tagStyle = { position: 'absolute', background: 'var(--cam-3)', color: 'var(--cam-ink)' } as const
  const pillStyle = { background: 'var(--cam-3)', color: 'var(--cam-ink)' }
  const hasVideo = !!VIDEOS[e.id]
  const sideNow = timed && item.perSide && phase === 'work' ? (left > item.amount ? 'Bên thứ nhất' : 'Bên thứ hai') : null

  return (
    <Page cam>
      <Body gap={16}>
        {header}
        {segs}
        <div className="stage-panel" style={{ height: 'clamp(190px, 30dvh, 250px)' }}>
          <Pose name={poseOf(e)} size={250} color="var(--cam-ink)" />
          <span className="tag" style={{ ...tagStyle, top: 14, left: 14 }}><span>Hiệp <b>{setNo}</b>/{item.sets}</span></span>
          <span className="tag" style={{ ...tagStyle, top: 14, right: 14 }}><Timer size={13} /> {mmss(activeMs)}</span>
          {hasVideo && (
            <button className="pill" style={{ ...pillStyle, position: 'absolute', bottom: 14, left: 14 }} onClick={() => { pause(); setVideo(true) }}>
              <Video size={14} /> Video
            </button>
          )}
          {e.ai && (
            <Link to={`/coach/${e.id}?from=workout`} className="pill" style={{ ...pillStyle, position: 'absolute', bottom: 14, right: 14 }}>
              <Camera size={14} /> Camera AI
            </Link>
          )}
        </div>

        <div className="counter" aria-live="polite">
          {timed ? (
            <>
              <span className="num" style={{ fontSize: 104 }}>{clock(left)}</span>
              <span className="of">{sideNow ?? (item.perSide ? `${item.amount} giây/bên` : `/ ${clock(workSec)}`)}</span>
            </>
          ) : (
            <>
              <span className="num">{String(count).padStart(2, '0')}</span>
              <span className="of">/ {target} lần</span>
            </>
          )}
        </div>

        <div className="cue">
          <span style={{ color: '#FFC34A' }}><Volume2 size={20} /></span>
          <p style={{ fontSize: 15 }}>{cue}.{item.perSide && !timed ? ` Mỗi bên ${item.amount} lần.` : ''}</p>
        </div>

        <div className="ctrl">
          <button className="round" onClick={paused ? resume : pause} disabled={phase !== 'work'} aria-label={paused ? 'Tiếp tục' : 'Tạm dừng'}
            style={phase !== 'work' ? { opacity: 0.4 } : undefined}>
            {paused ? <Play size={22} /> : <Pause size={22} />}
          </button>
          {phase === 'ready' ? (
            <button className="btn" onClick={startSet}><Play size={20} /> Bắt đầu hiệp</button>
          ) : (
            <button className="btn" onClick={finishNow}><Check size={20} strokeWidth={2.6} /> Xong hiệp</button>
          )}
          <button className="round" onClick={skipExercise} aria-label="Bỏ qua bài này"><SkipForward size={22} /></button>
        </div>
        {phase === 'ready' && (
          <button className="link" style={{ alignSelf: 'center', color: 'var(--cam-ink-2)', marginTop: -4 }} onClick={() => finishSet(item.amount)}>
            Đã tập xong hiệp này ({item.amount} {timed ? 'giây' : 'lần'}{item.perSide ? '/bên' : ''})
          </button>
        )}

        {(upcoming || !extra) && nextCard(upcoming, upEx, 'Tiếp theo')}
        {!extra && (
          <Link to="/stretch?phase=cooldown" className="link" style={{ alignSelf: 'center', color: 'var(--cam-ink-2)' }}>Kết thúc buổi và giãn cơ</Link>
        )}
      </Body>
      {hasVideo && (
        <Sheet open={video} onClose={() => setVideo(false)} title={`Video hướng dẫn · ${e.name}`}>
          <VideoPlayer e={e} autoPlay />
          <button className="btn ghost" onClick={() => setVideo(false)}>Đóng</button>
        </Sheet>
      )}
    </Page>
  )
}

function Empty({ title, text, icon = false, children }: { title: string; text: string; icon?: boolean; children: ReactNode }) {
  return (
    <Page cam>
      <Body gap={14} style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="row" style={{ justifyContent: 'flex-start' }}>
          <Link to="/train" className="icon-btn" aria-label="Thoát"><X size={22} /></Link>
        </div>
        <div className="col" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          {icon && <span className="pop" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green)', display: 'grid', placeItems: 'center' }}><Check size={30} strokeWidth={3} color="#fff" /></span>}
          <h1 className="h1" style={{ fontSize: 28 }}>{title}</h1>
          <p className="small" style={{ color: 'var(--cam-ink-2)', maxWidth: 300 }}>{text}</p>
        </div>
        <div className="col" style={{ gap: 10 }}>{children}</div>
      </Body>
    </Page>
  )
}
