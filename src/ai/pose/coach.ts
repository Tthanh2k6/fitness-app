import { inFrame, type Body, type Limb } from './body'
import type { ExerciseAI, Issue, Phase } from './exercises'

export type Tone = 'good' | 'warn' | 'bad' | 'info'
export type Status = 'no-person' | 'adjust' | 'active'

export interface CoachState {
  status: Status
  /** Lời nhắc khi chưa chấm được (chưa thấy người, sai góc quay...) */
  hint: string | null
  reps: number
  goodReps: number
  holdMs: number
  metric: number | null
  phase: Phase
  feedback: { text: string; tone: Tone } | null
  issueJoints: Limb[]
  matched: boolean
  /** Lỗi gặp trong các lần đã đếm, để tổng kết cuối hiệp */
  mistakes: Record<string, { msg: string; count: number }>
  /** Câu cần đọc lên (đếm số, nhắc lỗi); sayId tăng mỗi khi có câu mới */
  say: string | null
  sayId: number
}

const ISSUE_DELAY = 300 // lỗi phải kéo dài bấy nhiêu ms mới tính, tránh nhấp nháy
const READY_DELAY = 800
const EVENT_MS = 1600
const SAY_GAP = 2500 // khoảng cách tối thiểu giữa hai lần đọc lời nhắc lỗi
const SMOOTH = 0.45

export class Coach {
  private ex: ExerciseAI
  private state: CoachState
  private smoothed: number | null = null
  private readySince: number | null = null
  private seen = new Map<string, number>()
  private repIssues = new Map<string, string>()
  private reachedDown = false
  private descending = false
  private lastT: number | null = null
  private event: { text: string; tone: Tone; until: number } | null = null
  private lastIssueSay = 0
  private started = false

  constructor(ex: ExerciseAI) {
    this.ex = ex
    this.state = {
      status: 'no-person', hint: 'Bước vào khung hình', reps: 0, goodReps: 0, holdMs: 0, metric: null,
      phase: 'up', feedback: null, issueJoints: [], matched: false, mistakes: {}, say: null, sayId: 0,
    }
  }

  reset() {
    const { sayId } = this.state
    this.state = { ...this.state, reps: 0, goodReps: 0, holdMs: 0, phase: 'up', mistakes: {}, say: null, sayId }
    this.repIssues.clear()
    this.reachedDown = false
    this.descending = false
    this.event = null
  }

  private announce(text: string) {
    this.state.say = text
    this.state.sayId += 1
  }

  private flash(text: string, tone: Tone, t: number, speak = false) {
    this.event = { text, tone, until: t + EVENT_MS }
    if (speak) this.announce(text)
  }

  private gate(body: Body | null): string | null {
    if (!body) return 'Bước vào khung hình'
    if (!inFrame(body, this.ex.need)) return 'Lùi ra xa để camera thấy cả người'
    const posture = this.ex.posture(body)
    if (posture) return posture
    if (body.shoulderSpread > 0.6) return 'Quay nghiêng người 90° so với camera'
    return null
  }

  update(body: Body | null, t: number): CoachState {
    const dt = this.lastT === null ? 0 : Math.min(t - this.lastT, 200)
    this.lastT = t
    const s = this.state
    const blocked = this.gate(body)

    if (blocked || !body) {
      this.readySince = null
      this.seen.clear()
      s.status = body ? 'adjust' : 'no-person'
      s.hint = blocked
      s.issueJoints = []
      s.matched = false
      s.feedback = this.event && this.event.until > t ? { text: this.event.text, tone: this.event.tone } : null
      return { ...s }
    }

    if (s.status !== 'active') {
      this.readySince ??= t
      if (t - this.readySince < READY_DELAY) {
        s.hint = 'Giữ nguyên, đang nhận diện...'
        return { ...s }
      }
      s.status = 'active'
      s.hint = null
      this.smoothed = null
      this.flash(this.started ? 'Tiếp tục' : 'Bắt đầu!', 'info', t, true)
      this.started = true
    }

    const raw = this.ex.metric.read(body)
    this.smoothed = this.smoothed === null ? raw : this.smoothed + SMOOTH * (raw - this.smoothed)
    const m = this.smoothed
    s.metric = Math.round(m)

    // Chỉ giữ những lỗi đã kéo dài đủ lâu
    const now = this.ex.checks(body, s.phase)
    const codes = new Set(now.map((i) => i.code))
    for (const code of [...this.seen.keys()]) if (!codes.has(code)) this.seen.delete(code)
    for (const i of now) if (!this.seen.has(i.code)) this.seen.set(i.code, t)
    const active: Issue[] = now.filter((i) => t - (this.seen.get(i.code) ?? t) >= ISSUE_DELAY)

    s.issueJoints = active.flatMap((i) => i.joints)
    s.matched = active.length === 0 && this.ex.matches(body)

    if (this.ex.mode === 'reps') this.countReps(m, active, t)
    else this.countHold(body, active, dt)

    if (active.length && t - this.lastIssueSay > SAY_GAP) {
      this.lastIssueSay = t
      this.announce(active[0].msg)
    }

    if (this.event && this.event.until > t) s.feedback = { text: this.event.text, tone: this.event.tone }
    else if (active.length) s.feedback = { text: active[0].msg, tone: 'bad' }
    else if (this.ex.mode === 'hold') s.feedback = { text: 'Tốt, giữ nguyên tư thế', tone: 'good' }
    else s.feedback = s.phase === 'down' ? { text: 'Đẩy lên!', tone: 'info' } : null
    return { ...s }
  }

  private countReps(m: number, active: Issue[], t: number) {
    const s = this.state
    const { down, up } = this.ex.metric
    if (s.phase === 'up') {
      if (m < up - 15) this.descending = true
      if (m <= down) {
        s.phase = 'down'
        this.reachedDown = true
      } else if (this.descending && m >= up) {
        this.descending = false
        this.repIssues.clear()
        this.flash('Chưa đủ sâu, xuống thấp hơn nữa', 'warn', t, true)
        return
      }
    }
    if (this.descending || s.phase === 'down') for (const i of active) this.repIssues.set(i.code, i.msg)

    if (s.phase === 'down' && m >= up && this.reachedDown) {
      s.reps += 1
      const clean = this.repIssues.size === 0
      if (clean) s.goodReps += 1
      for (const [code, msg] of this.repIssues) {
        const prev = s.mistakes[code]
        s.mistakes[code] = { msg, count: (prev?.count ?? 0) + 1 }
      }
      this.flash(clean ? `${s.reps} · Chuẩn!` : `${s.reps} · ${[...this.repIssues.values()][0]}`, clean ? 'good' : 'warn', t)
      this.announce(String(s.reps))
      this.repIssues.clear()
      this.reachedDown = false
      this.descending = false
      s.phase = 'up'
    }
  }

  private countHold(body: Body, active: Issue[], dt: number) {
    const s = this.state
    if (active.length === 0 && this.ex.holdOk?.(body)) {
      const before = Math.floor(s.holdMs / 1000)
      s.holdMs += dt
      const after = Math.floor(s.holdMs / 1000)
      if (after > before && after % 10 === 0) this.announce(`${after} giây`)
    } else {
      for (const i of active) {
        const prev = s.mistakes[i.code]
        if (!prev) s.mistakes[i.code] = { msg: i.msg, count: 1 }
      }
    }
  }
}
