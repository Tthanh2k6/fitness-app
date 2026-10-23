import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell, CalendarDays, ChevronRight, Crown, Database, Dumbbell, HeartPulse, LogOut, Moon, Settings, ShieldCheck, Sun,
  Target, Trash2, Trophy, Volume2, Wallet, Watch, Activity, Crosshair,
} from 'lucide-react'
import { Body, Page, Seg, Sheet, TitleBar, Toggle, useToast, vn } from '../components/ui'
import { useVietnameseVoice } from '../ai/speech'
import { vnd, WEEKDAY_SHORT } from '../lib/format'
import { challengeById } from '../logic/challenges'
import { makeDemoLogs } from '../logic/demo'
import { readiness } from '../logic/health'
import { useToday } from '../logic/useToday'
import { bmi, GOAL_LABEL, hasWeightGoal, initials, LEVEL_LABEL, useProfile, type Goal, type Profile as P } from '../profile'
import { useTheme, type ThemeChoice } from '../theme'

const GOAL_TONE: Record<Goal, string> = { lose: 'red', muscle: 'blue', gain: 'yellow', health: 'green' }

// Nhãn vùng tập theo nhóm trong bước "Vùng tập" của phần thiết lập
const FOCUS_GROUPS: [string, string[]][] = [
  ['Ngực', ['chest']], ['Lưng', ['upper-back', 'lower-back', 'trapezius']], ['Vai', ['front-deltoids', 'back-deltoids']],
  ['Tay', ['biceps', 'triceps', 'forearm']], ['Bụng', ['abs', 'obliques']], ['Mông', ['gluteal', 'abductors']],
  ['Chân', ['quadriceps', 'hamstring', 'adductor', 'calves']],
]

const kg1 = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 })

function focusLabel(p: P) {
  const names = FOCUS_GROUPS.filter(([, ms]) => ms.some((m) => (p.focus as string[]).includes(m))).map(([n]) => n)
  return names.length === 0 || names.length === FOCUS_GROUPS.length ? 'Toàn thân' : names.join(', ')
}

function Row({ icon, title, value, to, sub }: { icon: ReactNode; title: string; value?: string; to: string; sub?: string }) {
  return (
    <Link to={to} className="lrow">
      <span className="li">{icon}</span>
      <span className="grow col" style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 600 }}>{title}</span>
        {sub && <span className="xs muted">{sub}</span>}
      </span>
      {value && <span className="v" style={{ maxWidth: '48%' }}>{value}</span>}
      <ChevronRight size={18} className="chev" />
    </Link>
  )
}

export default function Profile() {
  const { update } = useProfile()
  const { profile: p, store, week, now, session } = useToday()
  const { logs } = store
  const nav = useNavigate()
  const toast = useToast()
  const voice = useVietnameseVoice()
  const theme = useTheme()
  const [sheet, setSheet] = useState<null | 'info' | 'remind' | 'privacy' | 'demo' | 'reset' | 'logout'>(null)
  const close = () => setSheet(null)

  const since = p.joinedAt ? `Tập cùng FitCoach từ tháng ${Number(p.joinedAt.slice(5, 7))}/${p.joinedAt.slice(0, 4)}` : 'Chưa bắt đầu kế hoạch'
  const days = week.map((s, i) => (s ? WEEKDAY_SHORT[i] : null)).filter(Boolean).join(', ')
  const score = readiness(logs, now, session).score
  const joined = Object.keys(logs.challenges).filter((id) => challengeById(id)).length
  const place = p.place === 'gym' ? 'Phòng gym' : `Ở nhà · ${p.equipment.length ? p.equipment.join(', ').toLowerCase() : 'không dụng cụ'}`
  const setup = (step: number) => `/setup?step=${step}&from=profile`

  const toggleRemind = async (on: boolean) => {
    update({ remind: on })
    if (on && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch {
        // trình duyệt không hỗ trợ hỏi quyền
      }
    }
    toast(on ? `FitCoach sẽ nhắc lúc ${p.remindAt} vào ngày có lịch tập` : 'Đã tắt nhắc giờ tập')
  }

  const loadDemo = () => {
    const demo = makeDemoLogs(p, now)
    store.replaceAll(demo.logs)
    update({ startKg: demo.startKg, joinedAt: p.joinedAt && p.joinedAt < demo.logs.weights[0].date ? p.joinedAt : demo.logs.weights[0].date })
    close()
    toast('Đã nạp dữ liệu mẫu 7 tuần')
  }

  return (
    <Page>
      <Body>
        <TitleBar title="Hồ sơ" back="/home" right={<button className="icon-btn" aria-label="Sửa thông tin cá nhân" onClick={() => setSheet('info')}><Settings size={20} /></button>} />

        <div className="prof">
          <span className="avatar">{initials(p.name) || 'FC'}</span>
          <h2 className="h2" style={{ fontSize: 22 }}>{p.name || 'Bạn chưa nhập tên'}</h2>
          <p className="small muted">{since}</p>
          <div className="chips" style={{ justifyContent: 'center' }}>
            <span className={`tag ${GOAL_TONE[p.goal]}`}>{GOAL_LABEL[p.goal]}</span>
            <span className="tag">{LEVEL_LABEL[p.level]}</span>
            <span className="tag">{p.place === 'gym' ? 'Tập ở phòng gym' : 'Tập ở nhà'}</span>
          </div>
        </div>

        <div className="stat-row">
          {[[vn(p.heightCm), 'cm'], [kg1(p.weightKg), 'kg'], [vn(p.age), 'tuổi'], [vn(bmi(p), 1), 'BMI']].map(([v, l]) => (
            <div key={l}><span className="num">{v}</span><span>{l}</span></div>
          ))}
        </div>

        <section className="card hero" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <span className="ch-ic" style={{ background: 'var(--yellow)', color: '#14161A' }}><Crown size={24} /></span>
          <div className="grow col" style={{ gap: 3 }}>
            <b className="h3">FitCoach Pro</b>
            <span className="xs muted">HLV thật duyệt lịch tập, thực đơn cả tuần, không quảng cáo</span>
          </div>
          <button className="btn sm light" style={{ height: 38, padding: '0 14px' }} onClick={() => toast('Gói Pro đang chuẩn bị, FitCoach sẽ báo khi mở')}>Dùng thử</button>
        </section>

        <p className="lbl" style={{ margin: '6px 0 -4px 4px' }}>Kế hoạch</p>
        <section className="list-card">
          <Row icon={<Target size={18} />} title="Mục tiêu" to={setup(1)} value={`${GOAL_LABEL[p.goal]}${hasWeightGoal(p) ? ` · ${kg1(p.targetKg)} kg` : ''}`} />
          <Row icon={<Crosshair size={18} />} title="Vùng tập trung" to={setup(2)} value={focusLabel(p)} />
          <Row icon={<Activity size={18} />} title="Trình độ" to={setup(3)} value={LEVEL_LABEL[p.level]} />
          <Row icon={<CalendarDays size={18} />} title="Lịch tập" to={setup(4)} value={`${p.days} buổi/tuần · ${p.minutes} phút`} />
          <Row icon={<Dumbbell size={18} />} title="Nơi tập, dụng cụ" to={setup(5)} value={place} />
          <Row icon={<Wallet size={18} />} title="Tiền ăn mỗi ngày" to={setup(6)} value={vnd(p.budget)} />
        </section>

        <p className="lbl" style={{ margin: '6px 0 -4px 4px' }}>Sức khỏe</p>
        <section className="list-card">
          <Row icon={<HeartPulse size={18} />} title="Sức khỏe" to="/health" value={`Sẵn sàng ${score}`} />
          <Row icon={<Trophy size={18} />} title="Thử thách" to="/challenges" value={joined ? `${joined} đang tham gia` : 'Chưa tham gia'} />
          <Row icon={<Watch size={18} />} title="Thiết bị" to="/health#devices" value="Chưa kết nối" />
        </section>

        <p className="lbl" style={{ margin: '6px 0 -4px 4px' }}>Ứng dụng</p>
        <section className="list-card">
          <div className="lrow">
            <span className="li"><Bell size={18} /></span>
            <span className="grow col">
              <b style={{ fontWeight: 600 }}>Nhắc giờ tập</b>
              <button className="xs muted" style={{ textAlign: 'left' }} onClick={() => setSheet('remind')} aria-label={`Đổi giờ nhắc, đang là ${p.remindAt}`}>
                <u style={{ textUnderlineOffset: 2 }}>{p.remindAt}</u> · {days || 'chưa có lịch'}
              </button>
            </span>
            <Toggle on={p.remind} onChange={(v) => void toggleRemind(v)} label="Nhắc giờ tập" />
          </div>
          <div className="lrow">
            <span className="li"><Volume2 size={18} /></span>
            <span className="grow col">
              <b style={{ fontWeight: 600 }}>Giọng đọc hướng dẫn</b>
              <span className="xs muted">{voice.available ? 'Tiếng Việt, đọc số lần và lời nhắc' : 'Máy chưa có giọng tiếng Việt'}</span>
            </span>
            {voice.available ? <Toggle on={voice.on} onChange={() => voice.toggle()} label="Giọng đọc hướng dẫn" /> : <span className="tag">Không có</span>}
          </div>
          <div className="lrow">
            <span className="li">{theme.dark ? <Moon size={18} /> : <Sun size={18} />}</span>
            <span className="grow" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Giao diện</span>
            <Seg<ThemeChoice> small className="[&>button]:px-2.5" style={{ background: 'var(--surface-2)', padding: 3, flexShrink: 0 }} value={theme.choice} onChange={theme.set}
              options={[{ v: 'light', label: 'Sáng' }, { v: 'dark', label: 'Tối' }, { v: 'auto', label: 'Tự động' }]} />
          </div>
          <button className="lrow" onClick={() => setSheet('privacy')}>
            <span className="li"><ShieldCheck size={18} /></span>
            <span className="grow col"><b style={{ fontWeight: 600 }}>Quyền riêng tư</b><span className="xs muted">Camera và ảnh món ăn xử lý trên máy</span></span>
            <ChevronRight size={18} className="chev" />
          </button>
        </section>

        <p className="lbl" style={{ margin: '6px 0 -4px 4px' }}>Dữ liệu</p>
        <section className="list-card">
          <button className="lrow" onClick={() => setSheet('demo')}>
            <span className="li"><Database size={18} /></span>
            <span className="grow col">
              <b style={{ fontWeight: 600 }}>Nạp dữ liệu mẫu để trình diễn</b>
              <span className="xs muted">{logs.demo ? 'Đang dùng dữ liệu mẫu' : '7 tuần tập luyện, cân nặng, bữa ăn'}</span>
            </span>
            <ChevronRight size={18} className="chev" />
          </button>
          <button className="lrow" onClick={() => setSheet('reset')}>
            <span className="li" style={{ color: 'var(--red-ink)' }}><Trash2 size={18} /></span>
            <span className="grow col"><b style={{ fontWeight: 600 }}>Xoá toàn bộ nhật ký</b><span className="xs muted">Buổi tập, cân nặng, bữa ăn, số đo</span></span>
            <ChevronRight size={18} className="chev" />
          </button>
        </section>

        <button className="btn line" style={{ color: 'var(--red-ink)' }} onClick={() => setSheet('logout')}><LogOut size={18} /> Đăng xuất</button>
      </Body>

      <InfoSheet open={sheet === 'info'} onClose={close} />

      <Sheet open={sheet === 'remind'} onClose={close} title="Giờ nhắc tập">
        <label className="field"><span>Nhắc lúc</span><input type="time" value={p.remindAt} onChange={(e) => e.target.value && update({ remindAt: e.target.value })} /></label>
        <p className="small muted" style={{ padding: '0 4px' }}>Nhắc vào các ngày có lịch tập ({days || 'chưa có lịch'}) khi FitCoach đang mở trên máy.</p>
        <button className="btn wide" onClick={close}>Xong</button>
      </Sheet>

      <Sheet open={sheet === 'privacy'} onClose={close} title="Quyền riêng tư">
        <div className="card tight small">
          <p><b>Camera chỉnh dáng:</b> hình ảnh được AI xử lý ngay trên điện thoại, không quay lại, không gửi lên máy chủ.</p>
          <p><b>Chụp món ăn:</b> ảnh chỉ dùng để nhận diện món trên máy, không lưu lại.</p>
          <p><b>Nhật ký và hồ sơ:</b> lưu trong trình duyệt của máy này. Xoá dữ liệu trang web hoặc bấm "Xoá toàn bộ nhật ký" là mất hẳn.</p>
        </div>
        <button className="btn wide" onClick={close}>Đã hiểu</button>
      </Sheet>

      <Sheet open={sheet === 'demo'} onClose={close} title="Nạp dữ liệu mẫu?">
        <p className="small muted" style={{ padding: '0 4px' }}>
          Thay nhật ký hiện tại bằng 7 tuần dữ liệu mẫu theo đúng lịch tập của bạn (buổi tập, cân nặng, giấc ngủ, bữa ăn, số đo) để trình diễn.
          Dữ liệu cũ trên máy này sẽ bị ghi đè.
        </p>
        <div className="row">
          <button className="btn ghost" style={{ flex: 1 }} onClick={close}>Huỷ</button>
          <button className="btn" style={{ flex: 1 }} onClick={loadDemo}>Nạp dữ liệu</button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'reset'} onClose={close} title="Xoá toàn bộ nhật ký?">
        <p className="small muted" style={{ padding: '0 4px' }}>Mọi buổi tập, cân nặng, bữa ăn, số đo và thử thách trên máy này sẽ bị xoá. Hồ sơ và lịch tập vẫn giữ nguyên.</p>
        <div className="row">
          <button className="btn ghost" style={{ flex: 1 }} onClick={close}>Huỷ</button>
          <button className="btn" style={{ flex: 1, background: 'var(--red)', color: '#fff' }} onClick={() => { store.resetAll(); close(); toast('Đã xoá nhật ký') }}>Xoá</button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'logout'} onClose={close} title="Đăng xuất?">
        <p className="small muted" style={{ padding: '0 4px' }}>Bạn sẽ quay lại màn chào. Nhật ký vẫn được giữ trên máy này.</p>
        <div className="row">
          <button className="btn ghost" style={{ flex: 1 }} onClick={close}>Huỷ</button>
          <button className="btn" style={{ flex: 1 }} onClick={() => { update({ onboarded: false }); nav('/welcome') }}>Đăng xuất</button>
        </div>
      </Sheet>
    </Page>
  )
}

/** Sửa thông tin cá nhân: tên, email, giới tính, tuổi, chiều cao, cân nặng */
function InfoSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile: p, update } = useProfile()
  const toast = useToast()
  const [d, setD] = useState({ name: '', email: '', sex: p.sex, age: '', height: '', weight: '' })
  useEffect(() => {
    if (open) setD({ name: p.name, email: p.email, sex: p.sex, age: String(p.age || ''), height: String(p.heightCm || ''), weight: kg1(p.weightKg) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const age = Number(d.age), height = Number(d.height), weight = Number(d.weight.replace(',', '.'))
  const ok = age >= 10 && age <= 100 && height >= 100 && height <= 230 && weight >= 25 && weight <= 250
  const save = () => {
    update({ name: d.name.trim(), email: d.email.trim(), sex: d.sex, age, heightCm: height, weightKg: Math.round(weight * 10) / 10 })
    onClose()
    toast('Đã lưu thông tin cá nhân')
  }
  return (
    <Sheet open={open} onClose={onClose} title="Thông tin cá nhân">
      <label className="field"><span>Họ và tên</span><input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} autoComplete="name" placeholder="Nhập họ và tên" /></label>
      <label className="field"><span>Email hoặc số điện thoại</span><input value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} autoComplete="username" placeholder="vidu@gmail.com" /></label>
      <Seg value={d.sex} onChange={(sex) => setD({ ...d, sex })} options={[{ v: 'female', label: 'Nữ' }, { v: 'male', label: 'Nam' }]} />
      <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <label className="field"><span>Tuổi</span><input className="num" style={{ fontSize: 22 }} inputMode="numeric" value={d.age} onChange={(e) => setD({ ...d, age: e.target.value.replace(/\D/g, '') })} /></label>
        <label className="field"><span>Cao (cm)</span><input className="num" style={{ fontSize: 22 }} inputMode="numeric" value={d.height} onChange={(e) => setD({ ...d, height: e.target.value.replace(/\D/g, '') })} /></label>
        <label className="field"><span>Nặng (kg)</span><input className="num" style={{ fontSize: 22 }} inputMode="decimal" value={d.weight} onChange={(e) => setD({ ...d, weight: e.target.value })} /></label>
      </div>
      <button className="btn wide" disabled={!ok} onClick={save}>Lưu thông tin</button>
    </Sheet>
  )
}
