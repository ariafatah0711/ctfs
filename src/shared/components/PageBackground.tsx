import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import {
  PAGE_BG_BASE_CLASS,
  PAGE_BG_ORBS_WRAPPER_CLASS,
  PAGE_BG_ORB_BOTTOM_RIGHT_CLASS,
  PAGE_BG_ORB_TOP_LEFT_CLASS,
} from '@/shared/styles/page-background'

type PageBackgroundProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  showOrbs?: boolean
  selectionClassName?: string
}

export default function PageBackground({
  children,
  className,
  contentClassName,
  showOrbs = true,
  selectionClassName,
}: PageBackgroundProps) {
  return (
    <div className={cn(PAGE_BG_BASE_CLASS, selectionClassName, className)}>
      {showOrbs ? (
        <div className={PAGE_BG_ORBS_WRAPPER_CLASS}>
          <div className={PAGE_BG_ORB_TOP_LEFT_CLASS} />
          <div className={PAGE_BG_ORB_BOTTOM_RIGHT_CLASS} />
        </div>
      ) : null}

      {contentClassName ? (
        <div className={contentClassName}>
          {children}
        </div>
      ) : children}
    </div>
  )
}
