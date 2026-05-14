import type { Step } from 'react-joyride'

export const CHALLENGE_TOUR_VERSION = 1

type ChallengeTourStepOptions = {
  showDesktopSidebar: boolean
}

export function buildChallengeTourSteps({
  showDesktopSidebar,
}: ChallengeTourStepOptions): Step[] {
  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to Challenges. This quick tour covers the current tabs, filters, layout modes, focus mode, and challenge list.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="challenge-page-tabs"]',
      content: 'Use these tabs to switch between the challenge list and the events view. Focus mode hides this row until you leave focus mode.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-event-selector"]',
      content: 'Pick All, Main, or a specific event here. Locked events can ask you to join before their challenges are available.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-filter-bar"]',
      content: 'This filter bar keeps the main controls together: event selection, search, status, category, difficulty, sort, layout, and settings.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-search-control"]',
      content: 'Search by challenge text here. You can also press / on the challenges tab to jump into search quickly.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-feature-filter"]',
      content: 'This cycles feature filters: N for normal/all, T for task or question challenges, and S for service challenges.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-sort-toggle"]',
      content: 'Toggle sorting between the default challenge order and newest-first.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-layout-toggle"]',
      content: 'Cycle between grouped, category compact, and compact layouts. Category compact keeps category ordering without category headers.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-focus-toggle"]',
      content: 'Focus mode hides the tabs and event selector for a cleaner challenge view. It is restored on refresh for the same event, then turns off when you change event, tab, or page.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-filter-settings"]',
      content: 'Open filter settings to hide maintenance challenges or control team-solve highlighting.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="challenge-list"]',
      content: 'The challenge list updates from the same filters and keeps its incremental rendering optimization for larger lists.',
      placement: 'top',
    },
    {
      target: '[data-tour="challenge-card"]',
      content: 'Open a challenge card to read the prompt, use services or tasks when available, and submit flags.',
      placement: 'top',
    },
    {
      target: '[data-tour="challenge-events-tab"]',
      content: 'The Events tab shows available, upcoming, and past events. Select or join an event there when it is required.',
      placement: 'top',
    },
  ]

  if (!showDesktopSidebar) return steps

  return [
    ...steps.slice(0, 4),
    {
      target: '[data-tour="challenge-sidebar-filters"]',
      content: 'On desktop, this compact sidebar gives quick access to search, unsolved/all, and category filters while you scroll.',
      placement: 'right',
    },
    ...steps.slice(4),
  ]
}

export function getAvailableChallengeTourSteps(steps: Step[]): Step[] {
  if (typeof document === 'undefined') return []

  return steps.filter((step) => {
    if (step.target === 'body') return true
    if (typeof step.target !== 'string') return false
    return Boolean(document.querySelector(step.target))
  })
}
