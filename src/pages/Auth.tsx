import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { ActionBar, BackButton, Body, Page, Seg, useToast } from '../components/ui'
import { useProfile } from '../profile'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'signup' | 'login'>(params.get('mode') === 'login' ? 'login' : 'signup')
  const [show, setShow] = useState(false)
  const { profile, update } = useProfile()
  const nav = useNavigate()
  const toast = useToast()
  const signup = mode === 'signup'
  // Chưa có máy chủ: tài khoản chỉ lưu trên máy, đăng nhập xong vào thẳng app nếu đã thiết lập
  const next = () => nav(signup || !profile.onboarded ? '/setup' : '/home')

  return (
    <Page>
      <Body gap={18}>
        <div className="row"><BackButton to="/welcome" /></div>
        <div className="col" style={{ gap: 8 }}>
          <h1 className="h1">{signup ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h1>
          <p className="muted">{signup ? 'Lưu lịch tập và tiến độ của bạn trên mọi thiết bị.' : 'Đăng nhập để tiếp tục lịch tập của bạn.'}</p>
        </div>

        <Seg options={[{ v: 'signup', label: 'Đăng ký' }, { v: 'login', label: 'Đăng nhập' }]} value={mode} onChange={setMode} />

        <div key={mode} className="step-in col" style={{ gap: 10 }}>
          {signup && (
            <Field icon={<User size={18} />} label="Họ và tên" placeholder="Nhập họ và tên" value={profile.name}
              onChange={(v) => update({ name: v })} autoComplete="name" />
          )}
          <Field icon={<Mail size={18} />} label="Email hoặc số điện thoại" placeholder="vidu@gmail.com" value={profile.email}
            onChange={(v) => update({ email: v })} autoComplete="username" />
          <Field icon={<Lock size={18} />} label="Mật khẩu" placeholder="Tối thiểu 8 ký tự" type={show ? 'text' : 'password'}
            autoComplete={signup ? 'new-password' : 'current-password'}
            trailing={
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="text-ink-2">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            } />
          {!signup && <button className="link" style={{ alignSelf: 'flex-end' }}
            onClick={() => toast('Tài khoản đang lưu ngay trên máy này, chưa cần lấy lại mật khẩu')}>Quên mật khẩu?</button>}
        </div>

        <div className="row" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          <span className="divider grow" /> hoặc <span className="divider grow" />
        </div>
        <button className="btn wide" style={{ background: 'var(--surface)', color: 'var(--ink)' }} onClick={next}>
          <GoogleMark /> Tiếp tục với Google
        </button>
        <p className="xs muted" style={{ textAlign: 'center', marginTop: 'auto' }}>
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư.
        </p>
      </Body>
      <ActionBar>
        <button className="btn wide" onClick={next}>{signup ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
      </ActionBar>
    </Page>
  )
}

function Field({ icon, label, value, onChange, type = 'text', autoComplete, trailing, placeholder }: {
  icon: ReactNode; label: string; value?: string; onChange?: (v: string) => void; placeholder?: string
  type?: string; autoComplete?: string; trailing?: ReactNode
}) {
  return (
    <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 62 }}>
      <span style={{ color: 'var(--ink-2)', display: 'grid' }}>{icon}</span>
      <span className="col grow" style={{ gap: 2 }}>
        <span className="xs muted">{label}</span>
        <input type={type} value={value} onChange={onChange && ((e) => onChange(e.target.value))} autoComplete={autoComplete}
          placeholder={placeholder} aria-label={label} className="placeholder:font-normal placeholder:text-ink-3" />
      </span>
      {trailing}
    </label>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}
