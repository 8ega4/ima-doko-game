type IconName = 'sound' | 'mute' | 'challenge' | 'share' | 'image' | 'copy'

export function Icon({ name }: { name: IconName }) {
  if (name === 'sound' || name === 'mute') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
        {name === 'sound' ? <path d="M16 8c1.2 1 1.2 7 0 8m2.5-10.5c3 2.5 3 10.5 0 13" fill="none" /> : <path d="m16 9 5 6m0-6-5 6" fill="none" />}
      </svg>
    )
  }

  if (name === 'challenge') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 17c2.5-7 5-9 8-5s5.5 2 8-5" fill="none" />
        <circle cx="4" cy="17" r="2" fill="none" />
        <path d="m17 5 4 2-3 3" fill="none" />
      </svg>
    )
  }

  if (name === 'share') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16V3m0 0L8 7m4-4 4 4M5 11v9h14v-9" fill="none" />
      </svg>
    )
  }

  if (name === 'copy') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="8" width="11" height="12" rx="1" fill="none" />
        <path d="M16 8V4H5v12h3" fill="none" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="1" fill="none" />
      <circle cx="9" cy="10" r="2" fill="none" />
      <path d="m5 18 5-5 3 3 2-2 4 4" fill="none" />
    </svg>
  )
}
