'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Joyride, { Step, STATUS } from 'react-joyride'
import { useAuth } from '@/contexts/AuthContext'

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

    // Check if user has seen the guide (using localStorage)
    const hasSeenGuide = localStorage.getItem(`ctf_tutorial_guide_seen_${user.id}`)

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
            target: '[data-tour="navbar-logo"]',
            content: '🏠 Click this logo to explore the home page.',
            placement: 'bottom',
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
            target: '[data-tour="navbar-rules"]',
            content: '📖 Read the competition rules here.',
            placement: 'bottom',
          },
          {
            target: '[data-tour="navbar-info"]',
            content: '📢 Find important info and announcements here.',
            placement: 'bottom',
          },
          {
            target: '[data-tour="navbar-profile"]',
            content: '👤 Open your profile to update your picture, bio, sosmed, and more.',
            placement: 'bottom',
          },
          {
            target: '[data-tour="navbar-notifications"]',
            content: '🔔 View notifications for recent solves and new challenges.',
            placement: 'bottom',
          },
          {
            target: '[data-tour="challenge-tutorial"]',
            content: '📚 Open the CTF tutorial PDF here.',
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
      localStorage.setItem(`ctf_tutorial_guide_seen_${user.id}`, 'true')
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
      showSkipButton={false}
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
