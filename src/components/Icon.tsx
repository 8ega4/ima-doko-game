import {
  CopySimple,
  ImageSquare,
  PaperPlaneTilt,
  ShareNetwork,
  SpeakerHigh,
  SpeakerSlash,
} from '@phosphor-icons/react'

type IconName = 'sound' | 'mute' | 'challenge' | 'share' | 'image' | 'copy'

export function Icon({ name }: { name: IconName }) {
  const props = { 'aria-hidden': true, size: 24, weight: 'bold' as const }
  if (name === 'sound') return <SpeakerHigh {...props} />
  if (name === 'mute') return <SpeakerSlash {...props} />
  if (name === 'challenge') return <PaperPlaneTilt {...props} />
  if (name === 'share') return <ShareNetwork {...props} />
  if (name === 'copy') return <CopySimple {...props} />
  return <ImageSquare {...props} />
}
