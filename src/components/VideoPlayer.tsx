import { useState } from 'react'
import { ExternalLink, Play, Video } from 'lucide-react'
import { youtubeSearch, type Ex } from '../data/exercises'
import { VIDEOS } from '../data/videos'

/**
 * Video hướng dẫn nhúng từ YouTube. Chỉ hiện ảnh bìa, bấm mới tải trình phát
 * để trang mở nhanh và không tốn dữ liệu khi người tập không xem.
 */
export default function VideoPlayer({ e, autoPlay = false, credit = true }: { e: Ex; autoPlay?: boolean; credit?: boolean }) {
  const v = VIDEOS[e.id]
  const [playing, setPlaying] = useState(autoPlay)

  if (!v) {
    return (
      <a href={youtubeSearch(e)} target="_blank" rel="noopener noreferrer" className="row" style={{ background: 'var(--surface)', borderRadius: 22, padding: 14, gap: 14 }}>
        <span className="ch-ic bg-blue-soft text-blue-ink" style={{ width: 48, height: 48 }}><Video size={22} /></span>
        <span className="grow col" style={{ gap: 2 }}>
          <b style={{ fontWeight: 600 }}>Xem video hướng dẫn</b>
          <span className="xs muted">Mở YouTube với các video dạy bài {e.name}</span>
        </span>
        <ExternalLink size={18} className="chev" />
      </a>
    )
  }

  return (
    <div className="col" style={{ gap: 8 }}>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 24, background: 'var(--hero)' }}>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&playsinline=1&rel=0`}
            title={`Video hướng dẫn ${e.name}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label={`Phát video hướng dẫn ${e.name}`} style={{ position: 'absolute', inset: 0 }}>
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgb(20 22 26 / .25)' }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--surface)', color: 'var(--ink)' }}>
                <Play size={22} fill="currentColor" style={{ marginLeft: 2 }} />
              </span>
            </span>
          </button>
        )}
      </div>
      {credit && (
        <p className="row xs muted" style={{ gap: 8, padding: '0 4px' }}>
          <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Video: {v.channel}{v.lang === 'en' ? ' · tiếng Anh' : ''}</span>
          <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, fontWeight: 600, color: 'var(--ink-2)', textDecoration: 'underline' }}>Mở trên YouTube</a>
        </p>
      )}
    </div>
  )
}
