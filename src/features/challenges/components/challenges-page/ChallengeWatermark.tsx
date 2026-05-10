'use client'

import APP from '@/config'
import { ImageWithFallback } from '@/shared/components'

export default function ChallengeWatermark() {
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.08] dark:opacity-[0.06] z-0">
      <ImageWithFallback
        src={APP.image_icon}
        alt={`${APP.shortName} watermark`}
        size={720}
        className="rounded-[3rem]"
      />
    </div>
  )
}
