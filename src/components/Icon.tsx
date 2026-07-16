import {
  ArrowCounterClockwise,
  ChatCircleDots,
  CopySimple,
  ImageSquare,
  PaperPlaneTilt,
  ShareNetwork,
  SpeakerHigh,
  SpeakerSlash,
  ThreadsLogo,
  XLogo,
} from '@phosphor-icons/react'

type IconName = 'sound' | 'mute' | 'challenge' | 'share' | 'image' | 'copy' | 'x' | 'threads' | 'line' | 'replay'

export function Icon({ name }: { name: IconName }) {
  const props = { 'aria-hidden': true, size: 24, weight: 'bold' as const }
  if (name === 'sound') return <SpeakerHigh {...props} />
  if (name === 'mute') return <SpeakerSlash {...props} />
  if (name === 'challenge') return <PaperPlaneTilt {...props} />
  if (name === 'share') return <ShareNetwork {...props} />
  if (name === 'copy') return <CopySimple {...props} />
  if (name === 'x') return <XLogo {...props} />
  if (name === 'threads') return <ThreadsLogo {...props} />
  if (name === 'line') return <ChatCircleDots {...props} />
  if (name === 'replay') return <ArrowCounterClockwise {...props} />
  return <ImageSquare {...props} />
}
