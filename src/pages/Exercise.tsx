import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Camera, Check, Heart, Play, TriangleAlert, X } from 'lucide-react'
import Pose, { poseOf } from '../components/Pose'
import VideoPlayer from '../components/VideoPlayer'
import { ActionBar, BackButton, Body, Page, TitleBar, useToast } from '../components/ui'
import { DIFFICULTY_LABEL, exById, GEAR_LABEL, LIBRARY, youtubeSearch } from '../data/exercises'
import { MUSCLE, MUSCLE_NAME, PLATE, PLATE_INK, PLATE_SOFT } from '../data/muscles'
import { VIDEOS } from '../data/videos'
import { allowedGear, itemSeconds, prescribe } from '../logic/plan'
import { itemDone } from '../logic/session'
import { useToday } from '../logic/useToday'

const DIFF_TONE = { 1: 'green', 2: 'yellow', 3: 'red' } as const
const names = (list: string[]) => [...new Set(list.map((m) => MUSCLE_NAME[m] ?? m))]

export default function Exercise() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const { profile, session, log, date, store } = useToday()
  const toast = useToast()
  const [video, setVideo] = useState(false)
  const e = exById(id)

  if (!e) {
    return (
      <Page>
        <Body>
          <TitleBar title="Không tìm thấy bài tập" back="/train?tab=library" />
          <p className="muted">Bài này không còn trong thư viện.</p>
          <Link to="/train?tab=library" className="btn">Mở thư viện bài tập</Link>
        </Body>
      </Page>
    )
  }

  // Bài có trong buổi hôm nay thì hiện đúng mức đã giao; chỉ mở từ danh sách hôm nay mới cho đánh dấu xong
  const inToday = session?.items.find((it) => it.exId === e.id)
  const item = inToday ?? { exId: e.id, ...prescribe(e, profile) }
  const canMark = params.get('from') === 'today' && !!inToday
  const done = inToday ? itemDone(inToday, log) : false
  const c = MUSCLE[e.group].plate
  const kcal = Math.round((e.met * profile.weightKg * itemSeconds(item)) / 3600)
  const fav = store.logs.favorites.includes(e.id)
  const hasVideo = !!VIDEOS[e.id]
  const amount = item.unit === 'giây'
    ? item.amount >= 120 ? [String(Math.round(item.amount / 60)), 'phút'] : [String(item.amount), item.perSide ? 'giây/bên' : 'giây']
    : [String(item.amount), item.perSide ? 'lần/bên' : 'lần']
  const primary = names(e.primary)
  const secondary = names(e.secondary).filter((n) => !primary.includes(n))
  const gear = allowedGear(profile)
  const alternatives = LIBRARY.filter((a) => a.group === e.group && a.id !== e.id && gear.has(a.gear))
    .sort((a, b) => Math.abs(a.difficulty - e.difficulty) - Math.abs(b.difficulty - e.difficulty))
    .slice(0, 6)

  const toggleFav = () => {
    store.toggleFavorite(e.id)
    toast(fav ? `Đã bỏ lưu ${e.name}` : `Đã lưu ${e.name} vào thư viện`)
  }
  const heart = (
    <button className="icon-btn" onClick={toggleFav} aria-pressed={fav} aria-label={fav ? 'Bỏ lưu bài' : 'Lưu bài'}>
      <Heart size={20} fill={fav ? 'var(--red)' : 'none'} color={fav ? 'var(--red)' : 'currentColor'} />
    </button>
  )

  return (
    <Page>
      <Body>
        {video ? (
          <>
            <div className="row between">
              <BackButton />
              <div className="row" style={{ gap: 8 }}>
                <button className="pill" onClick={() => setVideo(false)}><X size={14} /> Ẩn video</button>
                {heart}
              </div>
            </div>
            <VideoPlayer key={e.id} e={e} autoPlay />
          </>
        ) : (
          <div className="visual" style={{ background: PLATE_SOFT[c] }}>
            <span style={{ transform: 'translateY(-24px)' }}><Pose name={poseOf(e)} size={290} color={PLATE_INK[c]} /></span>
            <span className="tl"><BackButton /></span>
            <span className="tr">{heart}</span>
            <span className="br">
              {hasVideo ? (
                <button className="pill" onClick={() => setVideo(true)}><Play size={14} /> Xem video</button>
              ) : (
                <a className="pill" href={youtubeSearch(e)} target="_blank" rel="noopener noreferrer"><Play size={14} /> Tìm video</a>
              )}
            </span>
            {e.ai && <span className="bl"><span className="tag" style={{ background: 'var(--surface)' }}>Camera: góc nghiêng</span></span>}
          </div>
        )}

        <div className="col" style={{ gap: 10 }}>
          <h1 className="h1">{e.name}</h1>
          <div className="chips">
            <span className={`tag ${DIFF_TONE[e.difficulty]}`}>{DIFFICULTY_LABEL[e.difficulty]}</span>
            <span className="tag">{GEAR_LABEL[e.gear]}</span>
            {e.ai && <span className="tag blue"><Camera size={13} /> Có camera chỉnh dáng</span>}
          </div>
        </div>

        <div className="stat4">
          {[[String(item.sets), 'hiệp'], amount, [`${item.rest}s`, 'nghỉ'], [String(kcal), 'kcal']].map(([v, l]) => (
            <div key={l}><span className="num">{v}</span><span>{l}</span></div>
          ))}
        </div>
        {!inToday && <p className="xs muted" style={{ marginTop: -6 }}>Số hiệp và số lần gợi ý theo mục tiêu và trình độ của bạn.</p>}

        <section className="card">
          <h2 className="h3">Cơ tác động</h2>
          {primary.map((n, i) => (
            <div key={n} className="mbar">
              <span>{n}</span>
              <div className="bar" style={{ height: 10 }}><i style={{ width: `${Math.max(70, 100 - i * 12)}%`, background: PLATE[c] }} /></div>
              <span>chính</span>
            </div>
          ))}
          {secondary.map((n, i) => (
            <div key={n} className="mbar">
              <span>{n}</span>
              <div className="bar" style={{ height: 10 }}><i style={{ width: `${Math.max(25, 50 - i * 8)}%`, background: 'var(--ink-3)' }} /></div>
              <span>phụ</span>
            </div>
          ))}
          <p className="xs muted">Màu là cơ chính, xám là cơ hỗ trợ.</p>
        </section>

        <section className="card">
          <h2 className="h3">Cách làm</h2>
          <ol className="steps">
            {e.cues.map((t, i) => <li key={t}><span className="sn">{i + 1}</span><span>{t}.</span></li>)}
          </ol>
        </section>

        <section className="card">
          <h2 className="h3">Lỗi hay gặp</h2>
          <ul className="warn col" style={{ gap: 10 }}>
            {e.mistakes.map((t) => <li key={t}><TriangleAlert size={18} /><span>{t}</span></li>)}
          </ul>
          {e.ai && <p className="xs muted">Camera AI sẽ nhắc ngay khi bạn mắc các lỗi này.</p>}
        </section>

        {canMark && (
          <button className={`btn ${done ? 'ghost' : 'line'}`} onClick={() => store.setSets(date, e.id, done ? 0 : item.sets, item.amount)}>
            <Check size={18} /> {done ? 'Bỏ đánh dấu đã xong' : 'Đánh dấu đã xong'}
          </button>
        )}

        {alternatives.length > 0 && (
          <>
            <div className="sec"><h2 className="h2">Bài thay thế</h2><span className="xs muted">cùng nhóm cơ</span></div>
            <div className="hscroll">
              {alternatives.map((a) => {
                const ac = MUSCLE[a.group].plate
                return (
                  <Link key={a.id} to={`/exercise/${a.id}`} replace className="col" style={{ width: 140, flexShrink: 0, gap: 8, background: 'var(--surface)', borderRadius: 20, padding: 10 }}>
                    <span className="thumb" style={{ width: '100%', height: 84, background: PLATE_SOFT[ac] }}><Pose name={poseOf(a)} size={84} color={PLATE_INK[ac]} /></span>
                    <b style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{a.name}</b>
                    <span className="xs muted">{GEAR_LABEL[a.gear]} · {DIFFICULTY_LABEL[a.difficulty]}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </Body>

      <ActionBar>
        {e.ai && <Link to={`/coach/${e.id}`} className="btn ghost" style={{ flex: 1 }}><Camera size={18} /> Camera AI</Link>}
        <Link to={`/workout?ex=${e.id}`} className="btn" style={{ flex: 1.3 }}><Play size={18} /> Bắt đầu</Link>
      </ActionBar>
    </Page>
  )
}
