'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Joyride, { Step, STATUS } from 'react-joyride'

// Shared Imports
import { getChallengeGuideSeenSetting, setChallengeGuideSeenSetting } from '@/shared/lib'
import { useAuth } from '@/shared/contexts'

export default function ChallengeJoyride() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [runTour, setRunTour] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const storeRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run on challenges page and after hydration
    if (!mounted || pathname !== '/challenges' || !user) {
      return
    }

    // Check if user has seen the guide
    const hasSeenGuide = getChallengeGuideSeenSetting(user.id)

    if (!hasSeenGuide) {
      // Wait a bit for page to load, then start tour
      const timer = setTimeout(() => {
        const desktopSteps: Step[] = [
          {
            target: 'body',
            content: '👋 Welcome to the CTF Challenges! Let me show you around.',
            placement: 'center',
            disableBeacon: true,
          },
          {
            target: '[data-tour="navbar-challenges"]',
            content: '💡 Browse all available challenges here.',
            placement: 'bottom',
          },
          {
            target: '[data-tour="navbar-scoreboard"]',
            content: '🏆 Check the rankings here.',
            placement: 'bottom',
          },
          {
            target: '[data-tour="navbar-notifications"]',
            content: '🔔 View notifications for information.',
            placement: 'top',
          },
          {
            target: '[data-tour="navbar-logs"]',
            content: '📜 View Logs for solved challenges history.',
            placement: 'top',
          },
          {
            target: '[data-tour="challenge-tutorial"]',
            content: '📚 Open the CTF tutorial PDF here.',
            placement: 'top',
          },
          {
            target: '[data-tour="challenge-filter-bar"]',
            content: '🔎 Use this filter bar to quickly find challenges by status, category, difficulty, and search.',
            placement: 'bottom',
          },
          {
            target: '[data-tour="challenge-filter-settings"]',
            content: '⚙️ Open settings to hide maintenance challenges and highlight team solves.',
            placement: 'bottom',
          },
        ]

        setSteps(desktopSteps)
        setRunTour(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [pathname, user, mounted])

  // Track element clicks
  useEffect(() => {
    if (!runTour || !steps.length || stepIndex === 0) return

    const step = steps[stepIndex]
    if (!step) return

    const handleClickOnTarget = () => {
      // Auto-advance to next step after short delay
      setTimeout(() => {
        if (storeRef.current) {
          storeRef.current.next()
        }
      }, 100)
    }

    const targetElement = document.querySelector(step.target as string) as HTMLElement
    if (targetElement) {
      targetElement.addEventListener('click', handleClickOnTarget, { once: false })
      return () => {
        targetElement.removeEventListener('click', handleClickOnTarget)
      }
    }
  }, [runTour, stepIndex, steps])

  if (!mounted) return null

  const handleTourEnd = () => {
    setRunTour(false)
    if (user) {
      setChallengeGuideSeenSetting(true)
    }
  }

  const handleTourStatus = (data: any) => {
    const { status, index } = data
    setStepIndex(index)

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      handleTourEnd()
    }
  }

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress={false}
      showSkipButton={true}
      hideBackButton={false}
      disableCloseOnEsc={true}
      disableOverlayClose={true}
      scrollDuration={500}
      getHelpers={(helpers) => {
        storeRef.current = helpers
      }}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#1f2937',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#3b82f6',
          textColor: '#fff',
          width: 300,
          zIndex: 10000,
        },
      }}
      callback={handleTourStatus}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip',
      }}
    />
  )
}
