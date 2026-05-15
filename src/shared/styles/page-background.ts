import type { CSSProperties } from 'react'

export const PAGE_BG_COLOR_CLASS =
  "bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100"

export const PAGE_MIN_HEIGHT_OFFSET_VAR = '--page-min-height-offset'

export const PAGE_DEFAULT_MIN_HEIGHT_OFFSET = '60px'

export const PAGE_MIN_HEIGHT_WITH_OFFSET_CLASS =
  "min-h-[calc(100lvh_-_var(--page-min-height-offset,60px))]"

export type PageMinHeightStyle = CSSProperties & {
  [PAGE_MIN_HEIGHT_OFFSET_VAR]?: string
}

export function getPageMinHeightStyle(
  offset = PAGE_DEFAULT_MIN_HEIGHT_OFFSET
): PageMinHeightStyle {
  return {
    [PAGE_MIN_HEIGHT_OFFSET_VAR]: offset,
  }
}

export const PAGE_BG_BASE_CLASS =
  `${PAGE_MIN_HEIGHT_WITH_OFFSET_CLASS} ${PAGE_BG_COLOR_CLASS}`

export const PAGE_BG_ORBS_WRAPPER_CLASS =
  "fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.035),transparent_42%)]"

export const PAGE_BG_ORB_TOP_LEFT_CLASS =
  "absolute inset-x-0 top-0 h-24 bg-blue-500/[0.018] blur-2xl"

export const PAGE_BG_ORB_BOTTOM_RIGHT_CLASS =
  "hidden"

export const PAGE_MAIN_CONTAINER_4XL =
  "relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 py-3 sm:py-4"

export const PAGE_MAIN_CONTAINER_5XL =
  "relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 py-3 sm:py-4"

export const PAGE_MAIN_CONTAINER_6XL =
  "relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4"

export const PAGE_SECTION_GAP_CLASS =
  "space-y-5"

export const PAGE_SECTION_GAP_COMPACT_CLASS =
  "space-y-3 md:space-y-4"
