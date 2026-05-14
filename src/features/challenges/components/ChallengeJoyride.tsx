'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
import Joyride, { STATUS } from 'react-joyride'
import type { CallBackProps, Step, StoreHelpers } from 'react-joyride'

// Shared Imports
import { useAuth } from '@/shared/contexts'
import { getChallengeGuideSeenSetting, setChallengeGuideSeenSetting } from '@/shared/lib'
import {
  CHALLENGE_TOUR_VERSION,
  buildChallengeTourSteps,
  getAvailableChallengeTourSteps,
} from '../lib/challenge-tour-steps'

export default function ChallengeJoyride() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [runTour, setRunTour] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const storeRef = useRef<StoreHelpers | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user) {
      return
    }

    const hasSeenGuide = getChallengeGuideSeenSetting(user.id, CHALLENGE_TOUR_VERSION)

    if (!hasSeenGuide) {
      const timer = setTimeout(() => {
        const showDesktopSidebar = window.matchMedia('(min-width: 1280px)').matches
        const nextSteps = getAvailableChallengeTourSteps(
          buildChallengeTourSteps({ showDesktopSidebar })
        )

        if (nextSteps.length > 0) {
          setSteps(nextSteps)
          setRunTour(true)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [user, mounted])

  // Track element clicks
  useEffect(() => {
    if (!runTour || !steps.length || stepIndex === 0) return

    const step = steps[stepIndex]
    if (!step || typeof step.target !== 'string') return

    const handleClickOnTarget = () => {
      // Auto-advance to next step after short delay
      setTimeout(() => {
        storeRef.current?.next()
      }, 100)
    }

    const targetElement = document.querySelector(step.target)
    if (!(targetElement instanceof HTMLElement)) return

    targetElement.addEventListener('click', handleClickOnTarget, { once: false })
    return () => {
      targetElement.removeEventListener('click', handleClickOnTarget)
    }
  }, [runTour, stepIndex, steps])

  if (!mounted) return null

  const handleTourEnd = () => {
    setRunTour(false)
    if (user) {
      setChallengeGuideSeenSetting(true, CHALLENGE_TOUR_VERSION)
    }
  }

  const handleTourStatus = (data: CallBackProps) => {
    const { status, index } = data
    setStepIndex(index)

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      handleTourEnd()
    }
  }

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress={false}
      showSkipButton={false}
      hideCloseButton={true}
      hideBackButton={false}
      disableCloseOnEsc={true}
      disableOverlayClose={true}
      disableScrolling={true}
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
        close: '',
        last: 'Finish',
        next: 'Next',
        skip: '',
      }}
    />
  )
}
