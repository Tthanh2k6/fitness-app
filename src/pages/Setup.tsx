import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronLeft, Dumbbell, House, Minus, Plus } from 'lucide-react'
import Barbell from '../components/Barbell'
import FocusPicker from '../components/FocusPicker'
import { ActionBar, BackButton, Body, Page, PlateMini, Seg, vn } from '../components/ui'
import type { Plate } from '../data/muscles'
import { isoDate, vnd } from '../lib/format'
import {
  equipmentLabel, firstName, GOAL_LABEL, hasWeightGoal, kcalTarget, LEVEL_LABEL, macroTargets, targetEta, useProfile,
  type Goal, type Level, type Place, type Profile,
} from '../profile'

const STEPS = ['Hồ sơ', 'Mục tiêu', 'Vùng tập', 'Trình độ', 'Thời gian', 'Nơi tập', 'Ăn uống']
const HEAD: { title: string; sub: string }[] = [
  { title: 'Giới thiệu về bạn', sub: 'Dùng để tính lượng calo mỗi ngày và gợi ý mức tập phù hợp.' },
  { title: 'Mục tiêu chính của bạn?', sub: 'FitCoach dùng mục tiêu để chọn bài tập và tính calo mỗi ngày. Đổi lại lúc nào cũng được.' },
  { title: 'Muốn tập chỗ nào?', sub: 'Lịch tập ưu tiên bài cho vùng bạn chọn. Chưa rõ thì bấm Chọn tất cả để tập đều toàn thân.' },
  { title: 'Bạn đang ở mức nào?', sub: 'Trình độ quyết định số hiệp, số lần và độ khó của bài.' },
  { title: 'Mỗi ngày rảnh bao lâu?', sub: 'Mỗi buổi vừa đúng thời gian này, gồm cả khởi động và giãn cơ.' },
  { title: 'Bạn tập ở đâu?', sub: 'Lịch tập chỉ chọn bài dùng được với dụng cụ bạn có.' },
  { title: 'Tiền ăn mỗi ngày', sub: 'Gợi ý món ăn sẽ nằm trong mức này.' },
]

const GOALS: { v: Goal; plate: Plate; desc: string }[] = [
  { v: 'lose', plate: 'red', desc: 'Đốt mỡ, giữ cơ. Ăn thiếu khoảng 400 kcal mỗi ngày.' },
  { v: 'muscle', plate: 'blue', desc: 'Tập nặng dần mỗi tuần, ăn đủ đạm.' },
  { v: 'gain', plate: 'yellow', desc: 'Ăn dư calo, tập sức mạnh để lên cân săn chắc.' },
  { v: 'health', plate: 'green', desc: 'Vận động đều, ngủ ngon, không áp lực cân nặng.' },
]
const LEVELS: { v: Level; desc: string }[] = [
  { v: 'beginner', desc: 'Chưa từng tập hoặc đã nghỉ trên 3 tháng' },
  { v: 'basic', desc: 'Tập dưới 6 tháng, đang làm quen kỹ thuật' },
  { v: 'intermediate', desc: 'Tập đều 6 tháng đến 2 năm' },
  { v: 'advanced', desc: 'Tập đều trên 2 năm, quen tập nặng' },
]
const PLACES: { v: Place; label: string; desc: string; Icon: typeof House; tone: Plate }[] = [
  { v: 'home', label: 'Ở nhà', desc: 'Tự chọn dụng cụ đang có', Icon: House, tone: 'green' },
  { v: 'gym', label: 'Phòng gym', desc: 'Có đủ máy và tạ', Icon: Dumbbell, tone: 'blue' },
]
const HOME_EQUIPMENT = [
  { v: 'Thảm', desc: 'Cho bài nằm, plank, giãn cơ' },
  { v: 'Tạ đơn', desc: 'Tạ tay, bình nước cũng được' },
  { v: 'Dây kháng lực', desc: 'Dây chun tập tay, chân, mông' },
  { v: 'Xà đơn', desc: 'Xà treo cửa, kéo xà, treo người' },
]
const BUDGETS = [60000, 100000, 150000, 200000]

const half = (n: number) => Math.round(n * 2) / 2
const dmy = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`

/** Cân nặng mong muốn hợp với mục tiêu: giảm cân thì nhẹ hơn, tăng cân/tăng cơ thì nặng hơn */
function targetFor(goal: Goal, p: Profile) {
  if (goal === 'health') return p.weightKg
  if (goal === 'lose') return p.targetKg < p.weightKg ? p.targetKg : Math.max(35, half(p.weightKg - 4))
  return p.targetKg > p.weightKg ? p.targetKg : half(p.weightKg + 3)
}

export default function Setup() {
  const [params] = useSearchParams()
  const fromProfile = params.get('from') === 'profile'
  const [step, setStep] = useState(() => Math.min(STEPS.length - 1, Math.max(0, Number(params.get('step')) || 0)))
  const { profile: p, update } = useProfile()
  const nav = useNavigate()

  if (step === STEPS.length) return <Ready onBack={() => setStep(STEPS.length - 1)} />

  const last = step === STEPS.length - 1
  // Rời bước hồ sơ: chỉnh cân nặng mong muốn cho khớp mục tiêu nếu cân nặng vừa đổi
  const forward = () => {
    if (step === 0) update({ targetKg: targetFor(p.goal, p) })
    setStep(step + 1)
  }
  const next = () => (fromProfile ? nav('/profile') : forward())
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  return (
    <Page>
      <Body gap={18}>
        <div className="row">
          {fromProfile ? <BackButton to="/profile" /> : step === 0 ? <BackButton to="/auth" /> : (
            <button className="icon-btn" onClick={() => setStep(step - 1)} aria-label="Bước trước"><ChevronLeft size={22} /></button>
          )}
          <div className="grow col" style={{ gap: 8 }}>
            <div className="progress7">{STEPS.map((s, i) => <i key={s} className={i <= step ? 'on' : ''} />)}</div>
            <span className="lbl">Bước {step + 1}/{STEPS.length} · {STEPS[step]}</span>
          </div>
          {!fromProfile && <button className="link" onClick={forward}>Bỏ qua</button>}
        </div>

        <div key={step} className="step-in col" style={{ gap: 18 }}>
          <div className="col" style={{ gap: 8 }}>
            <h1 className="h1">{HEAD[step].title}</h1>
            <p className="muted">{HEAD[step].sub}</p>
          </div>

          {step === 0 && (
            <div className="col" style={{ gap: 10 }}>
              <label className="field">
                <span>Họ và tên</span>
                <input value={p.name} onChange={(e) => update({ name: e.target.value })} autoComplete="name" placeholder="Nhập họ và tên"
                  className="placeholder:font-normal placeholder:text-ink-3" />
              </label>
              <Seg options={[{ v: 'female', label: 'Nữ' }, { v: 'male', label: 'Nam' }]} value={p.sex} onChange={(v) => update({ sex: v })} />
              <div className="grid grid-cols-3 gap-2">
                <NumField label="Tuổi" unit="tuổi" value={p.age} onChange={(v) => update({ age: v })} />
                <NumField label="Chiều cao" unit="cm" value={p.heightCm} onChange={(v) => update({ heightCm: v })} />
                <NumField label="Cân nặng" unit="kg" decimal value={p.weightKg} onChange={(v) => update({ weightKg: v })} />
              </div>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="col" style={{ gap: 10 }} role="radiogroup">
                {GOALS.map((g) => {
                  const on = p.goal === g.v
                  return (
                    <button key={g.v} className={`opt ${on ? 'on' : ''}`} role="radio" aria-checked={on}
                      onClick={() => update({ goal: g.v, targetKg: targetFor(g.v, p) })}>
                      <PlateMini c={g.plate} h={40} />
                      <span className="grow col" style={{ gap: 2 }}><b className="h3">{GOAL_LABEL[g.v]}</b><span className="small muted">{g.desc}</span></span>
                      <span className="radio">{on && <Check size={14} strokeWidth={3} />}</span>
                    </button>
                  )
                })}
              </div>
              {p.goal !== 'health' && <TargetCard />}
            </>
          )}

          {step === 2 && <FocusPicker value={p.focus} onChange={(v) => update({ focus: v })} />}

          {step === 3 && (
            <div className="col" style={{ gap: 10 }} role="radiogroup">
              {LEVELS.map((l, i) => {
                const on = p.level === l.v
                return (
                  <button key={l.v} className={`opt ${on ? 'on' : ''}`} role="radio" aria-checked={on} onClick={() => update({ level: l.v })}>
                    <span className="flex items-end" style={{ gap: 3, height: 40 }} aria-hidden>
                      {[0, 1, 2, 3].map((b) => (
                        <span key={b} style={{ width: 6, height: 10 + b * 10, borderRadius: 3, background: b <= i ? 'var(--ink)' : 'var(--line)' }} />
                      ))}
                    </span>
                    <span className="grow col" style={{ gap: 2 }}><b className="h3">{LEVEL_LABEL[l.v]}</b><span className="small muted">{l.desc}</span></span>
                    <span className="radio">{on && <Check size={14} strokeWidth={3} />}</span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 4 && (
            <>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((m) => (
                  <button key={m} className={`opt ${p.minutes === m ? 'on' : ''}`} aria-pressed={p.minutes === m} onClick={() => update({ minutes: m })}
                    style={{ flexDirection: 'column', gap: 4, padding: '16px 0', alignItems: 'center' }}>
                    <span className="num" style={{ fontSize: 30 }}>{m}</span>
                    <span className="xs muted">phút</span>
                  </button>
                ))}
              </div>
              <div className="col" style={{ gap: 8 }}>
                <p className="lbl">Số buổi mỗi tuần</p>
                <Seg options={[2, 3, 4, 5, 6].map((d) => ({ v: d, label: <span className="num" style={{ fontSize: 18 }}>{d}</span> }))} value={p.days} onChange={(d) => update({ days: d })} />
              </div>
              <p className="small" style={{ background: 'var(--surface-2)', borderRadius: 16, padding: '12px 14px' }}>
                Khoảng <b>{p.minutes * p.days} phút</b> mỗi tuần, chia thành {p.days} buổi. Lịch tập xếp ngày nghỉ xen kẽ, Chủ nhật luôn nghỉ.
              </p>
            </>
          )}

          {step === 5 && (
            <>
              <div className="grid2">
                {PLACES.map((pl) => {
                  const on = p.place === pl.v
                  return (
                    <button key={pl.v} className={`opt ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => update({ place: pl.v })}
                      style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, padding: '18px 12px' }}>
                      <span className="ch-ic" style={{ width: 48, height: 48, background: `var(--${pl.tone}-soft)`, color: `var(--${pl.tone}-ink)` }}><pl.Icon size={24} /></span>
                      <b className="h3">{pl.label}</b>
                      <span className="xs muted">{pl.desc}</span>
                    </button>
                  )
                })}
              </div>
              {p.place === 'home' ? (
                <div key="home" className="step-in col" style={{ gap: 8 }}>
                  <p className="lbl">Dụng cụ có sẵn ở nhà (chọn nhiều)</p>
                  {HOME_EQUIPMENT.map((e) => {
                    const on = p.equipment.includes(e.v)
                    return (
                      <button key={e.v} className={`opt ${on ? 'on' : ''}`} aria-pressed={on} style={{ padding: '12px 14px' }}
                        onClick={() => update({ equipment: toggle(p.equipment, e.v) })}>
                        <span className="grow col"><b style={{ fontWeight: 600 }}>{e.v}</b><span className="xs muted">{e.desc}</span></span>
                        <span className="radio" style={{ borderRadius: 8 }}>{on && <Check size={14} strokeWidth={3} />}</span>
                      </button>
                    )
                  })}
                  <p className="small muted">
                    {p.equipment.length ? `Lịch tập dùng: ${p.equipment.join(', ').toLowerCase()} và trọng lượng cơ thể.` : 'Không chọn gì: chỉ tập với trọng lượng cơ thể.'}
                  </p>
                </div>
              ) : (
                <p key="gym" className="step-in small" style={{ background: 'var(--surface-2)', borderRadius: 16, padding: '12px 14px' }}>
                  Phòng gym có đủ máy tập, tạ đơn, tạ đòn và xà. Lịch tập sẽ dùng cả máy tập để bài đa dạng hơn.
                </p>
              )}
            </>
          )}

          {step === 6 && (
            <>
              <div className="grid2" style={{ gap: 8 }}>
                {BUDGETS.map((b) => (
                  <button key={b} className={`opt ${p.budget === b ? 'on' : ''}`} aria-pressed={p.budget === b} onClick={() => update({ budget: b })}
                    style={{ flexDirection: 'column', gap: 6, alignItems: 'center', textAlign: 'center', padding: '16px 8px' }}>
                    <span className="num" style={{ fontSize: 26 }}>{vnd(b)}</span>
                    <span className="xs muted">~{vnd(b / 3)} mỗi bữa</span>
                  </button>
                ))}
              </div>
              <NumField label="Hoặc nhập số khác" unit="đồng" value={p.budget} onChange={(v) => update({ budget: v })} />
            </>
          )}
        </div>
      </Body>
      <ActionBar>
        <button className="btn wide" onClick={next}>
          {fromProfile ? 'Lưu' : last ? 'Tạo lịch tập của tôi' : 'Tiếp tục'}
          {!fromProfile && last && <ArrowRight size={18} />}
        </button>
      </ActionBar>
    </Page>
  )
}

/** Cân nặng mong muốn: bước 0,5 kg, kèm ngày dự kiến đạt theo tốc độ an toàn */
function TargetCard() {
  const { profile: p, update } = useProfile()
  const lo = p.goal === 'lose' ? Math.max(35, half(p.weightKg - 30)) : p.goal === 'gain' ? half(p.weightKg) + 0.5 : Math.max(35, half(p.weightKg - 15))
  const hi = p.goal === 'lose' ? half(p.weightKg) - 0.5 : half(p.weightKg + 30)
  const set = (d: number) => update({ targetKg: Math.min(hi, Math.max(lo, half(p.targetKg) + d)) })
  const eta = targetEta(p)
  const down = p.targetKg < p.weightKg
  return (
    <div className="card tight">
      <div className="row between">
        <span className="h3">Cân nặng<br />mong muốn</span>
        <div className="stepper">
          <button onClick={() => set(-0.5)} disabled={p.targetKg <= lo} aria-label="Giảm 0,5 kg"><Minus size={18} /></button>
          <span className="num" style={{ fontSize: 30, minWidth: 74, textAlign: 'center' }}>
            {vn(p.targetKg, 1)}<small style={{ fontSize: 16, color: 'var(--ink-2)' }}> kg</small>
          </span>
          <button onClick={() => set(0.5)} disabled={p.targetKg >= hi} aria-label="Tăng 0,5 kg"><Plus size={18} /></button>
        </div>
      </div>
      <p className="small muted">
        Hiện tại {vn(p.weightKg, 1)} kg.{' '}
        {hasWeightGoal(p) && eta
          ? `${down ? 'Giảm 0,5' : 'Tăng 0,25'} kg mỗi tuần là an toàn, dự kiến đạt vào ${dmy(eta.date)}.`
          : 'Giữ cân hiện tại, tập để cơ săn chắc hơn.'}
      </p>
    </div>
  )
}

/** Ô nhập số: giữ chuỗi đang gõ để nhập được số thập phân như 61,4 */
function NumField({ label, unit, value, onChange, decimal = false }: { label: string; unit: string; value: number; onChange: (v: number) => void; decimal?: boolean }) {
  const show = (n: number) => (n ? n.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '')
  const [draft, setDraft] = useState(() => show(value))
  return (
    <label className="field">
      <span>{label}</span>
      <span className="flex items-baseline gap-1">
        <input value={draft} inputMode={decimal ? 'decimal' : 'numeric'} aria-label={label} className="num" style={{ fontSize: 24, color: 'var(--ink)' }}
          onChange={(e) => {
            const raw = decimal ? e.target.value.replace(/[^\d,.]/g, '') : e.target.value.replace(/\D/g, '')
            const n = decimal ? Number(raw.replace(/\./g, ',').replace(',', '.')) : Number(raw)
            setDraft(decimal ? raw : n ? n.toLocaleString('vi-VN') : '')
            if (!Number.isNaN(n)) onChange(decimal ? Math.round(n * 10) / 10 : n)
          }}
          onBlur={() => setDraft(show(value))} />
        <span className="xs muted shrink-0">{unit}</span>
      </span>
    </label>
  )
}

function Ready({ onBack }: { onBack: () => void }) {
  const { profile: p, update } = useProfile()
  const nav = useNavigate()
  const eta = targetEta(p)
  const name = firstName(p.name)
  const macros = macroTargets(p)
  const stats: [string, string][] = [
    [vn(kcalTarget(p)), 'kcal mỗi ngày'],
    [String(p.days), 'buổi mỗi tuần'],
    [String(p.minutes), 'phút mỗi buổi'],
    [`${macros.protein} g`, 'đạm mỗi ngày'],
  ]
  const start = () => {
    update({
      onboarded: true,
      joinedAt: p.joinedAt || isoDate(new Date()),
      // Người mới: lấy cân nặng lúc thiết lập làm mốc để tính đã giảm/tăng bao nhiêu
      ...(p.onboarded ? null : { startKg: p.weightKg }),
    })
    nav('/home')
  }
  return (
    <Page cam>
      <Body gap={18}>
        <div className="row"><button className="icon-btn" onClick={onBack} aria-label="Quay lại"><ChevronLeft size={22} /></button></div>
        <div className="step-in col" style={{ alignItems: 'center', gap: 6, textAlign: 'center' }}>
          <Barbell plates={(['red', 'blue', 'yellow', 'green'] as Plate[]).map((c) => ({ c, pct: 1 }))} w={300} h={140} pw={30} gap={6} ph={130} anim shaft="var(--cam-ink-2)" />
          <p className="lbl" style={{ color: 'var(--cam-ink-2)', marginTop: 10 }}>{name ? `${name} ơi, lịch tập đã sẵn sàng` : 'Lịch tập đã sẵn sàng'}</p>
          <h1 className="h1" style={{ fontSize: 36 }}>{GOAL_LABEL[p.goal]}</h1>
          <p style={{ color: '#FFC34A', fontWeight: 600 }}>
            {hasWeightGoal(p) && eta ? `Mục tiêu ${vn(p.targetKg, 1)} kg · dự kiến ${dmy(eta.date)}` : 'Vận động đều mỗi tuần'}
          </p>
        </div>
        <div className="grid2">
          {stats.map(([v, l]) => (
            <div key={l} style={{ background: 'var(--cam-2)', borderRadius: 20, padding: 14 }}>
              <span className="num" style={{ fontSize: 34 }}>{v}</span>
              <p className="small" style={{ color: 'var(--cam-ink-2)' }}>{l}</p>
            </div>
          ))}
        </div>
        <ul className="col" style={{ gap: 10 }}>
          {[
            `Trình độ: ${LEVEL_LABEL[p.level].toLowerCase()}`,
            equipmentLabel(p),
            'Mỗi buổi có khởi động trước và giãn cơ sau khi tập',
            `Món ăn gợi ý trong khoảng ${vnd(p.budget)} mỗi ngày`,
          ].map((t) => (
            <li key={t} className="row" style={{ alignItems: 'flex-start', gap: 10, fontSize: 15 }}>
              <span className="grid shrink-0 place-items-center rounded-full" style={{ width: 22, height: 22, background: 'var(--green)', color: '#fff', marginTop: 1 }}>
                <Check size={13} strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </Body>
      <ActionBar>
        <button className="btn wide" style={{ background: 'var(--cam-ink)', color: '#14161A' }} onClick={start}>Bắt đầu tập <ArrowRight size={18} /></button>
      </ActionBar>
    </Page>
  )
}
