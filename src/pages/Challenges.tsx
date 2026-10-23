import { useState } from 'react'
import { Check, Footprints, Leaf, Moon, Timer, Users, type LucideIcon } from 'lucide-react'
import { Body, Page, Sheet, TitleBar, useToast, vn } from '../components/ui'
import { PLATE, type Plate } from '../data/muscles'
import { averageSteps, badges, challengeById, challengeProgress, CHALLENGES, type ChallengeIcon } from '../logic/challenges'
import { useToday } from '../logic/useToday'
import { initials } from '../profile'

const ICON: Record<ChallengeIcon, LucideIcon> = { footprints: Footprints, timer: Timer, moon: Moon, leaf: Leaf }

// Bạn bè mẫu chỉ hiện khi đang dùng dữ liệu trình diễn (Hồ sơ → Nạp dữ liệu mẫu)
const DEMO_FRIENDS: { name: string; av: string; tone: Plate; steps: number; days: number }[] = [
  { name: 'Hoàng Long', av: 'HL', tone: 'blue', steps: 9420, days: 12 },
  { name: 'Thu Trang', av: 'TT', tone: 'green', steps: 7980, days: 9 },
  { name: 'Quốc Bảo', av: 'QB', tone: 'red', steps: 6105, days: 6 },
]

async function invite(toast: (m: string) => void) {
  const url = window.location.origin
  const text = 'Tập cùng mình trên FitCoach nhé: lịch tập riêng, camera chỉnh dáng, gợi ý món ăn theo ngân sách.'
  try {
    if (navigator.share) return await navigator.share({ title: 'FitCoach', text, url })
    await navigator.clipboard.writeText(`${text} ${url}`)
    toast('Đã chép lời mời, gửi cho bạn bè nhé')
  } catch {
    // người dùng huỷ chia sẻ
  }
}

export default function Challenges() {
  const { profile, store, now, date, log, week } = useToday()
  const { logs } = store
  const toast = useToast()
  const joined = Object.entries(logs.challenges).filter(([id]) => challengeById(id)).sort((a, b) => a[1].localeCompare(b[1]))
  const [sel, setSel] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<string | null>(null)
  const heroId = sel && logs.challenges[sel] ? sel : joined[0]?.[0]
  const hero = heroId ? challengeById(heroId)! : null
  const prog = heroId ? challengeProgress(heroId, logs.challenges[heroId], logs, now) : null
  const list = badges(logs, profile, week, now)
  const earned = list.filter((b) => b.earned).length

  const toggleCheck = (id: string) => {
    const checks = log?.checks ?? []
    store.patchDay(date, { checks: checks.includes(id) ? checks.filter((x) => x !== id) : [...checks, id] })
  }

  // Bảng xếp hạng: bạn + bạn bè mẫu (chỉ khi dữ liệu trình diễn)
  const steps = hero?.id === 'steps-8000'
  const me = { name: 'Bạn', av: initials(profile.name) || 'B', tone: 'yellow' as Plate, value: heroId ? (steps ? averageSteps(logs.challenges[heroId], logs, now) : prog!.done) : 0, me: true }
  const board = [me, ...(logs.demo ? DEMO_FRIENDS.map((f) => ({ name: `${f.name} (mẫu)`, av: f.av, tone: f.tone, value: steps ? f.steps : Math.min(f.days, prog?.dayNo ?? f.days), me: false })) : [])]
    .sort((a, b) => b.value - a.value)
  const rank = board.findIndex((x) => x.me) + 1
  const cols = prog ? Math.ceil(prog.total / Math.ceil(prog.total / 15)) : 15

  return (
    <Page>
      <Body>
        <TitleBar title="Thử thách" right={<button className="icon-btn" aria-label="Mời bạn bè" onClick={() => void invite(toast)}><Users size={20} /></button>} />

        {hero && prog ? (
          <section className="card hero">
            <div className="row between">
              <p className="lbl">{prog.finished ? `Đã kết thúc · ${prog.total} ngày` : `Đang tham gia · Ngày ${prog.dayNo}/${prog.total}`}</p>
              <span className="tag on-hero"><Users size={13} /> {board.length} người</span>
            </div>
            <div className="col" style={{ gap: 4 }}>
              <h2 className="h1" style={{ fontSize: 28 }}>{hero.title}</h2>
              <p className="small muted">{prog.finished ? `Đạt ${prog.done}/${prog.total} ngày` : `Còn ${prog.daysLeft} ngày · ${prog.todayText}`}</p>
            </div>
            <div className="pips" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-label={`Đã đạt ${prog.done} trên ${prog.total} ngày`}>
              {prog.statuses.map((s, i) => <i key={i} className={s === 'achieved' ? 'on' : s === 'today' ? 'now' : ''} style={s === 'missed' ? { background: 'var(--red)', opacity: 0.4 } : undefined} />)}
            </div>
            {hero.manual && !prog.finished && (
              <button className={`btn sm ${prog.todayDone ? 'on-dark' : 'light'}`} onClick={() => toggleCheck(hero.id)}>
                {prog.todayDone ? <><Check size={16} /> Hôm nay đã giữ được</> : 'Đánh dấu hôm nay'}
              </button>
            )}
            <div className="row between">
              <span className="small muted">{prog.done} ngày đạt, {prog.missed ? `lỡ ${prog.missed} ngày` : 'chưa lỡ ngày nào'}</span>
              <span className="num" style={{ fontSize: 26 }}>{board.length > 1 ? `Hạng ${rank}` : `${prog.done}/${prog.total}`}</span>
            </div>
            <button className="link" style={{ alignSelf: 'flex-start', fontSize: 13 }} onClick={() => setLeaving(hero.id)}>Rời thử thách</button>
          </section>
        ) : (
          <section className="card hero">
            <p className="lbl">Thử thách</p>
            <h2 className="h1" style={{ fontSize: 26 }}>Chọn một thử thách để bắt đầu</h2>
            <p className="small muted">Mỗi ngày đạt mục tiêu sẽ tô xanh một ô. Giữ đủ chuỗi để nhận huy hiệu.</p>
          </section>
        )}

        {hero && (
          <section className="list-card" style={{ padding: '4px 16px' }}>
            {board.map((x, i) => (
              <div key={x.name} className={`rank ${x.me && board.length > 1 ? 'me' : ''}`}>
                <span className="rn">{i + 1}</span>
                <span className="av-sm" style={{ background: PLATE[x.tone] }}>{x.av}</span>
                <span className="grow col"><b style={{ fontWeight: 600 }}>{x.name}</b><span className="xs muted">{steps ? 'bước trung bình/ngày' : 'ngày đạt'}</span></span>
                <span className="num" style={{ fontSize: 22 }}>{vn(x.value)}</span>
              </div>
            ))}
            {!logs.demo && (
              <div className="rank" style={{ alignItems: 'center' }}>
                <span className="xs muted grow">Bảng xếp hạng với bạn bè cần tài khoản trực tuyến — sắp có. Mời bạn bè cùng tập:</span>
                <button className="mini-btn plain" onClick={() => void invite(toast)}><Users size={14} /> Mời</button>
              </div>
            )}
          </section>
        )}

        <div className="sec"><h2 className="h2">Huy hiệu</h2><span className="xs muted">{earned} đã đạt</span></div>
        <div className="badges">
          {list.map((b) => (
            <div key={b.id} className={`badge ${b.earned ? '' : 'lock'}`}>
              <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r="26" fill={b.earned ? PLATE[b.tone] : 'var(--surface-2)'} />
                <circle cx="28" cy="28" r="18" fill="none" stroke={b.earned ? '#FFFFFF' : 'var(--line)'} strokeOpacity={b.earned ? 0.35 : 1} strokeWidth="2" />
                <circle cx="28" cy="28" r="6.5" fill={b.earned ? '#14161A' : 'var(--line)'} fillOpacity={b.earned ? 0.55 : 1} />
                <circle cx="28" cy="28" r="3" fill={b.earned ? '#FFFFFF' : 'var(--surface)'} />
              </svg>
              {b.title}
              {!b.earned && <span className="xs" style={{ fontWeight: 500, marginTop: -4 }}>{b.progress}</span>}
            </div>
          ))}
        </div>

        <div className="sec"><h2 className="h2">{joined.length ? 'Tham gia thêm' : 'Chọn thử thách'}</h2></div>
        <div className="col" style={{ gap: 8 }}>
          {CHALLENGES.filter((c) => c.id !== heroId).map((c) => {
            const Icon = ICON[c.icon]
            const since = logs.challenges[c.id]
            const p = since ? challengeProgress(c.id, since, logs, now) : null
            return (
              <div key={c.id} className="ch-card">
                <button className="ch-ic" style={{ background: `var(--${c.tone}-soft)`, color: `var(--${c.tone}-ink)` }}
                  onClick={() => since && setSel(c.id)} aria-label={since ? `Xem ${c.title}` : c.title} disabled={!since}>
                  <Icon size={22} />
                </button>
                <span className="grow col" style={{ gap: 2 }}>
                  <b style={{ fontWeight: 600 }}>{c.title}</b>
                  <span className="xs muted">{c.days} ngày · {c.desc}</span>
                  {p && <span className="xs" style={{ color: 'var(--green-ink)', fontWeight: 600 }}>Đang tham gia · {p.done}/{p.total} ngày đạt</span>}
                </span>
                {since ? (
                  <button className="mini-btn plain" onClick={() => setLeaving(c.id)}>Rời</button>
                ) : (
                  <button className="mini-btn solid" onClick={() => {
                    store.joinChallenge(c.id, date)
                    setSel(c.id)
                    toast(`Đã tham gia “${c.title}”`)
                  }}>Tham gia</button>
                )}
              </div>
            )
          })}
        </div>
      </Body>

      <Sheet open={leaving !== null} onClose={() => setLeaving(null)} title={`Rời “${leaving ? challengeById(leaving)?.title : ''}”?`}>
        <p className="small muted" style={{ padding: '0 4px' }}>Tiến độ của thử thách này sẽ không còn hiện ở đây. Nhật ký bước chân, giấc ngủ, bài tập vẫn được giữ.</p>
        <div className="row">
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => setLeaving(null)}>Ở lại</button>
          <button className="btn" style={{ flex: 1 }} onClick={() => {
            if (leaving) store.leaveChallenge(leaving)
            if (leaving === sel) setSel(null)
            setLeaving(null)
            toast('Đã rời thử thách')
          }}>Rời thử thách</button>
        </div>
      </Sheet>
    </Page>
  )
}
